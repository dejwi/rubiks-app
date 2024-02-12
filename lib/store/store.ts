import { create } from "zustand";
import { ICubeSide, IScanResult } from "../../helpers/types";
import { colorMapThree, cube_sides, cube_sides_scan, getIdxByPos } from "../../helpers/helper";
import { genEmptyThreeCube } from "@/components/cube-visualization/gen-empty-cube";
import { createRef } from "react";
import { ghostSideAnimationSettings } from "@/components/cube-visualization/animation-settings";
import gsap from "gsap";
import * as THREE from "three";
import { cameraPositions } from "../../helpers/camera-positions";
import { colorEmissiveIntensityMap } from "../maps/color-emissive-intesity";
import { getCubePosBySide } from "@/helpers/cube-pos-by-side";
import { ICubeMoves } from "../moves/moves";
import { getRotation, rotateCubeAction } from "../moves/rotation-utils";
import { solveCube } from "../solver/solver";
import { updateCube } from "./update-cube";
import { toggleCubeRotating } from "./toggle-rotate";
import { updateCameraPos } from "./update-camera";
import { hideCubeStickers } from "./hide-stickers";

const getObjectsDefault = () => {
  const objects = createRef() as React.MutableRefObject<ReturnType<typeof genEmptyThreeCube> & { scene: THREE.Scene }>;
  objects.current = { ...genEmptyThreeCube(), scene: new THREE.Scene() };
  return objects;
};
const getCameraDefault = () => {
  const camera = createRef() as React.MutableRefObject<THREE.PerspectiveCamera>;
  camera.current = new THREE.PerspectiveCamera(40, 500 / 500);
  return camera;
};

const appStages = ["homepage", "deviceselect", "scan", "solve"] as const;
export type IAppStages = (typeof appStages)[number];

const defaultStore = {
  threeWidth: 200,
  threeHeight: 200,
  scanSize: 170,
  isScanRefreshing: false,
  isScanRefreshGlow: false,
  scanRefreshInterval: 550,
  highlight: undefined as ICubeSide | undefined,
  cube: Array(54).fill("X").join(""),
  currentScanFace: -1 as number | null,
  scanReversed: false,
  deviceId: "",
  previewReversed: true,
  devScanPreviewShow: true,
  objects: getObjectsDefault(),
  ghostStickersTimeline: createRef() as React.MutableRefObject<gsap.core.Timeline>,
  cubeSpinningTimeline: createRef() as React.MutableRefObject<gsap.core.Timeline | null>,
  camera: getCameraDefault(),
  lastScanResult: [] as Array<IScanResult[number] & { id: number }>,
  nextCubeRotation: null as null | THREE.Euler,
  cubeSolution: [] as string[],
  cubeSolutionStep: 0 as number | null,
  isDuringRotation: false,
  currentAppStage: "homepage" as IAppStages,
  scanCardTop: 0,
  scanCardRight: 0,
};

type IDefaultData = typeof defaultStore;

export interface IStore extends IDefaultData {
  updateStore: (payload: Partial<IStore>) => void;
  updateCube: (cube: string, setVisible?: boolean) => void;
  updateCubeSide: (side: ICubeSide, colors: ICubeSide[], glow?: boolean) => void;
  updateCubeScan: (scan: IScanResult) => void;
  rotateCube: (move: ICubeMoves) => void;
  rotateCube2Part: (move: ICubeMoves) => void;
  initSolveCube: () => void;
  nextCubeSolveStep: () => void;
  toggleCubeRotating: () => void;
  updateCameraPos: (pos: [number, number, number]) => void;
  hideCubeStickers: () => void;
}

export type IStoreFn = { get: () => IStore; set: (payload: Partial<IStore>) => void };

export const useAppStore = create<IStore>()((set, get) => ({
  ...defaultStore,
  updateStore: (payload) => set(payload),
  initSolveCube() {
    const cube = get().cube;
    const solution = solveCube(cube)
      .map((s) => s.split(" "))
      .flat()
      .filter((s) => s !== "");
    set({ cubeSolution: solution, cubeSolutionStep: 0 });
    get().nextCubeSolveStep();
  },
  hideCubeStickers: () => hideCubeStickers({ get, set }),
  updateCameraPos: (pos) => updateCameraPos({ get, set, cameraPos: pos }),
  nextCubeSolveStep() {
    const isIn2Part = get().nextCubeRotation !== null;
    const currentStep = get().cubeSolutionStep;
    const solution = get().cubeSolution;

    if (currentStep === null) return;

    get().rotateCube2Part(solution[currentStep] as ICubeMoves);
    if (isIn2Part) {
      set({ cubeSolutionStep: currentStep === solution.length - 1 ? null : currentStep + 1 });
      return;
    }
  },
  toggleCubeRotating: () => toggleCubeRotating({ get, set }),
  updateCubeScan(scan) {
    const { currentScanFace, objects, ghostStickersTimeline: timeline, cube } = get();

    // Stop the previous timeline if it exists
    if (timeline.current) {
      timeline.current.kill();
    }

    // Create a new timeline
    timeline.current = gsap.timeline();

    if (currentScanFace === null) return;
    const { baseOffset, baseOpacity, delayBy, duration, endOffset, endOpacity } = ghostSideAnimationSettings;
    if (currentScanFace > -1) {
      const currentScanSide = cube_sides_scan[currentScanFace];

      const newCube = [...cube];

      // Update animation for current ghost stickers
      scan.forEach(({ destSide }, i) => {
        const idx = cube_sides.indexOf(currentScanSide) * 9 + i;
        newCube[idx] = destSide;

        const prevGhostSticker = objects.current.stickers[idx];
        const orgPos = objects.current.orgStickerPos[idx];

        const newColor = colorMapThree[destSide];
        prevGhostSticker.material.emissive = newColor;
        prevGhostSticker.material.color = newColor.clone();
        prevGhostSticker.material.emissiveIntensity = 0;

        gsap.to(prevGhostSticker.position, {
          x: orgPos.x,
          y: orgPos.y,
          z: orgPos.z,
          duration: 0.05,
          ease: "power1.inOut",
          delay: delayBy(i),
        });
        gsap.to(prevGhostSticker.material, {
          opacity: 1,
          duration: 0.05,
          ease: "power1.inOut",
          delay: delayBy(i),
        });
      });
      set({ cube: newCube.join("") });
    }
    if (currentScanFace === cube_sides_scan.length - 1) {
      set({ currentScanFace: null });
      return;
    }

    // Set ghost stickers for the next face
    const nextScanSide = cube_sides_scan[currentScanFace + 1];
    for (let i = 0; i < 9; i++) {
      const sticker = objects.current.stickers[cube_sides.indexOf(nextScanSide) * 9 + i];

      // sticker.material.color = ghostSideAnimationSettings.color.clone();

      const targetPosition = sticker.position.clone();
      switch (nextScanSide) {
        case "U":
          targetPosition.y += endOffset;
          sticker.position.y += baseOffset;
          break;
        case "D":
          targetPosition.y -= endOffset;
          sticker.position.y -= baseOffset;
          break;
        case "F":
          targetPosition.z += endOffset;
          sticker.position.z += baseOffset;
          break;
        case "B":
          targetPosition.z -= endOffset;
          sticker.position.z -= baseOffset;
          break;
        case "R":
          targetPosition.x += endOffset;
          sticker.position.x += baseOffset;
          break;
        case "L":
          targetPosition.x -= endOffset;
          sticker.position.x -= baseOffset;
          break;
      }

      // Add the animations to the timeline
      timeline.current.add(
        gsap.to(sticker.position, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration,
          repeat: -1,
          yoyo: true,
          ease: "power1.in",
          delay: delayBy(i),
        }),
        0
      );
      gsap.to(sticker.material, {
        opacity: baseOpacity,
        duration: 2,
        ease: "power1.in",
        delay: delayBy(i),
      });
      timeline.current.add(
        gsap.to(sticker.material, {
          opacity: endOpacity,
          duration,
          repeat: -1,
          yoyo: true,
          ease: "power1.in",
          delay: delayBy(i) + 2,
        }),
        0
      );

      // Animate camera position change
      get().updateCameraPos(cameraPositions[cube_sides_scan[currentScanFace + 1]] || cameraPositions.F);

      set({ currentScanFace: currentScanFace + 1 });
    }
  },
  rotateCube: (move) => {
    if (get().isDuringRotation) return;
    set({ isDuringRotation: true });

    const { target } = getRotation(move, new THREE.Euler());

    rotateCubeAction(get, target, move, () => set({ isDuringRotation: false }), true);
  },
  rotateCube2Part: (move) => {
    if (get().isDuringRotation) return;
    set({ isDuringRotation: true });

    const nextCubeRotation = get().nextCubeRotation;

    if (nextCubeRotation) {
      rotateCubeAction(
        get,
        nextCubeRotation,
        move,
        () => set({ isDuringRotation: false, nextCubeRotation: null }),
        true
      );
    } else {
      const { target, preTarget } = getRotation(move, new THREE.Euler());
      const next = target;
      next.x -= preTarget.x;
      next.y -= preTarget.y;
      next.z -= preTarget.z;
      rotateCubeAction(get, preTarget, move, () => set({ isDuringRotation: false, nextCubeRotation: next }), false);
    }
  },
  updateCubeSide(side, colors) {
    const stickers = get().objects.current.stickers;
    const idx = cube_sides.indexOf(side) * 9;
    const newCube = [...get().cube];
    for (let i = 0; i < colors.length; i++) {
      const sticker = stickers[idx + i];
      const color = colorMapThree[colors[i]];
      sticker.material.emissive = color;

      sticker.material.emissiveIntensity = get().isScanRefreshGlow
        ? colorEmissiveIntensityMap[color.getHexString()]
        : 0;

      gsap.to(sticker.material.color, {
        r: color.r,
        g: color.g,
        b: color.b,
        duration: 0.3,
        ease: "power1.inOut",
        delay: ghostSideAnimationSettings.delayBy(i) / 2,
      });

      newCube[idx + i] = colors[i];
    }
    set({ cube: newCube.join("") });
  },
  updateCube: (cube, setVisible) => updateCube({ get, set, cube, setVisible }),
}));
