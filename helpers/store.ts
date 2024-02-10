import { create } from "zustand";
import { ICubeSide } from "./types";
import { colorMapThree } from "./helper";
import { genEmptyThreeCube } from "@/components/cube-visualization/gen-empty-cube";
import { createRef } from "react";

const objects = createRef() as React.MutableRefObject<ReturnType<typeof genEmptyThreeCube>>;
objects.current = genEmptyThreeCube();

const defaultStore = {
  highlight: undefined as ICubeSide | undefined,
  cube: Array(54).fill("X").join(""),
  currentScanFace: 0 as number | null,
  scanReversed: true,
  scanSize: 170,
  deviceId: "",
  previewReversed: true,
  devScanPreviewShow: true,
  devScanPreviewRefresh: true,
  objects,
};

type IDefaultData = typeof defaultStore;

interface IStore extends IDefaultData {
  updateStore: (payload: Partial<IStore>) => void;
  updateCube: (cube: string) => void;
}

export const useAppStore = create<IStore>()((set, get) => ({
  ...defaultStore,
  updateStore: (payload) => set(payload),
  updateCube(cube) {
    if (cube.length !== 54) return;
    // const stickers = get().objects.current.stickers;
    // for (let i = 0; i < 54; i++) {
    //   const sticker = stickers[i];
    //   const color = cube[i];

    //   sticker.material.opacity = color === "X" ? 0 : 1;
    //   if (color !== "X") {
    //     sticker.material.color = colorMapThree[color as ICubeSide];
    //     sticker.material.emissive = colorMapThree[color as ICubeSide];
    //   }
    // }
    console.log("update cube");
    set({ cube });
  },
}));
