"use client";

import React, { useState } from "react";
import MainPageHeading from "./heading";
import { AnimatePresence, motion } from "framer-motion";
import { DeviceSelect } from "./device-select";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/store";
import { CubePosAnchor } from "@/components/cube-visualization/cube-pos-anchor";
import ScanInstructionsInfo from "./intructions-info";

const informationButtonLockDuration = 5000;

const InitStage = () => {
  const { currentAppStage, updateStore, deviceId, toggleCubeRotating, hideCubeStickers } = useAppStore();
  const [seconds, setSeconds] = useState(informationButtonLockDuration / 1000);

  const mainBtnClick = () => {
    if (currentAppStage === "homepage") {
      updateStore({ currentAppStage: "deviceselect" });

      // Set the countdown for information/deviceselet screen
      const interval = setInterval(() => setSeconds((seconds) => seconds - 1), 1000);
      setTimeout(() => clearInterval(interval), informationButtonLockDuration + 200);
    } else if (currentAppStage === "deviceselect" && deviceId) {
      updateStore({ currentAppStage: "scan" });
      toggleCubeRotating();
      setTimeout(() => {
        hideCubeStickers();
      }, 500);
    }
  };

  const getMainBtnText = () => {
    if (currentAppStage === "homepage") return "Continue";
    if (seconds > 0) return `Scan (${seconds})`;
    return "Scan";
  };

  return (
    <motion.div className="mt-[-10vh] flex flex-col">
      <div className="mx-4 flex justify-between items-center">
        <AnimatePresence mode="wait">
          {currentAppStage === "deviceselect" ? (
            <ScanInstructionsInfo key="instructions" />
          ) : (
            <MainPageHeading key="main-heading" />
          )}
        </AnimatePresence>
        <CubePosAnchor className="mr-16 -mt-2" />
      </div>
      <motion.div
        className="self-center mt-[5rem] relative flex gap-4"
        exit={{
          y: 40,
          opacity: 0,
          transition: {
            duration: 0.6,
            delay: 0.3,
          },
        }}
      >
        {currentAppStage !== "homepage" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DeviceSelect />
          </motion.div>
        )}
        <Button asChild>
          <motion.button
            onClick={mainBtnClick}
            layout={seconds > 0}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.6 } }}
            disabled={currentAppStage === "deviceselect" && !deviceId && seconds > 0}
          >
            {getMainBtnText()}
          </motion.button>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default InitStage;
