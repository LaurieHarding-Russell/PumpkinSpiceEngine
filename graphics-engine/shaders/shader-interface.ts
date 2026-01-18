import { mat4 } from "gl-matrix";
import { ModelReference } from "../model/model-reference";
import { Buffers } from "./buffer-factory";
import { ShaderProgramInfo } from "./load-shader";

export interface ShaderInterface {
    program: ShaderProgramInfo; 
    initMainShaderProgram(shaderProgram: WebGLProgram, buffers: Buffers): ShaderProgramInfo;
    setTexture(texture: TexImageSource | null): void;
    setProjection(projectionMatrix: mat4): void;
    setModelView: (...something: any) => void; // hacky hack.

    enable(): void;
    disable(): void;
}