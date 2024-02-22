"use client";

import * as THREE from "three";

import { useEffect, useRef } from "react";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { useAppStore } from "@/lib/store/store";
import { cameraPositions } from "@/lib/maps/camera-positions";

export const THREE_WIDTH = 400;
export const THREE_HEIGHT = 400;

function CubeThree() {
  const {
    objects,
    camera: { current: camera },
    outlinedSelection,
  } = useAppStore();
  const refContainer = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const inited = useRef(false);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    const width = THREE_WIDTH;
    const height = THREE_HEIGHT;

    const scene = objects.current.scene;
    const ambientLight = new THREE.AmbientLight("white", 4);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight("white", 2);
    light.position.set(1, 1, 1);
    scene.add(light);

    // Load cubes into the scene
    scene.add(objects.current.rubiksGroup);
    sceneRef.current = scene;

    camera.position.set(...cameraPositions.X);
    camera.lookAt(scene.position);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Log camera position on c key down
    document.addEventListener("keydown", (e) => {
      if (e.key === "c") {
        console.log({ pos: camera.position, rot: camera.rotation });
      }
    });

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    refContainer.current && refContainer.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0;
    controls.maxDistance = 20;
    controls.enablePan = false;
    // controls.maxPolarAngle = Math.PI / 2;

    // Set up post-processing
    const outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
    outlinePass.edgeStrength = 6;
    outlinePass.edgeThickness = 2;
    outlinePass.selectedObjects = outlinedSelection.current;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(outlinePass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    function render() {
      requestAnimationFrame(render);

      controls.update();
      composer.render();
    }

    /*
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);

      // Update the size of the outline pass
      outlinePass.resolution.set(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", onWindowResize);
    */
    render();
  }, []);

  return <div ref={refContainer} />;
}

export default CubeThree;
