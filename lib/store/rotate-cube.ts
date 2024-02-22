import { IStoreFn } from "./store";
import { getRotation, rotateCubeAction } from "../moves/rotation-utils";
import { ICubeMoves } from "../moves/moves";
import * as THREE from "three";

export const rotateCube = ({ get, set, move }: IStoreFn & { move: ICubeMoves }) => {
  if (get().isDuringRotation) return;
  set({ isDuringRotation: true });

  const { target } = getRotation(move, new THREE.Euler());

  rotateCubeAction(get, target, move, () => set({ isDuringRotation: false }), true);
};

export const rotateCube2Part = ({ get, set, move }: IStoreFn & { move: ICubeMoves }) => {
  if (get().isDuringRotation) return;
  set({ isDuringRotation: true });

  const nextCubeRotation = get().nextCubeRotation;
  const outlinedSelection = get().outlinedSelection;

  if (nextCubeRotation) {
    rotateCubeAction(
      get,
      nextCubeRotation,
      move,
      () => {
        set({ isDuringRotation: false, nextCubeRotation: null });
        outlinedSelection.current.length = 0;
      },
      true
    );
  } else {
    const { target, preTarget } = getRotation(move, new THREE.Euler());
    const next = target;
    next.x -= preTarget.x;
    next.y -= preTarget.y;
    next.z -= preTarget.z;
    rotateCubeAction(
      get,
      preTarget,
      move,
      () => set({ isDuringRotation: false, nextCubeRotation: next }),
      false,
      (c) => outlinedSelection.current.push(c)
    );
  }
};
