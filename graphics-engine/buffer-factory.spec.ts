import { BufferFactory, bufferStride } from "./buffer-factory";
import { ModelInfo, TextureInfo } from "./model-info";
import { ShadersType } from "./model/model-reference";

describe("buffer factory", () => {

    const textCoordinate = new Map<number, Array<TextureInfo>>();
    textCoordinate.set(0, 
        [
            {faceId: 0,vertexId: 0, textureLocation: [0, 42]},
            {faceId: 0,vertexId: 1, textureLocation: [35, 12]},
            {faceId: 0,vertexId: 2, textureLocation: [65, 75]}
        ]
    );

    const jointIds = new Map<string, number>();
    jointIds.set("0", 1)

    const model: ModelInfo = {
        verts: [
            [0, 0, 0],
            [1, 0, 0],
            [0, 1, 0]
        ],
        faces: [
            [0, 1, 2]
        ],
        normals: [
            [0, 0, 1]
        ],
        textureCoordinates: textCoordinate,
        jointIds: [["0","0","0"], ["0","0","0"], ["0","0","0"]],
        jointWeights: [[1,1,1], [1,1,1], [1,1,1]],
        texture: "trust me" as any,
        skeleton: [],
        jointIdToNumber: jointIds
    }

    it ("should interleave basic data", () => {

        const bufferFactory = new BufferFactory();
        bufferFactory.addModel("test", model, ShadersType.main)

        let array = (bufferFactory as any).createInterleavingArray();

        expect(array.slice(0, 3)).toEqual(model.verts[0]) // 0 vert

        expect(array.slice(3, 6)).toEqual(model.normals[0]) // 0 verts Normal
        expect(array.slice(6, 8)).toEqual(model.textureCoordinates.get(0)![0].textureLocation) // o verts texture coordinate


    })

    xit("should have a reference with a the correct offset", () => {

        const bufferFactory = new BufferFactory();
        bufferFactory.addModel("test", model, ShadersType.main)
                    .addModel("test2", model, ShadersType.main)

        let array = (bufferFactory as any).createInterleavingArray();

        expect(array.slice(0, bufferFactory.modelReferences.get("test2")!.numberOfVerts * bufferStride))
            .toEqual(array.slice(bufferFactory.modelReferences.get("test2")!.numberOfVerts * bufferStride))

    }) 
});