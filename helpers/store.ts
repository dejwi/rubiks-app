import { create } from "zustand";
import { ICubeSide, IScanResult } from "./types";
import { colorMapThree, cube_sides, cube_sides_scan } from "./helper";
import { genEmptyThreeCube } from "@/components/cube-visualization/gen-empty-cube";
import { createRef } from "react";
import { ghostSideAnimationSettings } from "@/components/cube-visualization/animation-settings";
import gsap from "gsap";
import * as THREE from "three";
import { cameraPositions } from "./camera-positions";

const getObjectsDefault = () => {
  const objects = createRef() as React.MutableRefObject<ReturnType<typeof genEmptyThreeCube>>;
  objects.current = genEmptyThreeCube();
  return objects;
};
const getCameraDefault = () => {
  const camera = createRef() as React.MutableRefObject<THREE.PerspectiveCamera>;
  camera.current = new THREE.PerspectiveCamera(40, 500 / 500);
  return camera;
};

const defaultStore = {
  threeWidth: 500,
  threeHeight: 500,
  highlight: undefined as ICubeSide | undefined,
  cube: Array(54).fill("X").join(""),
  currentScanFace: -1 as number | null,
  scanReversed: false,
  scanSize: 170,
  deviceId: "",
  previewReversed: true,
  devScanPreviewShow: true,
  devScanPreviewRefresh: true,
  objects: getObjectsDefault(),
  timeline: createRef() as React.MutableRefObject<gsap.core.Timeline>,
  camera: getCameraDefault(),
};

type IDefaultData = typeof defaultStore;

interface IStore extends IDefaultData {
  updateStore: (payload: Partial<IStore>) => void;
  updateCube: (cube: string) => void;
  updateCubeScan: (scan: IScanResult) => void;
}

export const useAppStore = create<IStore>()((set, get) => ({
  ...defaultStore,
  updateStore: (payload) => set(payload),
  updateCubeScan(scan) {
    const {
      currentScanFace,
      objects,
      timeline,
      cube,
      camera: { current: camera },
    } = get();

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

        gsap.to(prevGhostSticker.position, {
          x: orgPos.x,
          y: orgPos.y,
          z: orgPos.z,
          opacity: 1,
          duration: 0.05,
          ease: "power1.inOut",
          delay: delayBy(i),
        });
        gsap.to(prevGhostSticker.material.color, {
          r: newColor.r,
          g: newColor.g,
          b: newColor.b,
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

      sticker.material.color = ghostSideAnimationSettings.color.clone();

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

      const newCameraPos = cameraPositions[currentScanFace + 1] || cameraPositions[0];

      // Animate camera position change
      gsap.to(camera.position, {
        x: newCameraPos[0],
        y: newCameraPos[1],
        z: newCameraPos[2],
        duration: 0.6,
        ease: "power1.inOut",
      });

      set({ currentScanFace: currentScanFace + 1 });
    }
  },
  updateCube(cube) {
    if (cube.length !== 54) return;
    const stickers = get().objects.current.stickers;
    for (let i = 0; i < 54; i++) {
      const sticker = stickers[i];
      const color = cube[i];

      sticker.material.opacity = color === "X" ? 0 : 1;
      if (color !== "X") {
        sticker.material.color = colorMapThree[color as ICubeSide];
        sticker.material.emissive = colorMapThree[color as ICubeSide];
      }
    }
    console.log("update cube");
    set({ cube });
  },
}));
