import { colorMapThree } from "../maps/cube";
import { IStoreFn } from "./store";
import { ICubeSide } from "@/types/types";

export const updateCube = ({ get, set, cube, setVisible }: IStoreFn & { cube: string; setVisible?: boolean }) => {
  if (cube.length !== 54) return;
  const stickers = get().objects.current.stickers;
  for (let i = 0; i < 54; i++) {
    const sticker = stickers[i];
    const color = cube[i];

    // if (color !== "X") {
    sticker.material.color = colorMapThree[color as ICubeSide].clone();
    sticker.material.emissive = colorMapThree[color as ICubeSide];
    // }
  }
  if (setVisible)
    get().objects.current.cubes.forEach((g) =>
      g.children.forEach((c) => (((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 1))
    );

  set({ cube });
};
