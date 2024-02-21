import { ICubeSide } from "@/types/types";
import * as THREE from "three";

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
export const colorMapThree: Record<ICubeSide, THREE.Color> = {
  D: new THREE.Color("white"),
  U: new THREE.Color("yellow"),
  R: new THREE.Color("green"),
  L: new THREE.Color("blue"),
  F: new THREE.Color("red"),
  B: new THREE.Color("#f96706"),
  X: new THREE.Color("black"),
};
