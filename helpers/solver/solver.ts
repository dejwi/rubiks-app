import { solve_thistlethwaite } from "@/components/testcube/test";
import { fcube_to_ifcube } from "@/components/testcube/test2";

export const solveCube = (cube: string) => {
  const ifcube = fcube_to_ifcube(cube);
  const solve = solve_thistlethwaite(ifcube);
  return solve;
};
