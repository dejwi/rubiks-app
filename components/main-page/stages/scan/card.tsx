"use client";

import { useAppStore } from "@/lib/store/store";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { colorMapThree } from "@/lib/maps/cube";
import { cubeSidesFull, cubeSidesNamedColors, cube_sides_scan } from "@/lib/maps/cube";
import ScanColorPanel from "./color-panel";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CubePosAnchor } from "@/components/cube-visualization/cube-pos-anchor";

const ScanCard = () => {
  const [isConfirmingColors, setIsConfirmingColors] = useState(false);

  const { scanSize, updateCubeScan, updateStore, currentScanFace, lastScanResult } = useAppStore();

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
  );
};

export default ScanCard;
