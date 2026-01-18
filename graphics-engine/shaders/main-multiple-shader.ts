import { ShaderProgramInfo } from "./load-shader";
import { ModelReference, ShadersType } from "../model/model-reference";
import { ShaderInterface } from "./shader-interface";
import { VALUES_PER_VERT, bufferStride, VALUES_PER_NORMAL, VALUES_PER_TEXTURE_COORDINATES, Buffers } from "./buffer-factory";
import { mat4 } from "gl-matrix";

// We want all methods in here to essentially be static functions.
export class MainMultipleShader implements ShaderInterface {
    program!: MainMultipleShaderProgramInfo; 

    vao: WebGLVertexArrayObject;

    constructor(private webGl: WebGL2RenderingContext) {
        this.vao = webGl.createVertexArray()!;
    }

    initMainShaderProgram(shaderProgram: WebGLProgram, buffers: Buffers): ShaderProgramInfo {
        this.webGl.bindVertexArray(this.vao);

        const programInfo: MainMultipleShaderProgramInfo = {
            program: shaderProgram,
            type: ShadersType.mainMultiple,
            attribLocations: {
                vertexPosition: this.webGl.getAttribLocation(shaderProgram, 'inputPosition'),
                inputNormal: this.webGl.getAttribLocation(shaderProgram, 'inputNormal'),
                texcoordLocation: this.webGl.getAttribLocation(shaderProgram, 'inputUV'),
                modelViews: this.webGl.getAttribLocation(shaderProgram, 'modelview')
            },
            uniformLocations: {
                projectionMatrix: this.webGl.getUniformLocation(shaderProgram, 'projection')!,
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


    setTexture(texture: TexImageSource | null): void {
        if (texture != null) {
            this.webGl.bindTexture(this.webGl.TEXTURE_2D, this.program.uniformLocations.texture);
            this.webGl.texImage2D(this.webGl.TEXTURE_2D, 0, this.webGl.RGBA, this.webGl.RGBA, this.webGl.UNSIGNED_BYTE, texture);
            this.webGl.texParameteri(this.webGl.TEXTURE_2D, this.webGl.TEXTURE_WRAP_S, this.webGl.REPEAT);
            this.webGl.texParameteri(this.webGl.TEXTURE_2D, this.webGl.TEXTURE_WRAP_T, this.webGl.REPEAT);
            this.webGl.generateMipmap(this.webGl.TEXTURE_2D);
            this.webGl.texParameteri(this.webGl.TEXTURE_2D, this.webGl.TEXTURE_MIN_FILTER, this.webGl.NEAREST_MIPMAP_LINEAR);
            this.webGl.texParameteri(this.webGl.TEXTURE_2D, this.webGl.TEXTURE_MAG_FILTER, this.webGl.NEAREST_MIPMAP_LINEAR);
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

    setModelView(modelViews: Array<mat4>) {
        this.setupModelViewBuffer(modelViews, this.program)
    }

    enable(): void {
        this.webGl.bindVertexArray(this.vao);
    }

    disable(): void {
        this.webGl.bindVertexArray(null);
    }

    private setupModelViewBuffer(modelViews: Array<mat4>, programInfo: ShaderProgramInfo) {
        const matrixBuffer = this.webGl.createBuffer(); // probably expensive...

        this.webGl.bindBuffer(this.webGl.ARRAY_BUFFER, matrixBuffer);
        let bufferData = new Float32Array(modelViews.map(a => [...a]).flat()); // FIXME, better typing 
        this.webGl.bufferData(this.webGl.ARRAY_BUFFER, bufferData, this.webGl.DYNAMIC_DRAW);

        this.setMat4HlslAttributeData(this.program.attribLocations.modelViews);
    }

    private setMat4HlslAttributeData(modelViewAttributeLocation: GLint): void {
        const numberOfVerts = 4;
        const bytesPerMatrix = 4 * 16;
        for (let i = 0; i < numberOfVerts; i++) {
            const location = modelViewAttributeLocation + i;
            this.webGl.enableVertexAttribArray(location);
            const offset = i * 16;  // 4 floats per row, 4 bytes per float
            this.webGl.vertexAttribPointer(
                location,
                4,                // size (num values to pull from buffer per iteration)
                this.webGl.FLOAT,
                false,
                bytesPerMatrix,   // stride
                offset,
            );
            // this line says this attribute only changes for each 1 instance
            this.webGl.vertexAttribDivisor(location, 1);
        }
    }
}

export interface MainMultipleShaderProgramInfo extends ShaderProgramInfo {
    type: ShadersType.mainMultiple,
    attribLocations: AttributeLocations;
    uniformLocations: UniformLocation;
}

export interface AttributeLocations {
  vertexPosition: GLint;
  inputNormal: GLint;
  texcoordLocation: GLint;
  modelViews: GLint;
}

export interface UniformLocation {
  projectionMatrix: WebGLUniformLocation;
  normalMatrix: WebGLUniformLocation;
  texture: WebGLTexture;
}