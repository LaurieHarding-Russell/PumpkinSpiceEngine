import { ZERO_VECTOR } from "../constants"
import { radiansToDegrees } from "../util";
import { lookAt } from "./vector";

describe("look at function", () => {
  xit("should create a (135) degree rotation when the object is [0, 1, 1] away", () => {
    const cameraLocation = {x: 0, y: 0, z: 0};
    const objectLocation = {x: 0, y: 1, z: 1};
    const up = {x: 0, y: 0, z: -1};
    const value = lookAt(cameraLocation, up, objectLocation);


// fixme
    expect({
        x: radiansToDegrees(value.x),
        y: radiansToDegrees(value.y),
        z: radiansToDegrees(value.z)
    }).toBe({x: 0, y: 0, z: 135});
  })
})