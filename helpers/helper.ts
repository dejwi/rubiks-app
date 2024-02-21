import * as THREE from "three";
import { ICubeSide, IFaces } from "./types";

// URFDLB
export const solved_cube = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

export const colorMapThree: Record<ICubeSide, THREE.Color> = {
  D: new THREE.Color("white"),
  U: new THREE.Color("yellow"),
  R: new THREE.Color("green"),
  L: new THREE.Color("blue"),
  F: new THREE.Color("red"),
  B: new THREE.Color("#f96706"),
  X: new THREE.Color("black"),
};

export const getPosByIdx = (id: number): THREE.Vector3 => {
  const y = Math.floor(id / 9);
  const x = Math.floor((id - y * 9) / 3);
  const z = id - y * 9 - x * 3;

  return new THREE.Vector3(x, y, z);
};

export const getIdxByPos = (pos: THREE.Vector3) => pos.y * 9 + pos.x * 3 + pos.z;

export const reverseCord = [2, 1, 0];

export const cube_sides: ICubeSide[] = ["U", "R", "F", "D", "L", "B"];
export const cubeSidesFull: Record<ICubeSide, string> = {
  U: "Up",
  R: "Right",
  F: "Front",
  D: "Down",
  L: "Left",
  B: "Back",
  X: "null",
};
export const cubeSidesNamedColors: Record<ICubeSide, string> = {
  U: "Yellow",
  R: "Green",
  F: "Red",
  D: "White",
  L: "Blue",
  B: "Orange",
  X: "null",
};

export const cube_sides_scan: ICubeSide[] = ["F", "U", "R", "D", "L", "B"];
