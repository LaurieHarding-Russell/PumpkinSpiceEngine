import { mat4 } from 'gl-matrix';
import { Triangle, intersects, unproject } from './util';
import { Vector2, Vector3 } from './model/vector';

describe("intersects function", () => {
  it("Should find correct intersecting point when pointed down.", () => {
    let lineOrigin = {x: 0, y: 0, z: -20};
    let lineVector = {x: 0, y: 0, z: 1};

    let triangle = {
      point1: {x:-2, y: -2, z:0},
      point2: {x:0, y: 2, z:0},
      point3: {x:2, y: -2, z:0}
    }

    let intersectingPoint = intersects(lineOrigin, lineVector, triangle);
    expect(intersectingPoint?.x).toEqual(0);
    expect(intersectingPoint?.y).toEqual(0);
    expect(intersectingPoint?.z).toEqual(0);
  });


  it("Should find correct intersecting point when 45 degree angle", () => {
    let lineOrigin = {x: 0, y: 0, z: 20};
    let lineVector = {x: 1, y: 1, z: -1};

    let triangle = {
      point1: {x:-200, y: -200, z:0},
      point2: {x:0, y: 200, z:0},
      point3: {x:200, y: -200, z:0}
    }

    let intersectingPoint = intersects(lineOrigin, lineVector, triangle);
    expect(intersectingPoint?.x).toEqual(20);
    expect(intersectingPoint?.y).toEqual(20);
    expect(intersectingPoint?.z).toEqual(0);
  });

  it("parrellel line and plane", () => {
    let lineOrigin = {x: 0, y: 0, z: 20};
    let lineVector = {x: 1, y: 0, z: 0};

    let triangle = {
      point1: {x:-200, y: -200, z:0},
      point2: {x:0, y: 200, z:0},
      point3: {x:200, y: -200, z:0}
    }

    let intersectingPoint = intersects(lineOrigin, lineVector, triangle);
    expect(intersectingPoint).toBe(null);
  });

  it("should handle Zero vector", () => {
    let lineOrigin = {x: 0, y: 0, z: 20};
    let lineVector = {x: 0, y: 0, z: 0};

    let triangle = {
      point1: {x:-200, y: -200, z:0},
      point2: {x:0, y: 200, z:0},
      point3: {x:200, y: -200, z:0}
    }

    let intersectingPoint = intersects(lineOrigin, lineVector, triangle);
    expect(intersectingPoint).toBe(null);
  });
})

describe("unproject function", () => {
  it("should take take a pixel in the middle of the screen with a camera pointing down and return a ray pointing down", () => {
    let projection = mat4.create();
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = 100 / 100
    const zNear = 0.1;
    const zFar = 100.0;
      
    mat4.perspective(projection,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    let vector: Vector2 = {x: 0, y: 0};

    let output = unproject(projection, vector)
    expect(output?.vector.x).toEqual(-0);
    expect(output?.vector.y).toEqual(-0);
    expect(output?.vector.z).not.toEqual(0);
  })

  it("bottom middle should have 0 x", () => {
    let projection = mat4.create();
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = 100 / 100
    const zNear = 0.1;
    const zFar = 100.0;
      
    mat4.perspective(projection,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    let vector: Vector2 = {x: 0, y: 50};

    let output = unproject(projection, vector)

    expect(output?.vector.x).toEqual(-0);
    expect(output?.vector.y).not.toEqual(0);
    expect(output?.vector.z).not.toEqual(0);
  })

})