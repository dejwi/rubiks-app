"use client";

import * as THREE from "three";

import { useEffect, useRef } from "react";
import { colorMapThree, getIdxByPos, solved_cube } from "@/helpers/helper";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { getCubePosBySide } from "@/helpers/cube-pos-by-side";
import { useAppStore } from "@/lib/store";
import { cameraPositions } from "@/helpers/camera-positions";
import { colorEmissiveIntensityMap } from "@/lib/maps/color-emissive-intesity";

function CubeVisualization() {
  const {
    highlight,
    objects,
    camera: { current: camera },
    threeWidth: width,
    threeHeight: height,
    updateCube,
  } = useAppStore();
  const outline_selection = useRef<THREE.Object3D<THREE.Object3DEventMap>[]>([]);
  const refContainer = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const inited = useRef(false);

  useEffect(() => {
    // Empty an array without losing a reference
    outline_selection.current.length = 0;
    if (!highlight) return;

    const colored: THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[] = [];
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const idx = getIdxByPos(getCubePosBySide(highlight, { x, y }));
        const group = objects.current.cubes[idx];
        const stickers = group.children.slice(1);

        outline_selection.current.push(group);

        (stickers as THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[]).forEach(
          (st) => {
            const colorHex = st.material.color.getHexString();
            if (colorHex === colorMapThree.X.getHexString()) return;

            st.material.emissiveIntensity = colorEmissiveIntensityMap[colorHex];

            colored.push(st);
          }
        );
      }
    }

    // Clean up bloom effect
    return () =>
      colored.forEach((st) => {
        st.material.emissiveIntensity = 0;
      });
  }, [highlight]);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    // === THREE.JS CODE START ===
    const scene = objects.current.scene;
    const ambientLight = new THREE.AmbientLight("white", 4);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight("white", 2);
    light.position.set(1, 1, 1);
    scene.add(light);

    camera.position.set(...cameraPositions[0]);
    camera.lookAt(scene.position);

    // Log camera position on c key down
    document.addEventListener("keydown", (e) => {
      if (e.key === "c") {
        console.log({ pos: camera.position, rot: camera.rotation });
      }
    });

    const bloomParams = {
      threshold: 1.3,
      // strength: 0.162,
      strength: 0.234,
      radius: 0.02,
      exposure: 1,
      // exposure: 1.2768,
    };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // renderer.setClearColor(new THREE.Color("gainsboro"));
    // renderer.setClearColor(new THREE.Color("#c7c7c7"));
    renderer.setSize(width, height);
    // renderer.outputColorSpace = THREE.SRGBColorSpace;
    // renderer.toneMappingExposure = Math.pow(bloomParams.exposure, 4.0);
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    refContainer.current && refContainer.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 20;
    controls.enablePan = false;
    // controls.maxPolarAngle = Math.PI / 2;

    // Load cubes into the scene
    objects.current.cubes.forEach((group) => scene.add(group));
    sceneRef.current = scene;
    updateCube(solved_cube);

    // Set up post-processing
    const outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
    outlinePass.edgeStrength = 6; // Increase the edge strength for a more visible outline
    outlinePass.edgeThickness = 2; // Increase the edge thickness for a more visible outline
    outlinePass.selectedObjects = outline_selection.current;

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 2, 1, 1);
    bloomPass.threshold = bloomParams.threshold;
    bloomPass.strength = bloomParams.strength;
    bloomPass.radius = bloomParams.radius;

    // const target = new THREE.WebGLRenderTarget(width, height, {
    //   // type: THREE.FloatType,
    //   type: THREE.HalfFloatType,
    //   format: THREE.RGBAFormat,
    //   colorSpace: THREE.SRGBColorSpace,
    // });
    // target.samples = 8;
    const composer = new EffectComposer(renderer);

    composer.addPass(new RenderPass(scene, camera));

    // Setting threshold to 1 will make sure nothing glows
    // composer.addPass(new ShaderPass(GammaCorrectionShader));
    // composer.addPass(bloomPass);
    composer.addPass(outlinePass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // const gui = new GUI();

    // const bloomFolder = gui.addFolder("bloom");

    // bloomFolder.add(bloomParams, "threshold", 0.0, 1.0).onChange(function (value) {
    //   bloomPass.threshold = Number(value);
    // });

    // bloomFolder.add(bloomParams, "strength", 0.0, 3).onChange(function (value) {
    //   bloomPass.strength = Number(value);
    // });

    // bloomFolder
    //   .add(bloomParams, "radius", 0.0, 1.0)
    //   .step(0.01)
    //   .onChange(function (value) {
    //     bloomPass.radius = Number(value);
    //   });

    // const toneMappingFolder = gui.addFolder("tone mapping");

    // toneMappingFolder.add(bloomParams, "exposure", 0.1, 2).onChange(function (value) {
    //   renderer.toneMappingExposure = Math.pow(value, 4.0);
    // });

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

    // return () => {
    //   clearInterval(intervalCamera);
    // };
  }, []);

  return <div ref={refContainer} />;
}

export default CubeVisualization;
