import { PoseInfo } from "../model-info";

export enum ShadersType {
    main = "main",
    animated = "animated",
    terrian = 'terrian'
}

export interface ModelReference {
    offset: number;
    numberOfVerts: number;
    shader: ShadersType | string;
    texture: TexImageSource | null
    skeleton: Array<PoseInfo>;
}