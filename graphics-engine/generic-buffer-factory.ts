// import { ModelReference, ShadersType } from "./model/model-reference";
// import { ModelInfo } from "./model-info";

// export const tileModalReference = "tileModalReference";

// export interface Buffers {
//     general: any
// }

// export const VALUES_PER_VERT = 3;
// export const VALUES_PER_NORMAL = 3;
// export const VALUES_PER_TEXTURE_COORDINATES = 2;

// export const VALUES_PER_JOINT_ID = 3;
// export const VALUES_PER_JOINT_WEIGHT = 3;

// export const bufferStride = (VALUES_PER_VERT + VALUES_PER_NORMAL + VALUES_PER_TEXTURE_COORDINATES + VALUES_PER_JOINT_WEIGHT + VALUES_PER_JOINT_ID) * Float32Array.BYTES_PER_ELEMENT;

// interface GenericInput {
//     verts: Array<Array<number>>;
//     faces: Array<Array<number>>;
// }
// interface GenericInputGeneric {
//     [key: string]: [Array<number> | Array<Array<number>>];
// }

// interface GenericModelReference {
//     offset: number;
//     numberOfVerts: number;
//     shader: ShadersType | string;
//     texture: TexImageSource | null
// }

// FIXME, todo
// export class GenericBufferFactory<T extends GenericInput & GenericInputGeneric> {

//     private models: Array<GenericInput> = [];
//     private currentPositioin: number = 0;

//     public defaultSkin!: TexImageSource;
//     public modelReferences = new Map<string, GenericModelReference> ();

//     constructor() {
//     }
    
//     public addModel(name: string, modelInfo: T, shader: ShadersType | string): GenericBufferFactory<T> {
//         this.models.push({
//             ...modelInfo
//         });

//         Object.keys(modelInfo);

//         let modelReference: GenericModelReference = {
//             numberOfVerts: modelInfo.faces.length * 3,
//             offset: this.currentPositioin,
//             shader: shader,
//             texture: null
//         };
//         this.modelReferences.set(name, modelReference);

//         this.currentPositioin = this.currentPositioin + modelReference.numberOfVerts;
//         return this;
//     }

//     public create(gl: WebGL2RenderingContext): Buffers {
//         let arrayOfAll: Array<number> = this.createInterleavingArray();

//         const generalBuffer = gl.createBuffer();
//         gl.bindBuffer(gl.ARRAY_BUFFER, generalBuffer);
//         gl.bufferData(gl.ARRAY_BUFFER,
//             new Float32Array(arrayOfAll),
//             gl.STATIC_DRAW);

//         return {
//             general: generalBuffer
//           };
//     }

//     private createInterleavingArray() {
//         let arrayOfAll: Array<number> = [];
//         for (let model of this.models) {
//             for (let i = 0; i < model.faces.length; i++) {
//                 for (let j = 0; j != 3; j++) { // Assuuming triangles rule the world
//                     let vertPos = model.faces[i][j];
//                     arrayOfAll.push(...model.verts[vertPos]);

//                     if (model.textureCoordinates.has(i)) {
//                         arrayOfAll.push(...model.textureCoordinates.get(i)![j].textureLocation);
//                     } else {
//                         console.warn("uh, oh, model has no UV's!");
//                         arrayOfAll.push(0, 0);
//                     }
//                 }
//             }
//         }
//         return arrayOfAll;
//     }
// }