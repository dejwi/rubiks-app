"use client";

import React from "react";
import { useAppStore } from "@/lib/store/store";
import { CubeDevTools } from "../devtools/devtools";
import CubeVisualization from "../cube-visualization/cube-visualization";

import useInitApp from "@/lib/use-init";
import { AnimatePresence } from "framer-motion";
import InitStage from "./stages/init/init";
import ScanCubeStage from "./stages/scan/scan";
import SolveCubeStage from "./stages/solve/solve";

const MainPage = () => {
  const currentAppStage = useAppStore((state) => state.currentAppStage);

  useInitApp();

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {(currentAppStage === "homepage" || currentAppStage === "deviceselect") && <InitStage key="init-stage" />}
        {currentAppStage === "scan" && <ScanCubeStage key="scan-stage" />}
        {currentAppStage === "solve" && <SolveCubeStage key="solve-stage" />}
      </AnimatePresence>
      <CubeVisualization />
      {process.env.NEXT_PUBLIC_DEV_MODE === "true" && <CubeDevTools />}
    </div>
  );
};

export default MainPage;
