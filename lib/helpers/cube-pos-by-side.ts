import * as THREE from "three";
import { ICubeSide } from "../../types/types";
import { reverseCord } from "./helper";

export const getCubePosBySide = (side: ICubeSide, facePos: { x: number; y: number }): THREE.Vector3 => {
  const cubePos = new THREE.Vector3(0, 0, 0);

  switch (side) {
    case "F":
      cubePos.x = facePos.x;
      cubePos.y = reverseCord[facePos.y];
      cubePos.z = 2;
      break;
    case "B":
      cubePos.x = reverseCord[facePos.x];
      cubePos.y = reverseCord[facePos.y];
      cubePos.z = 0;
      break;
    case "D":
      cubePos.x = facePos.x;
      cubePos.y = 0;
      cubePos.z = reverseCord[facePos.y];
      break;
    case "R":
      cubePos.x = 2;
      cubePos.y = reverseCord[facePos.y];
      cubePos.z = reverseCord[facePos.x];
      break;
    case "L":
      cubePos.x = 0;
      cubePos.y = reverseCord[facePos.y];
      cubePos.z = facePos.x;
      break;
    case "U":
      cubePos.x = facePos.x;
      cubePos.y = 2;
      cubePos.z = facePos.y;
      break;
  }
  return cubePos;
};
