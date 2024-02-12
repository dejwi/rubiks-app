import { fcube_to_ifcube } from "./fcube-to-ifcube";
import { solve_thistlethwaite } from "./solve-thistlethwaite";

export const solveCube = (cube: string) => {
  const ifcube = fcube_to_ifcube(cube);
  const solve = solve_thistlethwaite(ifcube);

  return solve;
};
