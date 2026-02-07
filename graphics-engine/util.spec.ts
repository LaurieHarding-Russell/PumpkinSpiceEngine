import { mat4, vec3 } from 'gl-matrix';
import { Triangle, getPerspective, intersects, intersectsDoubleSided, matrixFromLocationRotation, unproject } from './util';
import { times, toVec3, Vector2, Vector3 } from './model/vector';
import { Renderer } from './renderer'
import { BufferFactory } from './shaders/buffer-factory';

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


  it("Integration test", async() => {
    let camera = {
      position: {
          x: 0,
          y: 0,
          z: 25
      }, 
      rotation: {
          x: -0.0,
          y: 0.0,
          z: 0.0,
      }
    }

    let vector: Vector2 = {x: 0, y: 0};
    let renderer = new Renderer()
   
    const webGl = {
      canvas: {
        width: 1000,
        height: 1000
      }
    } as WebGL2RenderingContext;

    renderer.setWebGl(webGl);
    renderer.setProjectionMatrix(simpleCamera(camera.position, camera.rotation, getPerspective(webGl)));
    let output = unproject(renderer.getProjectionMatrix(), vector);

    expect(output?.vector.x).toEqual(-0);
    expect(output?.vector.y).toEqual(-0);
    expect(output?.vector.z).not.toEqual(0);
  })

  xit("Integration test2", async() => {
    let camera = {
      position: {
          x: -2,
          y: 2,
          z: 25
      }, 
      rotation: {
          x: 0.0,
          y: 0.0,
          z: 0.0,
      }
    }

    const centeredTriangle: Triangle = {
      point1: {x:0, y:-20, z:0},
      point2: {x:-20, y:20, z:0},
      point3: {x:20, y:20, z:0}
    };

    let renderer = new Renderer()
   
    const webGl = {
      canvas: {
        width: 1000,
        height: 1000
      }
    } as WebGL2RenderingContext;

    let projectionMatrix: mat4 = simpleCamera(camera.position, camera.rotation, getPerspective(webGl))

    const startingPoint = ({x: 0, y: 0, z: 0});
    const modelViewMatrix: mat4 = matrixFromLocationRotation({x: 0, y: 0, z: 20}, {x: 0, y: 0, z: 0});
    // projection * modelview * inputPosition;
    const combinedMatrix = mat4.create(); 
    mat4.multiply(combinedMatrix, projectionMatrix, modelViewMatrix);

    const endPoint = vec3.create();

    vec3.transformMat4(endPoint, toVec3(startingPoint), combinedMatrix);

    renderer.setWebGl(webGl);
    renderer.setProjectionMatrix(projectionMatrix);

    renderer.renderMain
    let output = unproject(renderer.getProjectionMatrix(), {x: endPoint[0], y: endPoint[1]});

    console.log("output", output);

    let intersectingPoint = intersectsDoubleSided(output, centeredTriangle);

    console.log("intersectingPoint", intersectingPoint);

    expect(intersectingPoint?.x).toBeCloseTo(startingPoint.x, 5);
    expect(intersectingPoint?.y).toBeCloseTo(startingPoint.y, 5);
    expect(intersectingPoint?.z).toBeCloseTo(startingPoint.z, 5);
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