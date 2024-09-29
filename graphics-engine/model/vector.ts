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

export function distance(a: Vector2, b: Vector2): number {
    return Math.sqrt(Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2));
}