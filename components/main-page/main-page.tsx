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
import { AnimatePresence, motion } from "framer-motion";
import InitStage from "./stages/init";
import ScanCubeStage from "./stages/scan/scan";
import SolveCubeStage from "./stages/solve/solve";

const MainPage = ({ children }: PropsWithChildren) => {
  const currentAppStage = useAppStore((state) => state.currentAppStage);

  useInitApp();

  return (
    <div className="h-screen flex flex-col justify-center overflow-hidden max-w-screen">
      <AnimatePresence mode="wait">
        {(currentAppStage === "homepage" || currentAppStage === "deviceselect") && <InitStage key="init-stage" />}
        {currentAppStage === "scan" && <ScanCubeStage key="scan-stage" />}
        {currentAppStage === "solve" && <SolveCubeStage key="solve-stage" />}
      </AnimatePresence>
      <CubeVisualization />
      <CubeDevTools />
    </div>
  );
};

export default MainPage;
