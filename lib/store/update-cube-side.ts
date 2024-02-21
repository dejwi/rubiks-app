import { ICubeSide } from "@/types/types";
import { IStoreFn } from "./store";
import { colorMapThree } from "../maps/cube";
import { cube_sides } from "../maps/cube";
import { colorEmissiveIntensityMap } from "../maps/color-emissive-intesity";
import { ghostSideAnimationSettings } from "@/components/cube-visualization/animation-settings";

const updateCubeSide = ({ get, set, colors, side }: IStoreFn & { side: ICubeSide; colors: ICubeSide[] }) => {
  const stickers = get().objects.current.stickers;
  const idx = cube_sides.indexOf(side) * 9;
  const newCube = [...get().cube];
  for (let i = 0; i < colors.length; i++) {
    const sticker = stickers[idx + i];
    const color = colorMapThree[colors[i]];
    sticker.material.emissive = color;

    sticker.material.emissiveIntensity = get().isScanRefreshGlow ? colorEmissiveIntensityMap[color.getHexString()] : 0;

    gsap.to(sticker.material.color, {
      r: color.r,
      g: color.g,
      b: color.b,
      duration: 0.3,
      ease: "power1.inOut",
      delay: ghostSideAnimationSettings.delayBy(i) / 2,
    });

    newCube[idx + i] = colors[i];
  }
  set({ cube: newCube.join("") });
};

export default updateCubeSide;
