import { getCubePosBySide } from "@/lib/helpers/cube-pos-by-side";
import { getIdxByPos, getPosByIdx } from "@/lib/helpers/helper";
import { colorMapThree } from "@/lib/maps/cube";
import { cube_sides } from "@/lib/maps/cube";
import * as THREE from "three";
import { Shape, ExtrudeGeometry } from "three";

export const CUBE_SIZE = 1;
const STICKER_SIZE = CUBE_SIZE * 0.9;
const STICKER_ROUNDED_CORNERS = 0.1;
export const CUBE_GAP = 0.0;

export const genEmptyThreeCube = () => {
  const skinProjection = 0.01;

  const rubiksGroup = new THREE.Group();
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
        transparent: true,
        opacity: 0,
      })
    );

    const pos = getPosByIdx(i);
    cube.position.x = pos.x - CUBE_SIZE + CUBE_GAP;
    cube.position.y = pos.y - CUBE_SIZE + CUBE_GAP;
    cube.position.z = pos.z - CUBE_SIZE + CUBE_GAP;

    const cubeGroup = new THREE.Group();
    cubeGroup.add(cube);
    rubiksGroup.add(cubeGroup);
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
          color: colorMapThree.X.clone(),
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
  return { cubes, stickers, orgStickerPos: stickers.map((sticker) => sticker.position.clone()), rubiksGroup };
};
