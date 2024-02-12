"use client";

import React, { PropsWithChildren, use, useEffect, useRef, useState } from "react";
import { DeviceSelect } from "./device-select";
import { useGetScannedColors } from "./use-get-scanned-colors";
import { useAppStore } from "@/lib/store/store";
import { Button } from "../ui/button";
import { CubeDevTools } from "../devtools/devtools";
import CubeVisualization from "../cube-visualization/cube-visualization";
import DevScanResultPreview from "../devtools/scan-result-preview";
import { Separator } from "../ui/separator";
import { useScanRefresh } from "@/lib/use-scan-refresh";
import { cube_sides_scan, solved_cube } from "@/helpers/helper";
import { cn } from "@/lib/utils";
import MainPageHeading from "./heading/heading";
import useInitApp from "@/lib/use-init";
import { motion } from "framer-motion";
import InitStage from "./stages/init";
import ScanCubeStage from "./stages/scan/scan";

const MainPage = ({ children }: PropsWithChildren) => {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [streamStared, setStreamStarted] = useState(false);
  const {
    scanReversed,
    previewReversed,
    scanSize,
    deviceId,
    devScanPreviewShow,
    updateCubeScan,
    updateStore,
    currentScanFace,
    initSolveCube,
    cubeSolution,
    cubeSolutionStep,
    nextCubeSolveStep,
    currentAppStage,
    updateCube,
    toggleCubeRotating,
  } = useAppStore();

  const onStart = async () => {
    if (!video.current) return;
    if (!streamStared) {
      updateCubeScan([]);
      updateStore({ isScanRefreshing: true });
    }
    if (streamStared) {
      video.current?.play();
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
    });
    video.current.srcObject = stream;
    setStreamStarted(true);
  };

  const mainBtnClick = () => {
    if (currentAppStage === "homepage") {
      updateStore({ currentAppStage: "deviceselect" });
    }
  };

  useInitApp();
  const headingRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen flex flex-col justify-center">
      {(currentAppStage === "homepage" || currentAppStage === "deviceselect") && <InitStage ref={headingRef} />}
      {currentAppStage === "scan" && <ScanCubeStage />}

      <CubeVisualization headingTop={headingRef?.current?.getBoundingClientRect().top} />
      <CubeDevTools />
    </div>
  );
};

export default MainPage;
