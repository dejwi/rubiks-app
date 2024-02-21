"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { colorMapThree } from "@/lib/maps/cube";
import { cube_sides, cube_sides_scan } from "@/lib/maps/cube";
import { ICubeSide } from "@/types/types";
import { useAppStore } from "@/lib/store/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

const ScanColorPanel = () => {
  const [lastScanResult, updateCubeSide, updateStore, currentScanFace] = useAppStore((state) => [
    state.lastScanResult,
    state.updateCubeSide,
    state.updateStore,
    state.currentScanFace,
  ]);

  const onUpdateColorClick = (destColor: ICubeSide, i: number) => {
    if (currentScanFace === null) return;

    const newResult = lastScanResult.map((r, idx) => {
      if (idx === i) {
        return { ...r, destSide: destColor };
      }
      return r;
    });

    updateCubeSide(
      cube_sides_scan[currentScanFace],
      newResult.map((d) => d.destSide)
    );
    updateStore({ lastScanResult: newResult });
  };

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <span className="text-sm text-muted-foreground">Tap color to correct it</span>
      <div className="grid grid-cols-3 grid-rows-3 gap-2 mt-2">
        {lastScanResult.map(({ destSide, id }, i) => (
          <Popover key={`color-pan-${id}`}>
            <PopoverTrigger asChild>
              <button
                className="w-8 h-8 rounded border shadow border-zinc-950 data-[state=open]:brightness-[0.6] transition data-[state=open]:scale-90"
                style={{ background: `#${colorMapThree[destSide].getHexString()}` }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-48">
              {/* <span className="text-base text-foreground font-medium">Color</span> */}
              <div className="flex gap-2 flex-wrap mt-2">
                {cube_sides.map((side) => (
                  <button
                    onClick={() => onUpdateColorClick(side, i)}
                    key={`col-pan-${id}-${side}`}
                    className={cn(
                      "w-7 h-7 rounded shadow border-2 border-zinc-950 transition",
                      destSide === side && "scale-75 brightness-[0.6]"
                    )}
                    style={{ background: `#${colorMapThree[side].getHexString()}` }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </motion.div>
  );
};

export default ScanColorPanel;
