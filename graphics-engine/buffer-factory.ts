import { ModelReference, ShadersType } from "./model/model-reference";
import { ModelInfo } from "./model-info";

export const tileModalReference = "tileModalReference";

export interface Buffers {
    general: any
}

export const VALUES_PER_VERT = 3;
export const VALUES_PER_NORMAL = 3;
export const VALUES_PER_TEXTURE_COORDINATES = 2;

export const VALUES_PER_JOINT_ID = 3;
export const VALUES_PER_JOINT_WEIGHT = 3;

export const bufferStride = (VALUES_PER_VERT + VALUES_PER_NORMAL + VALUES_PER_TEXTURE_COORDINATES + VALUES_PER_JOINT_WEIGHT + VALUES_PER_JOINT_ID) * Float32Array.BYTES_PER_ELEMENT;


export class BufferFactory {

    private models: Array<ModelInfo> = [];
    private currentPositioin: number = 0;

    public defaultSkin!: TexImageSource;
    public modelReferences = new Map<string, ModelReference> ();

    constructor() {
    }
    
    public addModel(name: string, modelInfo: ModelInfo, shader: ShadersType | string): BufferFactory {
        this.models.push({
            ...modelInfo
        });

        let modelReference: ModelReference = {
            numberOfVerts: modelInfo.faces.length * 3, 
            offset: this.currentPositioin, 
            shader: shader,
            texture: modelInfo.texture,
            skeleton: modelInfo.skeleton
        };
        this.modelReferences.set(name, modelReference);

        this.currentPositioin = this.currentPositioin + modelReference.numberOfVerts;
        return this;
    }

    public create(gl: WebGL2RenderingContext): Buffers {

        const generalBuffer = gl.createBuffer();
        let arrayOfAll: Array<number> = [];
        for (let model of this.models) {
            for(let i = 0; i < model.faces.length; i++) {
                for (let j = 0; j !=3; j++) { // Assuuming triangles rule the world
                    let normalLocation = Math.floor(i/3);
                    let vertPos = model.faces[i][j];
                    arrayOfAll.push(...model.verts[vertPos]);

                    // FIXME, openGL interleaving is nasty :(
                    arrayOfAll.push(...model.normals[normalLocation]);
                    if (model.textureCoordinates.has(i)) {
                        arrayOfAll.push(...model.textureCoordinates.get(i)![j].textureLocation);
                    } else {
                        console.warn("uh, oh, model has no UV's!")
                        arrayOfAll.push(0,0);
                    }

                    let numericIds: Array<number> = [0,0,0];
                    let jointWeights: Array<number> = [1,0,0];
                    model.jointIds[j].forEach(jointName => {
                        numericIds.push(model.jointIdToNumber.get(jointName)!);
                    })
                    for (let jointWeightId = 0; jointWeightId != model.jointWeights[j].length; jointWeightId++) {
                        if (model.jointWeights[jointWeightId]) {
                            jointWeights[jointWeightId] = model.jointWeights[j][jointWeightId];
                        }
                    }

                    arrayOfAll.push(numericIds[0], numericIds[1], numericIds[2]);
                    arrayOfAll.push(jointWeights[0], jointWeights[1], jointWeights[2]);
                }
            }
        }
        // console.log("arrayOfAll", arrayOfAll);

        gl.bindBuffer(gl.ARRAY_BUFFER, generalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(arrayOfAll),
            gl.STATIC_DRAW);

        return {
            general: generalBuffer
          };
    }

}