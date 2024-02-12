"use client";

import { Button } from "@/components/ui/button";
import { useScanRefresh } from "@/lib/use-scan-refresh";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGetScannedColors } from "../../use-get-scanned-colors";
import { useAppStore } from "@/lib/store/store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cubeSidesFull, cube_sides_scan } from "@/helpers/helper";
import ScanColorPanel from "./color-panel";
import { AnimatePresence } from "framer-motion";

const ScanCubeStage = React.forwardRef<HTMLDivElement>((_, forwardedRef) => {
  const [video, setVideo] = useState<HTMLVideoElement>();
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [streamStared, setStreamStarted] = useState(false);
  const [isConfirmingColors, setIsConfirmingColors] = useState(false);

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
    lastScanResult,
  } = useAppStore();

  const getScannedColors = useGetScannedColors({ video, canvas });
  useScanRefresh({ getScannedColors });

  const inited = useRef(false);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    const videoEl = document.querySelector("video") as HTMLVideoElement;
    const canvasEl = document.querySelector("#canvas-scan") as HTMLCanvasElement;

    setVideo(videoEl);
    setCanvas(canvasEl);

    const fn = async () => {
      if (streamStared) {
        videoEl.play();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId }, width: 720, height: 1280 },
      });
      videoEl.srcObject = stream;
      videoEl.play();
    };

    fn();
    updateStore({ isScanRefreshing: true });
  }, []);

  const cardRefCallback = useCallback((ref: HTMLDivElement | null) => {
    if (!ref) return;
    const pos = ref.getBoundingClientRect();
    updateStore({ scanCardTop: pos.top, scanCardRight: pos.right });
  }, []);

  const mainCardBtnClick = () => {
    if (isConfirmingColors) {
      setIsConfirmingColors(false);
      updateCubeScan(lastScanResult);
      updateStore({ isScanRefreshing: true });
      return;
    }

    updateStore({ isScanRefreshing: false });
    console.log(lastScanResult);
    setIsConfirmingColors(true);
  };

  return (
    <div>
      {/* <div className="flex gap-4 mb-4">
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
      </div> */}
      <div className="flex w-screen h-screen relative  items-center justify-center">
        <video
          autoPlay
          className={scanReversed || previewReversed ? "-scale-x-100" : undefined}
          onCanPlay={() => setStreamStarted(true)}
        />
        <div className="absolute">
          <Card
            className="w-[350px] bg-card/80 backdrop-blur-sm"
            style={{ marginTop: `calc(-${scanSize}px - 12.5rem )` }}
            ref={cardRefCallback}
          >
            <CardHeader className="py-4">
              <CardTitle className="text-muted-foreground">
                Show{" "}
                <span className="text-foreground text-lg">
                  {currentScanFace && currentScanFace !== -1
                    ? cubeSidesFull[cube_sides_scan[currentScanFace]]
                    : cubeSidesFull.F}
                </span>{" "}
                face
              </CardTitle>
              {/* <CardDescription>Tap color to correct it</CardDescription> */}
            </CardHeader>
            <CardContent className="h-[9rem] flex items-start">
              <AnimatePresence>{isConfirmingColors && <ScanColorPanel key="scan-color-panel" />}</AnimatePresence>
            </CardContent>
            <CardFooter className="flex justify-between py-4">
              <Button variant="outline" disabled>
                Cancel
              </Button>
              <Button disabled={currentScanFace === -1} onClick={mainCardBtnClick}>
                {isConfirmingColors ? "Confirm" : "Scan"}
              </Button>
            </CardFooter>
          </Card>
        </div>
        {streamStared && (
          <div
            className="absolute grid grid-cols-3 grid-rows-3 [&_div]:border-2 [&_div]:border-zinc-900 rounded-lg border-2 border-zinc-900 border-collapse overflow-hidden opacity-70"
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
      <canvas id="canvas-scan" className={`w-[40rem] hidden  ${scanReversed ? "-scale-x-100" : ""}`} />
    </div>
  );
});

ScanCubeStage.displayName = "ScanCubeStage";

export default ScanCubeStage;
