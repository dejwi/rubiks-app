import { create } from "zustand";
import { ICubeSide, IScanResult } from "../../types/types";
import { genEmptyThreeCube } from "@/components/cube-visualization/gen-empty-cube";
import { createRef } from "react";
import * as THREE from "three";
import { ICubeMoves } from "../moves/moves";
import { updateCube } from "./update-cube";
import { toggleCubeRotating } from "./toggle-rotate";
import { updateCameraPos } from "./update-camera";
import { hideCubeStickers } from "./hide-stickers";
import initSolveCube from "./init-solve-cube";
import nextCubeSolveStep from "./next-solve-step";
import updateCubeScan from "./update-cube-scan";
import { rotateCube, rotateCube2Part } from "./rotate-cube";
import updateCubeSide from "./update-cube-side";

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
  scanSize: 170,
  isScanRefreshing: false,
  isScanRefreshGlow: false,
  scanRefreshInterval: 550,
  highlight: undefined as ICubeSide | undefined,
  cube: Array(54).fill("X").join(""),
  currentScanFace: -1 as number | null,
  scanReversed: false,
  deviceId: "",
  previewReversed: false,
  devScanPreviewShow: true,
  objects: getObjectsDefault(),
  ghostStickersTimeline: createRef() as React.MutableRefObject<gsap.core.Timeline>,
  cubeSpinningTimeline: createRef() as React.MutableRefObject<gsap.core.Timeline | null>,
  camera: getCameraDefault(),
  lastScanResult: [] as Array<IScanResult[number] & { id: number }>,
  nextCubeRotation: null as null | THREE.Euler,
  cubeSolution: [] as string[],
  cubeSolutionStep: null as number | null,
  isDuringRotation: false,
  currentAppStage: "homepage" as IAppStages,
  cubeTop: 0,
  // cubeRight: 0,
  cubeScale: 0.5,
  cubeLeft: 0,
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
  initSolveCube: () => initSolveCube({ get, set }),
  hideCubeStickers: () => hideCubeStickers({ get, set }),
  updateCameraPos: (pos) => updateCameraPos({ get, set, cameraPos: pos }),
  nextCubeSolveStep: () => nextCubeSolveStep({ get, set }),
  toggleCubeRotating: () => toggleCubeRotating({ get, set }),
  updateCubeScan: (scan) => updateCubeScan({ get, set, scan }),
  rotateCube: (move) => rotateCube({ get, set, move }),
  rotateCube2Part: (move) => rotateCube2Part({ get, set, move }),
  updateCubeSide: (side, colors) => updateCubeSide({ get, set, side, colors }),
  updateCube: (cube, setVisible) => updateCube({ get, set, cube, setVisible }),
}));
