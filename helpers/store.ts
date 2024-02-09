import { create } from "zustand";
import { ICubeSide } from "./types";
import { cube_sides_scan } from "./helper";

const defaultStore = {
  highlight: cube_sides_scan[0] as ICubeSide | undefined,
  cube: Array(54).fill("X").join(""),
  currentScanFace: 0,
  scanComplete: false,
  scanReversed: true,
  scanSize: 170,
  deviceId: "",
  previewReversed: true,
  devScanPreviewShow: true,
  devScanPreviewRefresh: true,
};

type IStore = typeof defaultStore;

export const useAppStore = create<IStore & { updateStore: (payload: Partial<IStore>) => void }>()((set) => ({
  ...defaultStore,
  updateStore: (payload) => set(payload),
}));
