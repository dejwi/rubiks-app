"use client";

import { Button } from "@/components/ui/button";
import { useScanRefresh } from "@/lib/use-scan-refresh";
import React, { useEffect, useRef, useState } from "react";
import { useGetScannedColors } from "../../use-get-scanned-colors";
import { useAppStore } from "@/lib/store/store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { colorMapThree, cubeSidesFull, cubeSidesNamedColors, cube_sides_scan } from "@/helpers/helper";
import ScanColorPanel from "./color-panel";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CubePosAnchor } from "@/components/cube-visualization/cube-pos-anchor";

const ScanCubeStage = () => {
  const [video, setVideo] = useState<HTMLVideoElement>();
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [streamStared, setStreamStarted] = useState(false);
  const [isConfirmingColors, setIsConfirmingColors] = useState(false);

  const {
    scanReversed,
    previewReversed,
    scanSize,
    deviceId,
    updateCubeScan,
    updateStore,
    currentScanFace,
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
        video: {
          deviceId: { exact: deviceId },
          aspectRatio: 9 / 16,
          height: { exact: 1280 },
        },
      });

      videoEl.srcObject = stream;
      videoEl.play();
    };

    fn();
  }, []);

  const mainCardBtnClick = () => {
    if (isConfirmingColors) {
      setIsConfirmingColors(false);
      updateCubeScan(lastScanResult);

      if (currentScanFace !== cube_sides_scan.length - 1) {
        updateStore({ isScanRefreshing: true });
      }
      return;
    }

    updateStore({ isScanRefreshing: false });
    setIsConfirmingColors(true);
  };

  const onVideoCanPlay = () => {
    setStreamStarted(true);
    if (!streamStared) {
      updateStore({ isScanRefreshing: true });
      updateCubeScan([]);
    }
  };

  const onSolveClick = () => {
    updateStore({ currentAppStage: "solve" });
  };

  const disabledScanConfirmBtn = () => {
    if (currentScanFace === -1) return true;
    if (isConfirmingColors) {
      if (lastScanResult.some((r) => r.destSide === "X")) return true;
      // Check if middle color is of the correct side
      if (
        currentScanFace !== null &&
        currentScanFace !== -1 &&
        lastScanResult.length === 9 &&
        lastScanResult[4].destSide !== cube_sides_scan[currentScanFace]
      )
        return true;
    }
  };

  return (
    <div>
      <motion.div
        className="flex w-screen h-screen relative  items-center justify-center"
        initial={{ opacity: 0 }}
        animate={streamStared ? { opacity: 1, transition: { delay: 0.5 } } : { opacity: 0 }}
        exit={{ opacity: 0 }}
      >
        <motion.video
          autoPlay
          className={scanReversed || previewReversed ? "-scale-x-100" : undefined}
          onCanPlay={onVideoCanPlay}
          playsInline
        />
        <div className="absolute">
          <Card
            className="w-[350px] bg-card/80 backdrop-blur-sm relative"
            style={{ marginTop: `calc(-${scanSize}px - 9rem )` }}
          >
            <CardHeader className="pt-4 pb-0 relative">
              <CardTitle
                className={cn(
                  "text-muted-foreground transition-opacity duration-700 delay-700",
                  currentScanFace === null && "opacity-0"
                )}
              >
                {isConfirmingColors ? "Confirm" : "Show"}{" "}
                <span
                  className="text-lg"
                  style={{
                    color:
                      currentScanFace !== null && currentScanFace !== -1
                        ? `#${colorMapThree[cube_sides_scan[currentScanFace]].getHexString()}`
                        : "",
                  }}
                >
                  {currentScanFace !== null && currentScanFace !== -1
                    ? cubeSidesFull[cube_sides_scan[currentScanFace]]
                    : cubeSidesFull.F}{" "}
                </span>{" "}
                face
              </CardTitle>
              {!isConfirmingColors && currentScanFace !== null && currentScanFace !== -1 && (
                <CardDescription className="!mt-0 absolute top-full">
                  Center color -{" "}
                  <span
                    style={{
                      color: `#${colorMapThree[cube_sides_scan[currentScanFace]].getHexString()}`,
                    }}
                  >
                    {cubeSidesNamedColors[cube_sides_scan[currentScanFace]]}
                  </span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="h-[10.5rem]">
              {currentScanFace !== null ? (
                <div className="grid grid-cols-[1fr_1fr] h-full w-full">
                  <div>
                    <AnimatePresence>{isConfirmingColors && <ScanColorPanel key="scan-color-panel" />}</AnimatePresence>
                  </div>
                  <div className="flex w-full justify-center items-center">
                    <CubePosAnchor className="mr-[-3.5rem] mt-[-5rem]" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full w-full ">
                  <CubePosAnchor />
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4 absolute bottom-0 right-0">
              <Button
                variant="outline"
                // disabled={currentScanFace !== null}
                className={cn("w-full transition", currentScanFace !== null && "opacity-0 pointer-events-none")}
                onClick={onSolveClick}
              >
                Solve
              </Button>
              {currentScanFace !== null && (
                <Button disabled={disabledScanConfirmBtn()} onClick={mainCardBtnClick}>
                  {isConfirmingColors ? "Confirm" : "Scan"}
                </Button>
              )}
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
      </motion.div>

      <canvas id="canvas-scan" className={`hidden ${scanReversed ? "-scale-x-100" : ""}`} />
    </div>
  );
};

ScanCubeStage.displayName = "ScanCubeStage";

export default ScanCubeStage;
