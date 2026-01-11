import { Vector3 } from '@pumkinspicegames/pumpkinSpiceEngine/model/vector';
import { ModelReference, ShadersType } from '@pumkinspicegames/pumpkinSpiceEngine/model/model-reference';
import { mat4 } from "gl-matrix";
import { ShaderInterface } from '@pumkinspicegames/pumpkinSpiceEngine/shaders/shader-interface';
import { Buffers, bufferStride, VALUES_PER_NORMAL, VALUES_PER_TEXTURE_COORDINATES, VALUES_PER_VERT } from '@pumkinspicegames/pumpkinSpiceEngine/shaders/buffer-factory';
import { matrixFromLocationRotation } from '@pumkinspicegames/pumpkinSpiceEngine/util';
import { ShaderProgramInfo } from '@pumkinspicegames/pumpkinSpiceEngine/shaders/load-shader';

// We want all methods in here to essentially be static functions.
export class CustomShader implements ShaderInterface {
    program!: CustomShaderProgramInfo; 
    vao: WebGLVertexArrayObject;

    constructor(private webGl: WebGL2RenderingContext) {
        this.vao = webGl.createVertexArray()!;
    }

    
    initMainShaderProgram(shaderProgram: WebGLProgram, buffers: Buffers): ShaderProgramInfo {
        this.webGl.bindVertexArray(this.vao);
        
        const programInfo: CustomShaderProgramInfo = {
            program: shaderProgram,
            type: SHADER_NAME,
            attribLocations: {
                vertexPosition: this.webGl.getAttribLocation(shaderProgram, 'inputPosition'),
                inputNormal: this.webGl.getAttribLocation(shaderProgram, 'inputNormal'),
                texcoordLocation: this.webGl.getAttribLocation(shaderProgram, 'inputUV'),
            },
            uniformLocations: {
                projectionMatrix: this.webGl.getUniformLocation(shaderProgram, 'projection')!,
                modelViewMatrix: this.webGl.getUniformLocation(shaderProgram, 'modelview')!,
                normalMatrix: this.webGl.getUniformLocation(shaderProgram, 'normalMat')!,
                texture: this.webGl.createTexture()!
            },
        };
        const normalize = false;

        // 0 = use type and numComponents above
        const offset = 0; // how many bytes inside the buffer to start from

        this.webGl.bindBuffer(this.webGl.ARRAY_BUFFER, buffers.general);
        this.webGl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            VALUES_PER_VERT,
            this.webGl.FLOAT,
            normalize,
            bufferStride,
            offset);
        this.webGl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        this.webGl.vertexAttribPointer(
            programInfo.attribLocations.inputNormal,
            VALUES_PER_NORMAL,
            this.webGl.FLOAT,
            normalize,
            bufferStride,
            VALUES_PER_VERT * Float32Array.BYTES_PER_ELEMENT);
        this.webGl.enableVertexAttribArray(programInfo.attribLocations.inputNormal);

        this.webGl.vertexAttribPointer(
            programInfo.attribLocations.texcoordLocation,
            VALUES_PER_TEXTURE_COORDINATES,
            this.webGl.FLOAT,
            normalize,
            bufferStride,
            (VALUES_PER_VERT + VALUES_PER_NORMAL) * Float32Array.BYTES_PER_ELEMENT);
        this.webGl.enableVertexAttribArray(programInfo.attribLocations.texcoordLocation);

        this.program = programInfo;
        this.webGl.bindVertexArray(null);
        return programInfo;
    }


    enable(): void {
        this.webGl.bindVertexArray(this.vao);
    }

    disable(): void {
        this.webGl.bindVertexArray(null);
    }

    setTexture(modelReference: ModelReference): void {
        if (modelReference.texture != null) {
            this.webGl.bindTexture(this.webGl.TEXTURE_2D, this.program.uniformLocations.texture);
            this.webGl.texImage2D(this.webGl.TEXTURE_2D, 0, this.webGl.RGBA, this.webGl.RGBA, this.webGl.UNSIGNED_BYTE,
            modelReference.texture);
            this.webGl.texParameteri(this.webGl.TEXTURE_2D, this.webGl.TEXTURE_WRAP_S, this.webGl.REPEAT);
            this.webGl.texParameteri(this.webGl.TEXTURE_2D, this.webGl.TEXTURE_WRAP_T, this.webGl.REPEAT);
            this.webGl.generateMipmap(this.webGl.TEXTURE_2D);
        } else {
            throw new Error("No texture present");
        }
    }

    setProjection(projectionMatrix: mat4) {
        this.webGl.uniformMatrix4fv(
        this.program.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
    }

    setModelView(location: Vector3, rotation: Vector3) {
        const modelViewMatrix = matrixFromLocationRotation(location, rotation);

        this.webGl.uniformMatrix4fv(
            this.program.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        );
    }
}


export const SHADER_NAME = "CUSTOM";

export interface CustomShaderProgramInfo extends ShaderProgramInfo {
    type: "CUSTOM",
    attribLocations: AttributeLocations;
    uniformLocations: UniformLocation;
}

export interface AttributeLocations {
  vertexPosition: GLint;
  inputNormal: GLint;
  texcoordLocation: GLint;
}

export interface UniformLocation {
  projectionMatrix: WebGLUniformLocation;
  modelViewMatrix: WebGLUniformLocation;
  normalMatrix: WebGLUniformLocation;
  texture: WebGLTexture;
}
