import { mat4 } from 'gl-matrix';
import { ModelReference, ShadersType } from "./model/model-reference";
import { BufferFactory, Buffers } from './shaders/buffer-factory';
import { Vector3 } from './model/vector';
import { Camera } from './model/camera';
import { phongVectorSource, phongFragmentSource } from "./shaders/phong-blin";
import { cameraBasedProjection, matrixFromLocationRotation } from './util';
import { fragmentInstancing, vectorInstancing } from './shaders/instancing';
import { ShaderInterface } from './shaders/shader-interface';
import { MainMultipleShader } from './shaders/main-multiple-shader';
import { initShaderProgram } from './shaders/load-shader';
import { MainShader } from './shaders/main-shader';

export class Renderer {

  private shaderPrograms = new Map<string, ShaderInterface>();
  
  private webGl: WebGL2RenderingContext;

  private projectionMatrix = mat4.create();

  private bufferFactory!: BufferFactory;

  private currentRender: ShadersType | string | undefined = undefined;

  public buffers!: Buffers;
    
  public constructor(webGl?: WebGL2RenderingContext) {
    this.webGl = webGl as WebGL2RenderingContext; // HACK: think about this
  }

  public setWebGl(webGl: WebGL2RenderingContext) {
    this.webGl = webGl;
  }

  public async initialize(bufferFactory: BufferFactory): Promise<void> {

    this.bufferFactory = bufferFactory;
    this.buffers = this.bufferFactory.create(this.webGl);

    this.setOpenGlDefaults();

    const shaderProgram = initShaderProgram(this.webGl, phongVectorSource, phongFragmentSource);
    let mainShader = new MainShader(this.webGl);
    mainShader.initMainShaderProgram(shaderProgram, this.buffers);
    this.shaderPrograms.set(ShadersType.main, mainShader);


    const shaderInstancedProgram = initShaderProgram(this.webGl, vectorInstancing, fragmentInstancing);
    let mainMultipleShader = new MainMultipleShader(this.webGl);
    mainMultipleShader.initMainShaderProgram(shaderInstancedProgram, this.buffers);
    this.shaderPrograms.set(ShadersType.mainMultiple, mainMultipleShader);
   }

  public addShader(shaderName: string, shader: ShaderInterface): void {
    this.shaderPrograms.set(shaderName, shader);
  }

  public getShader(shaderName: string): ShaderInterface {
    return this.shaderPrograms.get(shaderName)!;
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
    let shader = this.shaderPrograms.get(modelReference.shader)!;
    this.useShaderProgram(modelReference.shader);

    shader.setProjection(this.projectionMatrix)
    shader.setModelView(location, rotation);

    this.webGl.drawArrays(this.webGl.TRIANGLES, modelReference.offset, modelReference.numberOfVerts);
  }

  public renderMultiple(locations: Array<Vector3>, rotations: Array<Vector3>, modelReference: ModelReference) {
    let shader = this.shaderPrograms.get(modelReference.shader)!;
    this.useShaderProgram(modelReference.shader);

    shader.setProjection(this.projectionMatrix)

    let modelViews: Array<mat4> = this.toModelViews(locations, rotations);
    shader.setModelView(modelViews);

    let numInstances = modelViews.length;

    this.webGl.drawArraysInstanced(
        this.webGl.TRIANGLES,
        modelReference.offset, 
        modelReference.numberOfVerts,
        numInstances
    );
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

  private useShaderProgram(shaderProgram: ShadersType | string): void {
    let programInfo: ShaderInterface = this.shaderPrograms.get(shaderProgram)!;
    if (this.currentRender != shaderProgram) {
      let currentShader = this.shaderPrograms.get(shaderProgram);
      if (currentShader) {
        currentShader.disable();
      }
      programInfo.enable();
      this.webGl.useProgram(programInfo.program.program);

      this.currentRender = shaderProgram;
    }
  }
}