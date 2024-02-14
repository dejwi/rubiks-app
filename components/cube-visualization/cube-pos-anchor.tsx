"use client";

import { useAppStore } from "@/lib/store/store";
import { useCallback } from "react";
import { THREE_HEIGHT, THREE_WIDTH } from "./cube-three";
import { cn } from "@/lib/utils";

export const CubePosAnchor = ({ className }: { className?: string }) => {
  const { cubeScale, updateStore } = useAppStore();

  const refCallback = useCallback(
    (ref: HTMLDivElement | null) => {
      if (!ref) return;
      // const pos = ref.getBoundingClientRect();
      // updateStore({ cubeTop: pos.top - (window.innerHeight * cubeScale) / 2 });
      //
      const pos = ref.getBoundingClientRect();
      console.log("pos", pos);
      updateStore({
        cubeTop: pos.top - (THREE_HEIGHT * cubeScale) / 2,
        cubeLeft: pos.left - (THREE_WIDTH * cubeScale) / 2,
      });
    },
    [cubeScale]
  );

  return <div className={cn("cube-anchor", className)} ref={refCallback} />;
};
