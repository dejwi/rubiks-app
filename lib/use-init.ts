import { useEffect, useRef } from "react";
import { useAppStore } from "./store/store";
import { solved_cube } from "@/helpers/helper";

const useInitApp = () => {
  const { toggleCubeRotating, updateCube } = useAppStore();

  const inited = useRef(false);
  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    updateCube(solved_cube);
    setTimeout(() => {
      toggleCubeRotating();
    }, 2200);
  }, []);
};

export default useInitApp;
