import { ghostSideAnimationSettings } from "@/components/cube-visualization/animation-settings";
import { IStoreFn } from "./store";
import gsap from "gsap";

export const toggleCubeRotating = ({ get }: IStoreFn) => {
  const { cubeSpinningTimeline: timeline } = get();
  const { rubiksGroup, cubes } = get().objects.current;

  if (timeline.current) {
    timeline.current.kill();
    timeline.current = null;

    console.log(rubiksGroup.rotation.y);
    gsap.to(rubiksGroup.rotation, {
      y: 0,
      duration: Math.abs(rubiksGroup.rotation.y * 0.16),
      ease: "easeInOut",
    });
    return;
  }
  timeline.current = gsap.timeline();

  cubes.forEach((cube, i) => {
    cube.children.forEach((child) =>
      gsap.to((child as THREE.Mesh).material, {
        opacity: 1,
        duration: 0.2,
        ease: "power1.inOut",
        delay: ghostSideAnimationSettings.delayBy(i),
      })
    );

    gsap.from(cube.position, {
      y: "-=1",
      duration: 0.2,
      ease: "power1.inOut",
      delay: ghostSideAnimationSettings.delayBy(i),
    });
  });
  timeline.current.add(
    gsap.to(rubiksGroup.rotation, {
      y: "+=" + Math.PI * 2,
      duration: 5,
      ease: "none",
      repeat: -1,
    })
  );
};
