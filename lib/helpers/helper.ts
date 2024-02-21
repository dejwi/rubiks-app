import * as THREE from "three";

// URFDLB
export const solved_cube = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

export const getPosByIdx = (id: number): THREE.Vector3 => {
  const y = Math.floor(id / 9);
  const x = Math.floor((id - y * 9) / 3);
  const z = id - y * 9 - x * 3;

  return new THREE.Vector3(x, y, z);
};

export const getIdxByPos = (pos: THREE.Vector3) => pos.y * 9 + pos.x * 3 + pos.z;

export const reverseCord = [2, 1, 0];
