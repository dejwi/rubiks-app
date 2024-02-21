import { IStoreFn } from "./store";
import { solveCube } from "../solver/solver";

const initSolveCube = ({ get, set }: IStoreFn) => {
  const cube = get().cube;
  const solution = solveCube(cube)
    .map((s) => s.split(" "))
    .flat()
    .filter((s) => s !== "");

  if (!solution || !solution.length) {
    set({ cubeSolution: [], cubeSolutionStep: null });
    throw new Error("Unsolveable cube");
  }

  set({ cubeSolution: solution, cubeSolutionStep: 0 });
  get().nextCubeSolveStep();
};

export default initSolveCube;
