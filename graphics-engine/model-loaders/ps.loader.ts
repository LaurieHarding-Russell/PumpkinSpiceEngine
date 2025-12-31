import { mat4 } from "gl-matrix";
import { BoneInfo, ModelInfo, PoseInfo, TextureInfo } from "../model-info";

export function loadPSObject(psFile: string, texture: TexImageSource | null): ModelInfo {

    let model: ModelInfo = {
        verts: [],
        faces: [],
        normals: [],
        textureCoordinates: new Map(),
        jointIds: [],
        texture: texture,
        skeleton: [],
        jointWeights: [],
        jointIdToNumber: new Map()
    }

    let lines = psFile.split("\n");
    if (lines[0] != "vertices: ") {
        throw new Error("Error not ps file!");
    }

    // Load Vertices
    let i = 1;
    while(lines[i] != "faces: ") {
        let line: Array<number> = lines[i].trim().split(" ").map(Number);
        model.verts.push(line)
        model.jointIds.push([]);
        model.jointWeights.push([]);
        i = i + 1;
    }

        // Load faces
    i = i + 1;
    while(i < lines.length && lines[i] != "normals: ") {
        let line: Array<number> = lines[i].trim().split(" ").map(Number);
        model.faces.push(line)
        i = i + 1;
    }

    // Load normals
    i = i + 1;
    while(i < lines.length && lines[i] != "textureCoordinates: ") {
        let line: Array<number> = lines[i].trim().split(" ").map(Number);
        model.normals.push(line)
        i = i + 1;
    }

    // Load texture coordinates
    i = i + 1;
    while(i < lines.length && lines[i] != "bones: ") {
        let line: Array<number> = lines[i].trim().split(" ").map(Number);
        let textureInfo: TextureInfo = {
            faceId: line[0],
            vertexId: line[1],
            textureLocation: [line[2], 1- line[3]]
        }
        if (model.textureCoordinates.has(textureInfo.faceId)) {
            model.textureCoordinates.get(textureInfo.faceId)?.push(textureInfo);
        } else {
            model.textureCoordinates.set(textureInfo.faceId, [textureInfo]);
        }
        i = i + 1;
    }

    // Load bones
    i = i + 1;
    while(i < lines.length && lines[i] != "skeleton: ") {
        let line: Array<string> = lines[i].trim().split(" ");
        let boneInfo: BoneInfo = {
            name: line[0],
            vertexId: Number(line[1]),
            weight: Number(line[2])
        }
        model.jointIds[boneInfo.vertexId].push(boneInfo.name);
        model.jointWeights[boneInfo.vertexId].push(boneInfo.weight);
        model.jointWeights[boneInfo.vertexId].forEach(value => 1.0/model.jointIds[boneInfo.vertexId].length); // FIXME, should get correct weights from blender
        i = i + 1;
    }

    // Load Skeleton
    i = i + 1;
    let numericIdCounter = 1;
    while(i < lines.length && lines[i] != "") {
        let line: Array<string> = lines[i].trim().split(" ");
        let id  = numericIdCounter;
        let name = line[0];
        let parent = line[1];
        let transform = mat4.fromValues(
            +line[2], +line[3], +line[4], +line[5],
            +line[6], +line[7], +line[8], +line[9],
            +line[10], +line[11], +line[12], +line[13],
            +line[14], +line[15], +line[16], +line[17]
        );
        let bone: PoseInfo = new PoseInfo(name, transform)
        bone.numericId = i;
        model.jointIdToNumber.set(bone.boneName, bone.numericId);
        if (name == parent) {
            model.skeleton.push(bone);
        } else {
            let parentPos = findBoneByName(parent, model);
            parentPos!.children.push(bone); // Assuming file is always in right order and children have parents.
        }
        i = i + 1;
        numericIdCounter = numericIdCounter + 1;
    }

    return model;
}

function findBoneByName(name: string, model: ModelInfo): PoseInfo | null {
    let bone: PoseInfo | null = null;
    for(let parentBone of model.skeleton) {
        bone = fineChildBoneOfBone(name, parentBone);
        if (bone != null) {
            return bone;
        }
    }
    return null;
}

function fineChildBoneOfBone(name: string, bone: PoseInfo): PoseInfo | null {
    if (bone.boneName == name) {
        return bone;
    } else {
        let selectedBone: PoseInfo | null = null;
        for(let childBone of bone.children) {
            selectedBone = fineChildBoneOfBone(name, childBone);
            if (selectedBone != null) {
                return selectedBone;
            }
        }
    }
    return null;
}