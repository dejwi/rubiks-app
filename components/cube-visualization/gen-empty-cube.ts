import { getCubePosBySide } from "@/helpers/cube-pos-by-side";
import { colorMapThree, cube_sides, getIdxByPos, getPosByIdx } from "@/helpers/helper";
import * as THREE from "three";
import { Shape, ExtrudeGeometry } from "three";

const CUBE_SIZE = 1;
const STICKER_SIZE = CUBE_SIZE * 0.9;
const STICKER_ROUNDED_CORNERS = 0.1;

export const genEmptyThreeCube = () => {
  const gap = 0.0;
  const skinProjection = 0.01;

  const cubes: THREE.Group<THREE.Object3DEventMap>[] = [];
  const stickers: THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[] = [];

  for (let i = 0; i < 27; i++) {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE),
      new THREE.MeshStandardMaterial({
        color: colorMapThree.X,
        side: THREE.DoubleSide,
        // roughness: 0.8,
        toneMapped: false,
        emissiveIntensity: 0,
        // transparent: true,
        // opacity: 0.6,
      })
    );

    const pos = getPosByIdx(i);
    cube.position.x = pos.x - CUBE_SIZE + gap * pos.x;
    cube.position.y = pos.y - CUBE_SIZE + gap * pos.y;
    cube.position.z = pos.z - CUBE_SIZE + gap * pos.z;

    const cubeGroup = new THREE.Group();
    cubeGroup.add(cube);
    cubes.push(cubeGroup);
  }

  // const sticker_offset = CUBE_SIZE / 2 + skinProjection * 0.05;
  const sticker_offset = CUBE_SIZE / 2 + skinProjection;

  for (let i = 0; i < cube_sides.length; i++) {
    const side = cube_sides[i];

    for (let j = 0; j < 9; j++) {
      const cube_idx = getIdxByPos(getCubePosBySide(side, { x: j % 3, y: Math.floor(j / 3) }));
      const group = cubes[cube_idx];

      // Define the rounded rectangle shape
      const roundedRectShape = new Shape();

      roundedRectShape.moveTo(-STICKER_SIZE / 2 + STICKER_ROUNDED_CORNERS, -STICKER_SIZE / 2);
      roundedRectShape.lineTo(STICKER_SIZE / 2 - STICKER_ROUNDED_CORNERS, -STICKER_SIZE / 2);
      roundedRectShape.quadraticCurveTo(
        STICKER_SIZE / 2,
        -STICKER_SIZE / 2,
        STICKER_SIZE / 2,
        -STICKER_SIZE / 2 + STICKER_ROUNDED_CORNERS
      );
      roundedRectShape.lineTo(STICKER_SIZE / 2, STICKER_SIZE / 2 - STICKER_ROUNDED_CORNERS);
      roundedRectShape.quadraticCurveTo(
        STICKER_SIZE / 2,
        STICKER_SIZE / 2,
        STICKER_SIZE / 2 - STICKER_ROUNDED_CORNERS,
        STICKER_SIZE / 2
      );
      roundedRectShape.lineTo(-STICKER_SIZE / 2 + STICKER_ROUNDED_CORNERS, STICKER_SIZE / 2);
      roundedRectShape.quadraticCurveTo(
        -STICKER_SIZE / 2,
        STICKER_SIZE / 2,
        -STICKER_SIZE / 2,
        STICKER_SIZE / 2 - STICKER_ROUNDED_CORNERS
      );
      roundedRectShape.lineTo(-STICKER_SIZE / 2, -STICKER_SIZE / 2 + STICKER_ROUNDED_CORNERS);
      roundedRectShape.quadraticCurveTo(
        -STICKER_SIZE / 2,
        -STICKER_SIZE / 2,
        -STICKER_SIZE / 2 + STICKER_ROUNDED_CORNERS,
        -STICKER_SIZE / 2
      );

      // Extrude the shape into a mesh
      const extrudeSettings = {
        depth: 0.03, // Increase the extrusion depth for a thicker sticker
        bevelEnabled: false,
      };
      const stickerGeometry = new ExtrudeGeometry(roundedRectShape, extrudeSettings);

      const sticker = new THREE.Mesh(
        stickerGeometry,
        new THREE.MeshStandardMaterial({
          // color: colorMapThree[side],
          // emissive: colorMapThree[side],
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          roughness: 0.8,
          toneMapped: false,
          emissiveIntensity: 0,
        })
      );

      sticker.position.copy(group.children[0].position);

      switch (side) {
        case "U":
          sticker.position.y += sticker_offset;
          sticker.rotation.x = -Math.PI / 2;
          break;
        case "D":
          sticker.position.y -= sticker_offset;
          sticker.rotation.x = Math.PI / 2;
          break;
        case "F":
          sticker.position.z += sticker_offset;
          break;
        case "B":
          sticker.position.z -= sticker_offset;
          sticker.rotation.y = Math.PI;
          break;
        case "R":
          sticker.position.x += sticker_offset;
          sticker.rotation.y = Math.PI / 2;
          break;
        case "L":
          sticker.position.x -= sticker_offset;
          sticker.rotation.y = -Math.PI / 2;
          break;
      }

      group.add(sticker);
      stickers.push(sticker);
    }
  }
  return [cubes, stickers] as const;
};
