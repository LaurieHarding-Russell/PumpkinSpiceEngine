import { mat4 } from 'gl-matrix';
import { ModelReference, ShadersType } from "./model/model-reference";
import { openGlInitMainRenderer } from "./load-shader";
import { BufferFactory, Buffers } from './buffer-factory';
import { Vector3 } from './model/vector';
import { Camera } from './model/camera';

export class Renderer {

  public getProjectionMatrix(): mat4 {
    return mat4.clone(this.projectionMatrix);
  }

  private programInfo: any;
  
  private webGl: WebGL2RenderingContext;

  private projectionMatrix = mat4.create();

  private bufferFactory!: BufferFactory;

  private currentRender: ShadersType | undefined = undefined;

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

    this.programInfo = openGlInitMainRenderer(this.webGl, this.buffers);
    
    this.webGl.useProgram(this.programInfo.program);
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
    switch (modelReference.shader) {
      default:
      case ShadersType.phongBlinn:
        this.renderPhongBlinn(location, modelReference)
    }
  }

  public renderPhongBlinn(location: Vector3, modelReference: ModelReference) {

    if (this.currentRender != ShadersType.phongBlinn) {
      this.webGl.useProgram(this.programInfo.program);
      this.currentRender = ShadersType.phongBlinn;
    }

    this.webGl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
        false,
        this.projectionMatrix);

    const modelViewMatrix = mat4.create();

    mat4.translate(
        modelViewMatrix,     // destination matrix
        modelViewMatrix,     // matrix to translate
        [location.x, location.y, location.z]);  // amount to translate

    this.webGl.uniformMatrix4fv(
        this.programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    if (modelReference.texture != null) {
      this.webGl.bindTexture(this.webGl.TEXTURE_2D, this.programInfo.uniformLocations.texture);
      this.webGl.texImage2D(this.webGl.TEXTURE_2D, 0, this.webGl.RGBA, this.webGl.RGBA, this.webGl.UNSIGNED_BYTE,
        modelReference.texture);
      this.webGl.texParameteri(this.webGl.TEXTURE_2D, this.webGl.TEXTURE_WRAP_S, this.webGl.REPEAT);
      this.webGl.texParameteri(this.webGl.TEXTURE_2D, this.webGl.TEXTURE_WRAP_T, this.webGl.REPEAT);
      this.webGl.generateMipmap(this.webGl.TEXTURE_2D);
    } else {
      this.webGl.bindTexture(this.webGl.TEXTURE_2D, this.programInfo.uniformLocations.texture);
      this.webGl.texImage2D(this.webGl.TEXTURE_2D, 0, this.webGl.RGBA, this.webGl.RGBA, this.webGl.UNSIGNED_BYTE,
        this.bufferFactory.defaultSkin);
        this.webGl.generateMipmap(this.webGl.TEXTURE_2D);
    }

    const normalMatrix = mat4.create();
    mat4.identity(normalMatrix)

    this.webGl.uniformMatrix4fv(
      this.programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);

    this.webGl.drawArrays(this.webGl.TRIANGLES, modelReference.offset, modelReference.numberOfVerts);
  }
}