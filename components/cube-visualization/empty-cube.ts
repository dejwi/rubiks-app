import { cubeColorMap, getPosByIdx } from "@/helpers/helper";
import * as THREE from "three";

const CUBE_SIZE = 1;

export const genEmptyThreeCube = (): THREE.Group<THREE.Object3DEventMap>[] => {
  const cubes: THREE.Group<THREE.Object3DEventMap>[] = [];

  for (let i = 0; i < 27; i++) {
    const newMat = () =>
      new THREE.MeshLambertMaterial({
        color: cubeColorMap.inside,
        transparent: true,
        // opacity: 0.9,
      });

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE),
      [newMat(), newMat(), newMat(), newMat(), newMat(), newMat()]
    );

    // Object.entries(genCube[i]).forEach(([side, color]) => {
    //   if (color) {
    //     cube.material[Number(side)].color.setHex(
    //       parseInt(
    //         cubeColorMap[color as keyof typeof cubeColorMap].slice(1),
    //         16
    //       )
    //     );
    //   }
    // });

    const lineEdges = new THREE.EdgesGeometry(cube.geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: "#000000",
    });
    const lineMesh = new THREE.LineSegments(lineEdges, lineMaterial);

    const cubeGroup = new THREE.Group();
    cubeGroup.add(cube);
    cubeGroup.add(lineMesh);

    const pos = getPosByIdx(i);
    cubeGroup.position.x = pos.x - CUBE_SIZE;
    cubeGroup.position.y = pos.y - CUBE_SIZE;
    cubeGroup.position.z = pos.z - CUBE_SIZE;

    cubes.push(cubeGroup);
  }
  return cubes;
};
