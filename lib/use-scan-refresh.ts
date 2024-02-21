import { cube_sides_scan } from "./maps/cube";
import { useAppStore } from "@/lib/store/store";
import { IScanResult } from "@/types/types";
import { useEffect } from "react";

interface IProps {
  getScannedColors: () => IScanResult;
}

export const useScanRefresh = ({ getScannedColors }: IProps) => {
  const [isScanRefreshing, updateCubeSide, currentScanFace, updateStore] = useAppStore((s) => [
    s.isScanRefreshing,
    s.updateCubeSide,
    s.currentScanFace,
    s.updateStore,
  ]);

  useEffect(() => {
    if (!isScanRefreshing) return;

    const interval = setInterval(() => {
      const scannedData = getScannedColors();
      updateStore({ lastScanResult: scannedData.map((scanData) => ({ ...scanData, id: Math.random() })) });
      if (currentScanFace !== null && currentScanFace !== -1) {
        updateCubeSide(
          cube_sides_scan[currentScanFace],
          scannedData.map((d) => d.destSide)
        );
      }
    }, 550);
    return () => {
      clearInterval(interval);
    };
  }, [isScanRefreshing, getScannedColors, currentScanFace, updateCubeSide, updateStore]);
};
