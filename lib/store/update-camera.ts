import { IStoreFn } from "./store";
import gsap from "gsap";

export const updateCameraPos = ({ get, cameraPos }: IStoreFn & { cameraPos: [number, number, number] }) => {
  const { camera } = get();
  gsap.to(camera.current.position, {
    x: cameraPos[0],
    y: cameraPos[1],
    z: cameraPos[2],
    duration: 0.6,
    ease: "power1.inOut",
  });
};
