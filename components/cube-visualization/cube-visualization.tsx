"use client";

import React, { useEffect } from "react";
import CubeThree, { THREE_HEIGHT, THREE_WIDTH } from "./cube-three";
import { Variants, motion } from "framer-motion";
import { useAppStore } from "@/lib/store/store";
import { clear } from "console";

const CubeVisualization = () => {
  const { currentAppStage, cubeTop, cubeScale, cubeLeft } = useAppStore();

  const variants: Variants = {
    initAnim: {
      scale: [cubeScale],
      x: [cubeLeft], // Define the x-axis animation values
      // y: [0, 0], // Define the y-axis animation values
      y: [cubeTop + 20, cubeTop, cubeTop + 20], // Define the y-axis animation values
      transition: {
        repeat: Infinity, // Repeat the animation infinitely
        duration: 3, // Duration of each animation cycle
        ease: "easeInOut", // Use linear easing for smoother animation
        delay: 3,
      },
    },
    default: {
      y: cubeTop,
      x: cubeLeft,
      scale: cubeScale,
      transition: {
        ease: "easeOut",
        duration: 0.8,
      },
    },
  };

  const getVariant = () => {
    if (currentAppStage === "homepage" || currentAppStage === "deviceselect") {
      return "initAnim";
    }
    return "default";
  };

  return (
    <div className="fixed w-screen h-screen overflow-hidden pointer-events-none">
      <motion.div className="absolute left-0 top-0 origin-top-left" variants={variants} animate={getVariant()}>
        <CubeThree />
      </motion.div>
    </div>
  );
};

export default CubeVisualization;
