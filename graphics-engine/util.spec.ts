import { mat4, vec3 } from 'gl-matrix';
import { Triangle, getPerspective, intersects, intersectsDoubleSided, matrixFromLocationRotation, project, unproject, unprojectWithInverseProjection, zFar, zNear } from './util';
import { fromVec3, minus, times, toVec3, Vector2, Vector3 } from './model/vector';
import { Renderer } from './renderer'
import { ZERO_VECTOR } from './constants'

const mockWebGl = {
  canvas: {
    width: 1000,
    height: 1000
  }
} as WebGL2RenderingContext;

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

  fit("Integration test", async() => {
    let camera = {
      position: {
          x: 5,
          y: 0,
          z: 25
      }, 
      rotation: {
          x: -3,
          y: 0,
          z: 0
      }
    }

    let input: Vector2 = {x: 0, y: 6 * 2.1};
    let renderer = new Renderer()

    renderer.setWebGl(mockWebGl);
    renderer.setProjectionMatrix(simpleCamera(camera.position, camera.rotation, getPerspective(mockWebGl)));
    let projectedInput = vec3.create();
    project(projectedInput, [input.x, input.y, 0], renderer.getProjectionMatrix());

    let coordinateWindowLocation: Vector2 = {
      x: mockWebGl.canvas.width * (projectedInput[0] + 1.0)/ 2.0,
      y: mockWebGl.canvas.height * (1.0 - ((projectedInput[1] + 1.0) / 2.0))
    }

    let output = unproject(renderer.getProjectionMatrix(), 
                            coordinateWindowLocation, 
                            {x: 0, y: 0, width: mockWebGl.canvas.width, height: mockWebGl.canvas.height }
                          );
    console.log(
      renderer.getProjectionMatrix(), 
      coordinateWindowLocation, 
      {x: 0, y: 0, width: mockWebGl.canvas.width, height: mockWebGl.canvas.height }
    )


    let multiplier = 1;
    if (output.origin.z != 0) {
      multiplier = -output.origin.z/output.vector.z;
    }


    console.log("outProject", {
        x: output.origin.x + output.vector.x * multiplier, 
        y: output.origin.y + output.vector.y * multiplier,
        z: output.origin.z + output.vector.z * multiplier
    })

    expect(output.origin.x + output?.vector.x * multiplier).toBeCloseTo(input.x, 2);
    expect(output.origin.y + output?.vector.y * multiplier).toBeCloseTo(input.y, 2);
  })
})


export function simpleCamera(position: Vector3, rotation: Vector3, projectionMatrix: mat4): mat4 {
  const newProjectionMatrix = mat4.clone(projectionMatrix);

  mat4.rotateX(
    newProjectionMatrix,
    newProjectionMatrix,
    rotation.x
  );

  mat4.rotateY(
    newProjectionMatrix,
    newProjectionMatrix,
    rotation.y
  );

  mat4.rotateZ(
    newProjectionMatrix,
    newProjectionMatrix,
    rotation.z
  );

  mat4.translate(
    newProjectionMatrix,
    newProjectionMatrix,
    [position.x, position.y, position.z]);

  return newProjectionMatrix;
}