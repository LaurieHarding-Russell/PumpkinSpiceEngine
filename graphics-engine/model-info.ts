import { mat4 } from "gl-matrix";

export interface ModelInfo {
    verts: Array<Array<number>>;
    faces: Array<Array<number>>;
    normals: Array<Array<number>>;

    textureCoordinates: Map<number, Array<TextureInfo>>; // Map of faces pointing to an array of Texture info. Assuming that vets array is the same order.
    jointIds: Array<Array<string>>;
    jointWeights: Array<Array<number>>;

    texture: TexImageSource | null;
    skeleton: Array<PoseInfo>;
    jointIdToNumber: Map<string, number>;
}

export interface TextureInfo {
    faceId: number;
    vertexId: number;
    textureLocation: Array<number>;
}

export interface BoneInfo {
    name: string;
    vertexId: number;
    weight: number;
}

export class PoseInfo {
    numericId: number = 0;
    boneName: string;
    children: Array<PoseInfo> = [];
    localBindTransform: mat4;
    inverseTransform: mat4;

    constructor(boneName: string, transform: mat4) {
        this.boneName = boneName;
        this.localBindTransform = transform;
        this.inverseTransform = mat4.create();
    }

    calculateInverseTransform(parentTransform: mat4) {
        let bindTransform = mat4.create();
         mat4.multiply(bindTransform, parentTransform, this.localBindTransform);
         mat4.invert(this.inverseTransform, bindTransform);
         for(let child of this.children) {
            child.calculateInverseTransform(bindTransform);
         }
    }
}

export function getJointArray(skeleton: Array<PoseInfo>): Array<PoseInfo> {
    let array: Array<PoseInfo> = [];
    for (let i = 0; i != skeleton.length; i++) {
        array.push(skeleton[i]);
        array.push(...getJointArray(skeleton[i].children));
    }
    array.sort((a,b) => a.numericId - b.numericId);
    return array;
}