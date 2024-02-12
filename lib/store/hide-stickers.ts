import { ghostSideAnimationSettings } from "@/components/cube-visualization/animation-settings";
import { IStoreFn } from "./store";
import gsap from "gsap";

export const hideCubeStickers = ({ get }: IStoreFn) => {
  const stickers = get().objects.current.stickers;
  stickers.forEach((sticker, i) => {
    gsap.to(sticker.material, {
      opacity: 0,
      duration: 0.1,
      delay: ghostSideAnimationSettings.delayBy(i) / 4,
      ease: "power1.inOut",
    });
  });
};
