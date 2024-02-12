"use client";

import React from "react";
import MainPageHeading from "../heading/heading";
import { motion } from "framer-motion";
import { DeviceSelect } from "../device-select";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/store";
import { cameraPositions } from "@/helpers/camera-positions";

const InitStage = React.forwardRef<HTMLDivElement>((_, forwardedRef) => {
  const {
    currentAppStage,
    updateStore,
    deviceId,
    updateCameraPos,
    toggleCubeRotating,
    hideCubeStickers,
    updateCubeScan,
  } = useAppStore();

  const mainBtnClick = () => {
    if (currentAppStage === "homepage") {
      updateStore({ currentAppStage: "deviceselect" });
    } else if (currentAppStage === "deviceselect" && deviceId) {
      updateStore({ currentAppStage: "scan" });
      toggleCubeRotating();
      setTimeout(() => {
        hideCubeStickers();
      }, 500);
      setTimeout(() => {
        updateCubeScan([]);
      }, 850);
    }
  };

  return (
    <div ref={forwardedRef} className="mt-[-10vh] flex flex-col">
      <div className="mx-4 flex justify-between">
        <MainPageHeading />
      </div>
      {/* <CubeVisualization headingTop={headingRef?.current?.getBoundingClientRect().top} /> */}
      <div className="self-center mt-[5rem] relative flex gap-4">
        {currentAppStage === "deviceselect" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DeviceSelect />
          </motion.div>
        )}
        <Button asChild>
          <motion.button
            onClick={mainBtnClick}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.6 } }}
          >
            {currentAppStage === "homepage" ? "Continue" : "Scan"}
          </motion.button>
        </Button>
      </div>
    </div>
  );
});
InitStage.displayName = "InitStage";

export default InitStage;
