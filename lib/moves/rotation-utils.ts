import * as THREE from "three";
import { ICubeMoves } from "./moves";
import { IStore } from "../store";
import { getIdxByPos } from "@/helpers/helper";
import { getCubePosBySide } from "@/helpers/cube-pos-by-side";
import { ICubeSide } from "@/helpers/types";
import gsap from "gsap";
import { CUBE_GAP, CUBE_SIZE } from "@/components/cube-visualization/gen-empty-cube";

export const getRotation = (move: ICubeMoves, base: THREE.Euler) => {
  const target = base.clone();
  const preTarget = base.clone();
  const halfStepRatio = 0.25;

  const firstLetMove = move[0];
  const reverse = move[1] === "'" ? -1 : 1;
  const double = move[1] === "2" ? 2 : 1;

  switch (firstLetMove) {
    case "U":
      target.y = (-Math.PI / 2) * reverse * double;
      preTarget.y = target.y * halfStepRatio;
      break;
    case "D":
      target.y = (Math.PI / 2) * reverse * double;
      preTarget.y = (target.y * halfStepRatio) / double;
      break;
    case "F":
      target.z = (-Math.PI / 2) * reverse * double;
      preTarget.z = (target.z * halfStepRatio) / double;
      break;
    case "B":
      target.z = (Math.PI / 2) * reverse * double;
      preTarget.z = (target.z * halfStepRatio) / double;
      break;
    case "L":
      target.x = (Math.PI / 2) * reverse * double;
      preTarget.x = (target.x * halfStepRatio) / double;
      break;
    case "R":
      target.x = (-Math.PI / 2) * reverse * double;
      preTarget.x = (target.x * halfStepRatio) / double;
      break;
    case "M":
      target.x = (Math.PI / 2) * reverse * double;
      preTarget.x = (target.x * halfStepRatio) / double;
      break;
  }

  return { target, preTarget };
};

export const rotateCubeAction = (
  get: () => IStore,
  rotateTo: THREE.Euler,
  move: ICubeMoves,
  cb: () => void,
  updateCubeArray?: boolean
) => {
  const { objects } = get();
  const scene = objects.current.scene;
  const cubes = objects.current.cubes;

  const rotationGroup = new THREE.Object3D();
  scene.attach(rotationGroup);
  rotationGroup.quaternion.set(0, 0, 0, 1);

  const toRotateObjects: THREE.Group<THREE.Object3DEventMap>[] = [];

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (move[0] === "M") throw new Error("M not implemented");

      const idx = getIdxByPos(getCubePosBySide(move[0] as ICubeSide, { x, y }));
      const cube = cubes[idx];
      rotationGroup.attach(cube);
      toRotateObjects.push(cube);
    }
  }

  // const { target, preTarget } = getRotation(move, rotationGroup.rotation);

  // const rotateTo = toPreRotate ? preTarget : target;

  gsap.to(rotationGroup.rotation, {
    x: rotateTo.x,
    y: rotateTo.y,
    z: rotateTo.z,
    duration: 0.4 * (move[1] === "2" ? 2 : 1),
    ease: "power1.inOut",
    onComplete: () => {
      toRotateObjects.forEach((c) => {
        scene.attach(c);

        if (updateCubeArray) {
          // Get the position in world coordinates
          const newPosition = new THREE.Vector3();
          const coreCube = c.children[0];
          coreCube.getWorldPosition(newPosition);

          const pos = new THREE.Vector3();
          pos.x = newPosition.x + CUBE_SIZE - CUBE_GAP;
          pos.y = newPosition.y + CUBE_SIZE - CUBE_GAP;
          pos.z = newPosition.z + CUBE_SIZE - CUBE_GAP;

          const idx = getIdxByPos(pos);
          const newIdx = Math.round(idx);

          cubes[newIdx] = c;
        }
      });
      scene.remove(rotationGroup);
      cb();
    },
  });
};
