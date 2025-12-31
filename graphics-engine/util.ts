import { mat4, vec3 } from "gl-matrix";
import { Vector2, Vector3, crossProduct, dotProduct, fromVec3, minus, normalize, plus, roundToEPSILON, times } from "./model/vector";
import { Camera } from "./model/camera";


export const zNear = 0.1;
export const zFar = 100.0;
// FIXME centralize
const EPSILON = 0.0000001;
const inverseEpsilon = 1/EPSILON;

export interface Triangle {
    point1: Vector3;
    point2: Vector3;
    point3: Vector3;
}

export interface Tetrahedron {
    point1: Vector3;
    point2: Vector3;
    point3: Vector3;
    point4: Vector3;
}

export interface Ray {
    origin: Vector3;
    vector: Vector3;
}

export interface Line {
    startPoint: Vector3;
    endPoint: Vector3;
}

export function unproject(projection: mat4, vector: Vector2): Ray {
    const inverseMatrix = mat4.create();
    mat4.invert(inverseMatrix, projection);

    let near = vec3.create();
    let far = vec3.create();
    let ray = vec3.create();

    project(near, [vector.x, vector.y, zNear], inverseMatrix);
    project(far, [vector.x, vector.y, zFar], inverseMatrix);

    return {
        origin: {
            x: near[0],
            y: near[1],
            z: near[2]
        },
        vector: minus(fromVec3(far), fromVec3(near))
    }
}

// https://github.com/toji/gl-matrix/issues/101 :(
export function project(out: vec3, vector: vec3, projection: mat4): vec3 {
    let x = vector[0]
    let y = vector[1]
    let z = vector[2]
    let m = projection

    let a00 = m[0]
    let a01 = m[1]
    let a02 = m[2]
    let a03 = m[3]

    let a10 = m[4]
    let a11 = m[5]
    let a12 = m[6]
    let a13 = m[7]

    let a20 = m[8]
    let a21 = m[9]
    let a22 = m[10]
    let a23 = m[11]

    let a30 = m[12]
    let a31 = m[13]
    let a32 = m[14]
    let a33 = m[15]

    let lw = 1 / (x * a03 + y * a13 + z * a23 + a33)

    vec3.set(
        out,
        (x * a00 + y * a10 + z * a20 + a30) * lw,
        (x * a01 + y * a11 + z * a21 + a31) * lw,
        (x * a02 + y * a12 + z * a22 + a32) * lw
    )
    return out
}
  
// Möller–Trumbore intersection algorithm
export function intersects(origin: Vector3, rayVector: Vector3, triangle: Triangle): Vector3 | null{
    
    let vertex0 = triangle.point1;
    let vertex1 = triangle.point2;  
    let vertex2 = triangle.point3;

    let distanceBetweenOriginAndEdgesOrigin, originEdgeOriginNormal;

    let edge1 = minus(vertex1, vertex0);
    let edge2 = minus(vertex2, vertex0);

    let rayVectorEdgeNormal = crossProduct(rayVector, edge2);
    let determinantOfTheMatrix = dotProduct(edge1, rayVectorEdgeNormal);

    if (determinantOfTheMatrix > -EPSILON && determinantOfTheMatrix < EPSILON){
        return null; // Is parrellel
    }

    let inverseOfDeterminantOfMatrix = 1.0 / determinantOfTheMatrix;
    distanceBetweenOriginAndEdgesOrigin = minus(origin, vertex0);

    let barycentricU = dotProduct(distanceBetweenOriginAndEdgesOrigin, rayVectorEdgeNormal) * inverseOfDeterminantOfMatrix; 
    if (barycentricU < 0.0 || barycentricU > 1.0) {
        return null; //Not in triangle
    }

    originEdgeOriginNormal = crossProduct(distanceBetweenOriginAndEdgesOrigin, edge1);

    let barycentricV = inverseOfDeterminantOfMatrix * dotProduct(rayVector,originEdgeOriginNormal);
    if (barycentricV < 0.0 || barycentricU + barycentricV > 1.0) {
        return null; //Not in triangle
    }

    let rayT = dotProduct(edge2, originEdgeOriginNormal) * inverseOfDeterminantOfMatrix;


    if (rayT > EPSILON) {
        return roundToEPSILON(plus(origin, times(rayVector,rayT)));
    }
    return null;
}


export function getPerspective(webGl: WebGL2RenderingContext): mat4 {
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = webGl.canvas.width / webGl.canvas.height
    const zNear = 0.1;
    const zFar = 100.0;

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);
    return projectionMatrix;
}


// Note: Up vector should not be parrellel to the forward vector
export function lookAtPerspective(camera: Camera, lookAtObject: Vector3, tempUpVector: Vector3, projectionMatrix: mat4): mat4 {
    const newProjectionMatrix = mat4.clone(projectionMatrix);
    const lookAtMatrix = mat4.create();
    const forwardVector = normalize(minus(camera.position, lookAtObject));

    const rightVector = normalize(crossProduct(tempUpVector, forwardVector))

    const upVector = normalize(crossProduct(forwardVector,rightVector));    

    const translationX = dotProduct(camera.position, rightVector);
    const translationY = dotProduct(camera.position, upVector);
    const translationZ = dotProduct(camera.position, forwardVector);
    mat4.set(
        lookAtMatrix,
        rightVector.x,
        upVector.x,
        forwardVector.x,
        0,
        rightVector.y,
        upVector.y,
        forwardVector.y,
        0,
        rightVector.z,
        upVector.z,
        forwardVector.z,
        0,
        -translationX,
        -translationY,
        -translationZ,
        1
    );

    mat4.multiply(newProjectionMatrix, projectionMatrix, lookAtMatrix)
    
    mat4.translate(
      newProjectionMatrix,
      newProjectionMatrix,
      [-camera.position.x, -camera.position.y, camera.position.z]);

    return newProjectionMatrix;
}

export function radiansToDegrees(radians: number) {
    return radians * (180 / Math.PI);
}

export function identityMatrix(): mat4 {
    let identity = mat4.create();
    mat4.identity(identity);
    return identity;
}

export function matrixFromLocationRotation(location: Vector3, rotation: Vector3): mat4 {
    let matrix = mat4.create();
    mat4.translate(
      matrix, // destination matrix
      matrix, // matrix to translate
      [location.x, location.y, location.z]); // amount to translate
    mat4.rotateX(
      matrix,
      matrix,
      rotation.x
    )
    mat4.rotateY(
      matrix,
      matrix,
      rotation.y
    )
    mat4.rotateZ(
      matrix,
      matrix,
      rotation.z
    )
    return matrix;
  }


export function cameraBasedProjection(camera: Camera, webGl: WebGL2RenderingContext) {

    let projectionMatrix = mat4.create();

    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = webGl.canvas.width / webGl.canvas.height
    const zNear = 0.1;
    const zFar = 100.0;

    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    mat4.translate(
      projectionMatrix,
      projectionMatrix,
      [-camera.position.x, -camera.position.y, camera.position.z]);
      
    mat4.rotateX(
      projectionMatrix,
      projectionMatrix,
      camera.rotation.x
    );

    mat4.rotateY(
      projectionMatrix,
      projectionMatrix,
      camera.rotation.y
    );

    mat4.rotateZ(
      projectionMatrix,
      projectionMatrix,
      camera.rotation.z
    );

    return projectionMatrix;
}