import { mat4 } from 'gl-matrix';
import { ModelReference, ShadersType } from "./model/model-reference";
import { BufferFactory, Buffers } from './buffer-factory';
import { Vector3 } from './model/vector';
import { Camera } from './model/camera';
import { openGlInitRenderer, ShaderProgramInfo } from './load-shader';
import { phongVectorSource, phongFragmentSource } from "./shaders/phong-blin";
import { cameraBasedProjection, matrixFromLocationRotation } from './util';

export class Renderer {

  private shaderPrograms = new Map<string, ShaderProgramInfo>();
  
  private webGl: WebGL2RenderingContext;

  private projectionMatrix = mat4.create();

  private bufferFactory!: BufferFactory;

  private currentRender: ShadersType | string | undefined = undefined;

  private buffers!: Buffers;
    
  public constructor(webGl?: WebGL2RenderingContext) {
    this.webGl = webGl as WebGL2RenderingContext; // HACK: think about this
  }

  public setWebGl(webGl: WebGL2RenderingContext) {
    this.webGl = webGl;
  }

  public async start(bufferFactory: BufferFactory): Promise<void> {

    this.bufferFactory = bufferFactory;
    this.buffers = this.bufferFactory.create(this.webGl);

    this.setOpenGlDefaults();

    this.shaderPrograms.set(ShadersType.main, openGlInitRenderer(this.webGl, this.buffers, phongVectorSource, phongFragmentSource));
   }

  public addShader(shaderName: string, source: {vectorSource: string, fragSource: string}): void {
    if (shaderName == ShadersType.main) {
      throw new Error("Can't override main shader");
    }
    if (this.buffers == null) {
      throw new Error("Please run start before adding a shader. Buffer undefined.");
    }
    this.shaderPrograms.set(shaderName, openGlInitRenderer(this.webGl, this.buffers, source.vectorSource, source.fragSource));
  }

  public getProjectionMatrix(): mat4 {
    return mat4.clone(this.projectionMatrix);
  }

  public setProjectionMatrix(projectionMatrix: mat4): void {
    this.projectionMatrix = projectionMatrix;
  }

  public setProjectionMatrixByCamera(camera: Camera): void {
    this.projectionMatrix = cameraBasedProjection(camera, this.webGl)
  }

  public renderMain(location: Vector3, rotation: Vector3, modelReference: ModelReference) {
    let programInfo = this.shaderPrograms.get(modelReference.shader)!;
    this.useShaderProgram(modelReference.shader);
    this.webGl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
        false,
        this.projectionMatrix);
    this.setModelView(location, rotation, programInfo);
    this.setTexture(modelReference, programInfo);
    this.setNormal(programInfo);
    this.webGl.drawArrays(this.webGl.TRIANGLES, modelReference.offset, modelReference.numberOfVerts);
  }

  public renderMultiple(locations: Array<Vector3>, rotations: Array<Vector3>, modelReference: ModelReference) {
    let programInfo = this.shaderPrograms.get(modelReference.shader)!;
    this.useShaderProgram(modelReference.shader);

    this.webGl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
        false,
        this.projectionMatrix);
      

    let modelViews: Array<mat4> = this.toModelViews(locations, rotations);
    let numInstances = modelViews.length;
    
    this.setupModelViewBuffer(modelViews, programInfo);


    this.setTexture(modelReference, programInfo);
    this.setNormal(programInfo);


    this.webGl.drawArraysInstanced(
        this.webGl.TRIANGLES,
        modelReference.offset, 
        modelReference.numberOfVerts,
        numInstances
    );
  }

  private setupModelViewBuffer(modelViews: Array<mat4>, programInfo: ShaderProgramInfo) {
    let numInstances = modelViews.length;
    
    const matrixBuffer = this.webGl.createBuffer(); // probably expensive...
    let modelViewAttributeLocation = this.webGl.getAttribLocation(programInfo.program, 'modelview')
    this.webGl.bufferData(this.webGl.ARRAY_BUFFER, modelViews.length * 16, this.webGl.DYNAMIC_DRAW);
    this.webGl.bindBuffer(this.webGl.ARRAY_BUFFER, matrixBuffer);
    let bufferData = new Float32Array(modelViews.map(a => [...a]).flat()); // FIXME, better typing 
    this.webGl.bufferData(this.webGl.ARRAY_BUFFER, bufferData, this.webGl.STATIC_DRAW);

    // set all 4 attributes for matrix
    const bytesPerMatrix = 4 * 16;
    for (let i = 0; i < 4; ++i) {
        const loc = modelViewAttributeLocation + i;
        this.webGl.enableVertexAttribArray(loc);
        // note the stride and offset
        const offset = i * 16;  // 4 floats per row, 4 bytes per float
        this.webGl.vertexAttribPointer(
            loc,              // location
            4,                // size (num values to pull from buffer per iteration)
            this.webGl.FLOAT,         // type of data in buffer
            false,            // normalize
            bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
            offset,           // offset in buffer
        );
        // this line says this attribute only changes for each 1 instance
        this.webGl.vertexAttribDivisor(loc, 1);
    }
  }

  private toModelViews(locations: Array<Vector3>, rotations: Array<Vector3>): Array<mat4> {
    let modelViews: Array<mat4> = [];
    for (let i = 0; i != locations.length; i++) {
      modelViews.push(matrixFromLocationRotation(locations[i], rotations[i]));
    }
    return modelViews;
  }

  private setOpenGlDefaults() {
    this.webGl.clearColor(1.0, 1.0, 1.0, 1.0);
    this.webGl.enable(this.webGl.DEPTH_TEST);
    this.webGl.depthFunc(this.webGl.LESS);
    this.webGl.clear(this.webGl.DEPTH_BUFFER_BIT);
  }


  private setModelView(location: Vector3, rotation: Vector3, programInfo: ShaderProgramInfo) {
    const modelViewMatrix = matrixFromLocationRotation(location, rotation);

    this.webGl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  }

  private setNormal(programInfo: ShaderProgramInfo) {
    const normalMatrix = mat4.create();
    mat4.identity(normalMatrix);

    this.webGl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);
  }

  private setTexture(modelReference: ModelReference, programInfo: ShaderProgramInfo) {
    if (modelReference.texture != null) {
      this.webGl.bindTexture(this.webGl.TEXTURE_2D, programInfo.uniformLocations.texture);
      this.webGl.texImage2D(this.webGl.TEXTURE_2D, 0, this.webGl.RGBA, this.webGl.RGBA, this.webGl.UNSIGNED_BYTE,
        modelReference.texture);
      this.webGl.texParameteri(this.webGl.TEXTURE_2D, this.webGl.TEXTURE_WRAP_S, this.webGl.REPEAT);
      this.webGl.texParameteri(this.webGl.TEXTURE_2D, this.webGl.TEXTURE_WRAP_T, this.webGl.REPEAT);
      this.webGl.generateMipmap(this.webGl.TEXTURE_2D);
    } else {
      this.webGl.bindTexture(this.webGl.TEXTURE_2D, programInfo.uniformLocations.texture);
      this.webGl.texImage2D(this.webGl.TEXTURE_2D, 0, this.webGl.RGBA, this.webGl.RGBA, this.webGl.UNSIGNED_BYTE,
        this.bufferFactory.defaultSkin);
      this.webGl.generateMipmap(this.webGl.TEXTURE_2D);
    }
  }

  private useShaderProgram(shaderProgram: ShadersType | string): void {
    let programInfo: WebGLProgram = this.shaderPrograms.get(shaderProgram)!.program;
    if (this.currentRender != shaderProgram) {
      this.webGl.useProgram(programInfo);
      this.currentRender = shaderProgram;
    }
  }
}