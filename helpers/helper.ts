import * as THREE from "three";
import { IFaces, IRubiks } from "./types";

export const cubeColorMap = {
  W: "#f7f7f7",
  G: "#23e327",
  R: "#f82628",
  // O: "#ec7a2f",
  O: "#d98b26",
  Y: "#fee32a",
  B: "#259be4",
  inside: "#000000",
};

export const cubeSidesMap: Record<IFaces, number> = {
  bottom: 3,
  top: 2,
  right: 0,
  left: 1,
  front: 4,
  back: 5,
};

export const getPosByIdx = (id: number): THREE.Vector3 => {
  const y = Math.floor(id / 9);
  const x = Math.floor((id - y * 9) / 3);
  const z = id - y * 9 - x * 3;

  return new THREE.Vector3(x, y, z);
};

export const getIdxByPos = (pos: THREE.Vector3) =>
  pos.y * 9 + pos.x * 3 + pos.z;

export const reverseCord = [2, 1, 0];

export const generateSolvedCube = (): IRubiks => {
  const solvedCube: IRubiks = [];
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      for (let z = 0; z < 3; z++) {
        const obj: IRubiks[number] = {
          "0": null,
          "1": null,
          "2": null,
          "3": null,
          "4": null,
          "5": null,
        };
        if (y == 0) obj[cubeSidesMap.bottom] = "W";
        if (z == 2) obj[cubeSidesMap.front] = "R";
        if (y == 2) obj[cubeSidesMap.top] = "Y";
        if (x == 2) obj[cubeSidesMap.right] = "G";
        if (x == 0) obj[cubeSidesMap.left] = "B";
        if (z == 0) obj[cubeSidesMap.back] = "O";
        solvedCube.push(obj);
      }
    }
  }
  return solvedCube;
};
