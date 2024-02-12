import * as THREE from "three";

export const ghostSideAnimationSettings = {
  color: new THREE.Color("gray"),
  baseOpacity: 0.1,
  endOpacity: 0.05,
  baseOffset: 0.1,
  endOffset: 0.2,
  duration: 1.1,
  delayBy: (i: number) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    return (row + col) * 0.1;
  },
};
