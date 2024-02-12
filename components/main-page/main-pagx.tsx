"use client";

import React, { use, useRef, useState } from "react";
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

const MainPage = () => {
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

  return (
    <div className="flex flex-col mt-4 mx-2">
      <DeviceSelect />
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
      </div>
      {!!cubeSolution.length && (
        <div className="text-lg font-semibold">
          Current solve move: {cubeSolution[cubeSolutionStep]}{" "}
          <Button className="ml-4" onClick={() => nextCubeSolveStep()}>
            Next step
          </Button>
        </div>
      )}
      {currentScanFace !== null && (
        <div className="text-lg font-semibold">Scanning: {cube_sides_scan[currentScanFace]}</div>
      )}
      <div className="flex gap-4">
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
      </div>
      <div>{true && <CubeVisualization />}</div>
      <canvas ref={canvas} className={`w-[40rem] hidden  ${scanReversed ? "-scale-x-100" : ""}`} />
    </div>
  );
};

export default MainPage;
