import { IStoreFn } from "./store";
import { ghostSideAnimationSettings } from "@/components/cube-visualization/animation-settings";
import { cameraPositions } from "@/lib/maps/camera-positions";
import { colorMapThree } from "../maps/cube";
import { cube_sides_scan, cube_sides } from "../maps/cube";
import { IScanResult } from "@/types/types";
import gsap from "gsap";

const updateCubeScan = ({ get, set, scan }: IStoreFn & { scan: IScanResult }) => {
  const { currentScanFace, objects, ghostStickersTimeline: timeline, cube } = get();

  // Stop the previous timeline if it exists
  if (timeline.current) {
    timeline.current.kill();
  }

  // Create a new timeline
  timeline.current = gsap.timeline();

  if (currentScanFace === null) return;
  const { baseOffset, baseOpacity, delayBy, duration, endOffset, endOpacity } = ghostSideAnimationSettings;
  if (currentScanFace > -1) {
    const currentScanSide = cube_sides_scan[currentScanFace];

    const newCube = [...cube];

    // Update animation for current ghost stickers
    scan.forEach(({ destSide }, i) => {
      const idx = cube_sides.indexOf(currentScanSide) * 9 + i;
      newCube[idx] = destSide;

      const prevGhostSticker = objects.current.stickers[idx];
      const orgPos = objects.current.orgStickerPos[idx];

      const newColor = colorMapThree[destSide];
      prevGhostSticker.material.emissive = newColor;
      prevGhostSticker.material.color = newColor.clone();
      prevGhostSticker.material.emissiveIntensity = 0;

      gsap.to(prevGhostSticker.position, {
        x: orgPos.x,
        y: orgPos.y,
        z: orgPos.z,
        duration: 0.05,
        ease: "power1.inOut",
        delay: delayBy(i),
      });
      gsap.to(prevGhostSticker.material, {
        opacity: 1,
        duration: 0.05,
        ease: "power1.inOut",
        delay: delayBy(i),
      });
    });
    set({ cube: newCube.join("") });
  }
  if (currentScanFace === cube_sides_scan.length - 1) {
    set({ currentScanFace: null });
    return;
  }

  // Set ghost stickers for the next face
  const nextScanSide = cube_sides_scan[currentScanFace + 1];
  for (let i = 0; i < 9; i++) {
    const sticker = objects.current.stickers[cube_sides.indexOf(nextScanSide) * 9 + i];

    // sticker.material.color = ghostSideAnimationSettings.color.clone();

    const targetPosition = sticker.position.clone();
    switch (nextScanSide) {
      case "U":
        targetPosition.y += endOffset;
        sticker.position.y += baseOffset;
        break;
      case "D":
        targetPosition.y -= endOffset;
        sticker.position.y -= baseOffset;
        break;
      case "F":
        targetPosition.z += endOffset;
        sticker.position.z += baseOffset;
        break;
      case "B":
        targetPosition.z -= endOffset;
        sticker.position.z -= baseOffset;
        break;
      case "R":
        targetPosition.x += endOffset;
        sticker.position.x += baseOffset;
        break;
      case "L":
        targetPosition.x -= endOffset;
        sticker.position.x -= baseOffset;
        break;
    }

    // Add the animations to the timeline
    timeline.current.add(
      gsap.to(sticker.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration,
        repeat: -1,
        yoyo: true,
        ease: "power1.in",
        delay: delayBy(i),
      }),
      0
    );
    gsap.to(sticker.material, {
      opacity: baseOpacity,
      duration: 2,
      ease: "power1.in",
      delay: delayBy(i),
    });
    timeline.current.add(
      gsap.to(sticker.material, {
        opacity: endOpacity,
        duration,
        repeat: -1,
        yoyo: true,
        ease: "power1.in",
        delay: delayBy(i) + 2,
      }),
      0
    );

    // Animate camera position change
    get().updateCameraPos(cameraPositions[cube_sides_scan[currentScanFace + 1]] || cameraPositions.F);

    set({ currentScanFace: currentScanFace + 1 });
  }
};

export default updateCubeScan;
