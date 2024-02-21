import { ICubeMoves } from "../moves/moves";
import { IStoreFn } from "./store";

const nextCubeSolveStep = ({ get, set }: IStoreFn) => {
  const isIn2Part = get().nextCubeRotation !== null;
  const currentStep = get().cubeSolutionStep;
  const solution = get().cubeSolution;

  if (currentStep === null || get().isDuringRotation) return;

  get().rotateCube2Part(solution[currentStep] as ICubeMoves);
  if (isIn2Part) {
    if (currentStep === solution.length - 1) {
      set({ cubeSolutionStep: null });
      // get().toggleCubeRotating();
    } else {
      set({ cubeSolutionStep: currentStep + 1 });
    }

    return;
  }
};

export default nextCubeSolveStep;
