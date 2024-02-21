"use client";

import { CubePosAnchor } from "@/components/cube-visualization/cube-pos-anchor";
import { THREE_HEIGHT, THREE_WIDTH } from "@/components/cube-visualization/cube-three";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cameraPositions } from "@/helpers/camera-positions";
import { useAppStore } from "@/lib/store/store";
import { useEffect, useRef } from "react";

const SolveCubeStage = () => {
  const { updateStore, initSolveCube, updateCameraPos, cubeSolutionStep, cubeSolution, nextCubeSolveStep } =
    useAppStore();
  const { toast } = useToast();

  const inited = useRef(false);
  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    updateStore({ cubeScale: 1 });
    try {
      initSolveCube();
      updateCameraPos(cameraPositions.F);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to generate cube solution - cube scan may be incorrect",
        title: "Error",
        duration: Infinity,
      });
    }
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-center flex-col overflow-hidden">
      {cubeSolutionStep !== null && (
        <h1 className="text-muted-foreground grid grid-cols-3 w-[10rem] items-end">
          <span className="text-lg leading-none text-right">move</span>
          <span className="text-foreground text-3xl leading-none text-center">{cubeSolution[cubeSolutionStep]}</span>
          <span className="text-xs leading-none">
            {cubeSolutionStep} / {cubeSolution.length}
          </span>
        </h1>
      )}
      <div
        className="flex items-center justify-center"
        style={{ width: `${THREE_WIDTH}px`, height: `${THREE_HEIGHT - 100}px` }}
      >
        <CubePosAnchor />
      </div>
      {cubeSolutionStep !== null && (
        <Button onClick={() => nextCubeSolveStep()} style={{ width: `${THREE_WIDTH - 160}px` }}>
          Next move
        </Button>
      )}
    </div>
  );
};

export default SolveCubeStage;
