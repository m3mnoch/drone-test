import { Vector3Component } from "metaverse-api";

export function getLookAtRotation(from: Vector3Component, to: Vector3Component): Vector3Component {
    return {
        x: 0,
        y: (-360 / (2 * Math.PI)) * Math.atan2(to.z - from.z, to.x - from.x) + 180,
        z: 0
    };
}

export const randomInclusiveInteger = (start: number, end: number) => {
    return Math.floor(Math.random() * (end - start + 1)) + start;
};

export const cloneData = (d: any) => {
    return JSON.parse(JSON.stringify(d));
};

export interface GobPosition {
    translation: Vector3Component;
    rotation: Vector3Component;
}

export function square(x: number) {
    return x * x;
}

export function fastDistance(v1: Vector3Component, v2: Vector3Component) {
    return square(v1.x - v2.x) + square(v1.y - v2.y) + square(v1.z - v2.z);
}

export function distance(v1: Vector3Component, v2: Vector3Component) {
    return Math.sqrt(fastDistance(v1, v2));
}

export function vectorSum(a: Vector3Component, b: Vector3Component) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z
    };
}

export function vectorMinus(a: Vector3Component, b: Vector3Component) {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z
    };
}

export function vectorMul(v: Vector3Component, a: number) {
    return {
        x: v.x * a,
        y: v.y * a,
        z: v.z * a
    };
}

export function vectorNormalize(v: Vector3Component) {
    return vectorMul(v, 1 / Math.sqrt(square(v.x) + square(v.y) + square(v.z)));
}
