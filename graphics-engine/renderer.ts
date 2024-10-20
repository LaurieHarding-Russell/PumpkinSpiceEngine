import { mat4 } from 'gl-matrix';
import { ModelReference, ShadersType } from "./model/model-reference";
import { openGlInitRenderer, ShaderProgramInfo } from "./load-shader";
import { BufferFactory, Buffers } from './buffer-factory';
import { Vector3 } from './model/vector';
import { Camera } from './model/camera';

export class Renderer {

  private shaderPrograms: Map<String, ShaderProgramInfo> = new Map();
  private webGl: WebGL2RenderingContext;
  private projectionMatrix = mat4.create();
  private bufferFactory!: BufferFactory;
  private setRenderProgram: ShadersType | string | undefined;
  private buffers!: Buffers;
    
  public constructor(webGl: WebGL2RenderingContext) {
    this.webGl = webGl;
  }

  public async start(bufferFactory: BufferFactory): Promise<void> {
    this.bufferFactory = bufferFactory;
    this.buffers = this.bufferFactory.create(this.webGl);

    this.webGl.clearColor(1.0, 1.0, 1.0, 1.0);
    this.webGl.enable(this.webGl.DEPTH_TEST);
    this.webGl.depthFunc(this.webGl.LESS);
    this.webGl.clear(this.webGl.DEPTH_BUFFER_BIT);

    this.shaderPrograms.set(ShadersType.main, openGlInitRenderer(this.webGl, this.buffers));
    this.useShaderProgram(ShadersType.main);
  }

  public addShader(shaderName: string, program: ShaderProgramInfo): void {
    if (shaderName == ShadersType.main) {
      throw "Can't override main shader";
    }
    this.shaderPrograms.set(shaderName, program);
  }

  public getProjectionMatrix(): mat4 {
    return mat4.clone(this.projectionMatrix);
  }


  public setProjectionMatrix(camera: Camera) {
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = this.webGl.canvas.width / this.webGl.canvas.height
    const zNear = 0.1;
    const zFar = 100.0;

    mat4.perspective(this.projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    mat4.translate(
      this.projectionMatrix,
      this.projectionMatrix,
      [-camera.position.x, -camera.position.y, camera.position.z]);
      
    mat4.rotateX(
      this.projectionMatrix,
      this.projectionMatrix,
      camera.rotation.x
    );

    mat4.rotateY(
      this.projectionMatrix,
      this.projectionMatrix,
      camera.rotation.y
    );

    mat4.rotateZ(
      this.projectionMatrix,
      this.projectionMatrix,
      camera.rotation.z
    );
  }

  public renderMain(location: Vector3, modelReference: ModelReference) {
    this.useShaderProgram(modelReference.shader);
    this.render(location, modelReference)
  }

  public render(location: Vector3, modelReference: ModelReference) {
    let programInfo = this.shaderPrograms.get(modelReference.shader)!;

    this.setRenderLocation(programInfo, location);
    this.bindModelTexture(modelReference, programInfo);
    this.bindNormalMatrix(programInfo);

    // this.webGl.drawArrays(this.webGl.TRIANGLES, modelReference.offset, modelReference.numberOfVerts);
  }

  private bindNormalMatrix(programInfo: ShaderProgramInfo) {
    const normalMatrix = mat4.create();
    mat4.identity(normalMatrix);

    this.webGl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);
  }

  private setRenderLocation(programInfo: ShaderProgramInfo, location: Vector3): void {
    this.webGl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      this.projectionMatrix);

    const modelViewMatrix = mat4.create();

    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [location.x, location.y, location.z]); // amount to translate

    this.webGl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  }

  private bindModelTexture(modelReference: ModelReference, programInfo: ShaderProgramInfo): void {
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
    if (this.setRenderProgram != shaderProgram) {
      this.webGl.useProgram(programInfo);
      this.setRenderProgram = shaderProgram;
    }
  }
}