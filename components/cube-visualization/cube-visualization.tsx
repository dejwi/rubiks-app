import React from "react";
import CubeThree from "./cube-three";
import { Variants, motion } from "framer-motion";
import { useAppStore } from "@/lib/store/store";
import { init } from "next/dist/compiled/webpack/webpack";

interface IProps {
  headingTop: number | undefined;
}

const CubeVisualization = ({ headingTop }: IProps) => {
  const { currentAppStage, scanCardRight, scanCardTop } = useAppStore();
  const initTop = headingTop ?? 0;

  const variants: Variants = {
    init: {
      y: [initTop + 20, initTop, initTop + 20], // Define the y-axis animation values
      transition: {
        repeat: Infinity, // Repeat the animation infinitely
        duration: 3, // Duration of each animation cycle
        ease: "easeInOut", // Use linear easing for smoother animation
        delay: 3,
      },
    },
    scan: {
      y: scanCardTop + 20,
      x: -scanCardRight + 370,
      transition: {
        ease: "easeOut",
        duration: 0.8,
      },
    },
  };
  // style={{ top: headingTop }}
  return (
    <motion.div
      className="absolute right-0 top-0"
      variants={variants}
      initial={{ y: initTop }}
      animate={currentAppStage === "scan" ? "scan" : "init"}
    >
      <CubeThree />
    </motion.div>
  );
};

export default CubeVisualization;
