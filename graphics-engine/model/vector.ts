// fixme uh library vector probably better.

import { vec3 } from "gl-matrix";


// FIXME centralized
const EPSILON = 0.0000001;
const inverseEpsilon = 1/EPSILON;

export interface Vector {
    x: number;
    y: number;
}

export interface Vector2 {
    x: number;
    y: number;
}

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export function plus(v1: Vector3, v2: Vector3): Vector3 {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        z: v1.z + v2.z
    }
}

export function minus(v1: Vector3, v2: Vector3): Vector3 {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
        z: v1.z - v2.z
    }
}

export function times(v1: Vector3, scaler: number): Vector3 {
    return {
        x: v1.x * scaler,
        y: v1.y * scaler,
        z: v1.z * scaler,
    }
}

export function dotProduct(v1: Vector3, v2: Vector3): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
}

export function crossProduct(v1: Vector3, v2: Vector3): Vector3 {
    let output = vec3.create();
    vec3.cross(output, [v1.x, v1.y, v1.z], [v2.x, v2.y, v2.z]);
    return {
        x: output[0],
        y: output[1],
        z: output[2],
    };
}

export function roundToEPSILON(v1: Vector3): Vector3 {
    return {
        x: Math.round(v1.x * inverseEpsilon)*EPSILON,
        y: Math.round(v1.y * inverseEpsilon)*EPSILON,
        z: Math.round(v1.z * inverseEpsilon)*EPSILON
    }
}

export function fromVec3(v1: vec3): Vector3 {
    return {
        x: v1[0],
        y: v1[1],
        z: v1[2],
    }
}

export function toVec3(v1: Vector3): vec3 {
    return [v1.x, v1.y, v1.z];
}

export function distance(a: Vector2, b: Vector2): number {
    return Math.sqrt(Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2));
}


export function magnitudeOfVector(v: Vector3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}


export function rotateAroundX(v: Vector3, theta: number): Vector3 {
    return {
            x: v.x,
            y: (v.y * Math.cos(theta)) - (v.z * Math.sin(theta)),
            z: (v.y * Math.sin(theta)) + (v.z * Math.cos(theta))
        }
}

export function rotateAroundY(v: Vector3, theta: number): Vector3 {
    return {
            x: (v.x * Math.cos(theta)) - (v.z * Math.sin(theta)),
            y: v.y,
            z: (v.x * Math.sin(theta)) + (v.z * Math.cos(theta))
        }
}

export function rotateAroundZ(v: Vector3, theta: number): Vector3 {
    return {
            x: (v.x * Math.cos(theta)) - (v.y * Math.sin(theta)),
            y: (v.x * Math.sin(theta)) + (v.y * Math.cos(theta)),
            z: v.z
        }
}

export function normalize(v: Vector3): Vector3 {
    const magnitude = magnitudeOfVector(v);
    return times(v, 1/magnitude);
}


export function averageVectors(v1: Vector3, v2: Vector3) {
    return {
        x: (v1.x + v2.x) / 2,
        y: (v1.y + v2.y) / 2,
        z: (v1.z + v2.z) / 2
    }
}


export function wieghtedAverage(v1: Vector3, v2: Vector3, weightFirst: number) {
    return {
        x: v1.x * weightFirst + v2.x * (1 - weightFirst),
        y: v1.y * weightFirst + v2.y * (1 - weightFirst),
        z: v1.z * weightFirst + v2.z * (1 - weightFirst)
    }
}

export function lookAt(cameraLocation: Vector3, upVector: Vector3, objectLocation: Vector3): Vector3 {
    const rotation = {x: 0, y: 0,z: 0}
    const forwardVector = normalize(minus(cameraLocation, objectLocation));

    const rightAxis = normalize(crossProduct(upVector, forwardVector));

    const cameraDirection = times(upVector, -1);

    rotation.x = Math.acos(dotProduct(cameraDirection, rightAxis));
    rotation.y = Math.acos(dotProduct(cameraDirection, upVector));
    rotation.z = Math.acos(dotProduct(cameraDirection, forwardVector));

    return rotation;
}