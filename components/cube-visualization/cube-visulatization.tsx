"use client";

import * as THREE from "three";

import { useEffect, useRef } from "react";
import { cubeColorMap, getPosByIdx } from "@/helpers/helper";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { IRubiks } from "@/helpers/types";
import { genEmptyThreeCube } from "./empty-cube";

const CUBE_SIZE = 1;

interface IProps {
  rubiks: IRubiks;
}

function CubeVisualization({ rubiks }: IProps) {
  const cubes = useRef<THREE.Group[]>(genEmptyThreeCube());
  const refContainer = useRef<HTMLDivElement>(null);
  const inited = useRef(false);

  useEffect(() => {
    for (let i = 0; i < rubiks.length; i++) {
      Object.entries(rubiks[i]).forEach(([side, color]) => {
        if (color) {
          const cubeMesh = cubes.current[i].children[0] as THREE.Mesh;

          (cubeMesh.material as THREE.MeshLambertMaterial[])[
            Number(side)
          ].color.setHex(
            parseInt(
              cubeColorMap[color as keyof typeof cubeColorMap].slice(1),
              16
            )
          );
        }
      });
    }
  }, [rubiks]);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    // === THREE.JS CODE START ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("gainsboro");

    const ambientLight = new THREE.AmbientLight("white", 3);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight("white", 4);
    light.position.set(1, 1, 1);
    scene.add(light);

    const width = 500;
    const height = 500;
    const camera = new THREE.PerspectiveCamera(40, width / height);

    camera.position.set(0, 5, 10);
    camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    // document.body.appendChild( renderer.domElement );
    // use ref as a mount point of the Three.js scene instead of the document.body
    refContainer.current &&
      refContainer.current.appendChild(renderer.domElement);

    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshBasicMaterial();
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);
    // camera.position.z = 5;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 20;
    controls.enablePan = false;
    // controls.maxPolarAngle = Math.PI / 2;

    // Load cubes into the scene
    cubes.current.forEach((cube) => scene.add(cube));

    function animate() {
      requestAnimationFrame(animate);

      controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

      renderer.render(scene, camera);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", onWindowResize);

    animate();
  }, []);
  return <div ref={refContainer}></div>;
}

export default CubeVisualization;
