import { PoseInfo } from "../model-info";

export enum ShadersType {
    phongBlinn = "phongBlin",
    animated = "animated",
    terrian = 'terrian'
}

export interface ModelReference {
    offset: number;
    numberOfVerts: number;
    shader: ShadersType;
    texture: TexImageSource | null
    skeleton: Array<PoseInfo>;
}