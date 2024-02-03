import * as THREE from "three";
import { IFaces } from "./types";
import { reverseCord } from "./helper";

export const getCubePosByFace = (
  face: IFaces,
  facePos: { x: number; y: number },
) => {
  const cubePos = new THREE.Vector3(0, 0, 0);

  switch (face) {
    case "front":
      cubePos.x = facePos.x;
      cubePos.y = reverseCord[facePos.y];
      cubePos.z = 2;
      break;
    case "back":
      cubePos.x = reverseCord[facePos.x];
      cubePos.y = reverseCord[facePos.y];
      cubePos.z = 0;
      break;
    case "bottom":
      cubePos.x = facePos.x;
      cubePos.y = 0;
      cubePos.z = reverseCord[facePos.y];
      break;
    case "right":
      cubePos.x = 2;
      cubePos.y = reverseCord[facePos.y];
      cubePos.z = reverseCord[facePos.x];
      break;
    case "left":
      cubePos.x = 0;
      cubePos.y = reverseCord[facePos.y];
      cubePos.z = facePos.x;
      break;
    case "top":
      cubePos.x = facePos.x;
      cubePos.y = 2;
      cubePos.z = facePos.y;
      break;
  }
  return cubePos;
};
