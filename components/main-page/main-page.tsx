"use client";

import React, { PropsWithChildren, use, useRef, useState } from "react";
import { DeviceSelect } from "./device-select";
import { useGetScannedColors } from "./use-get-scanned-colors";
import { useAppStore } from "@/lib/store";
import { Button } from "../ui/button";
import { CubeDevTools } from "../devtools/devtools";
import CubeVisualization from "../cube-visualization/cube-visulatization";
import DevScanResultPreview from "../devtools/scan-result-preview";
import { Separator } from "../ui/separator";
import { useScanRefresh } from "@/lib/use-scan-refresh";
import { cube_sides_scan } from "@/helpers/helper";
import { cn } from "@/lib/utils";
import MainPageHeading from "./heading/heading";

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
  } = useAppStore();

  const getScannedColors = useGetScannedColors({ video, canvas });
  useScanRefresh({ getScannedColors });

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
  const onPause = () => {
    video.current?.pause();
  };
  const onScan = () => {
    updateCubeScan(getScannedColors());
  };

  const mainBtnClick = () => {
    if (currentAppStage === "homepage") {
      updateStore({ currentAppStage: "deviceselect" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="mx-4 flex justify-between mt-[-10vh]">
        <MainPageHeading />
      </div>

      <div>{true && <CubeVisualization />}</div>

      <div className="self-center mt-[5rem] relative flex items-center justify-center">
        {/* {currentAppStage === "deviceselect" && <DeviceSelect />} */}
        <div
          className={cn(
            "absolute transition-opacity opacity-0 pointer-events-none flex gap-2",
            currentAppStage === "deviceselect" && "opacity-100 pointer-events-auto"
          )}
        >
          <DeviceSelect />
          <Button onClick={mainBtnClick}>Scan</Button>
        </div>
        <Button
          onClick={mainBtnClick}
          className={cn(
            "transition-opacity  pointer-events-none opacity-0",
            currentAppStage === "homepage" && "opacity-100 pointer-events-auto"
          )}
        >
          Continue
        </Button>
      </div>
      {/* <DeviceSelect />
      <Separator className="my-4" />
      <div className="flex gap-4 mb-4">
        <Button onClick={onStart} disabled={!deviceId}>
          Start
        </Button>
        <Button onClick={onPause} variant="destructive">
          Pause
        </Button>
        <Button onClick={onScan} variant="outline">
          Scan
        </Button>
        <Button onClick={() => initSolveCube()} variant="outline" disabled={currentScanFace !== null}>
          Init solve
        </Button>
        <CubeDevTools />
      </div> */}
      {/* <div className="flex gap-4">
        <div className="relative flex items-center justify-center w-[40rem]">
          <video autoPlay ref={video} className={scanReversed || previewReversed ? "-scale-x-100" : undefined} />
          {streamStared && (
            <div
              className="absolute grid grid-cols-3 grid-rows-3 [&_div]:border-2 [&_div]:border-slate-600 rounded-lg border-2 border-slate-600 border-collapse overflow-hidden opacity-50"
              style={{ width: `${scanSize}px`, height: `${scanSize}px` }}
            >
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
          )}
        </div>
        {devScanPreviewShow && streamStared && <DevScanResultPreview />}
      </div> */}
      <canvas ref={canvas} className={`w-[40rem] hidden  ${scanReversed ? "-scale-x-100" : ""}`} />
    </div>
  );
};

export default MainPage;
