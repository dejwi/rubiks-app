import { useEffect, useRef } from "react";
import { useAppStore } from "./store/store";
import { solved_cube } from "@/lib/helpers/helper";

const useInitApp = () => {
  const { toggleCubeRotating, updateCube, updateStore } = useAppStore();

  const inited = useRef(false);
  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    // updateStore({ cubeScale: 200 / window.innerWidth });

    updateCube(solved_cube);
    setTimeout(() => {
      toggleCubeRotating();
    }, 2200);
  }, []);
};

export default useInitApp;
