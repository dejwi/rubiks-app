"use client";

import * as THREE from "three";

import { useEffect, useRef } from "react";
import { colorMapThree, cubeColorMap, getIdxByPos, getPosByIdx } from "@/helpers/helper";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { genEmptyThreeCube } from "./empty-cube2";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { getCubePosByFace } from "@/helpers/fill-cube-face";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { getCubePosBySide } from "@/helpers/cube-pos-by-side";
// import { GlitchPass } from "three/addons/postprocessing/GlitchPass.js";
// import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const CUBE_SIZE = 1;

interface IProps {
  cube: string;
}

function CubeVisualization({ cube }: IProps) {
  const cubes = useRef(genEmptyThreeCube()[0]);
  const refContainer = useRef<HTMLDivElement>(null);
  const inited = useRef(false);

  // useEffect(() => {
  //   console.log({ rubiks });
  //   for (let i = 0; i < rubiks.length; i++) {
  //     Object.entries(rubiks[i]).forEach(([side, color]) => {
  //       if (color) {
  //         const cubeMesh = cubes.current[i].children[0] as THREE.Mesh;

  //         const mat = (cubeMesh.material as THREE.MeshLambertMaterial[])[Number(side)];

  //         const colorToSet = colorMapThree[color];
  //         mat.color = colorToSet;
  //         mat.emissive = colorToSet;
  //       }
  //     });
  //   }
  // }, [rubiks]);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    // === THREE.JS CODE START ===
    const scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight("white", 2);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight("white", 0.2);
    light.position.set(1, 1, 1);
    scene.add(light);

    const width = 500;
    const height = 500;
    const camera = new THREE.PerspectiveCamera(40, width / height);

    camera.position.set(0, 5, 10);
    camera.lookAt(scene.position);

    const bloomParams = {
      threshold: 1.3,
      strength: 0.162,
      radius: 0.02,
      exposure: 1,
      // exposure: 1.2768,
    };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(new THREE.Color("gainsboro"));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = Math.pow(bloomParams.exposure, 4.0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
    cubes.current.forEach((cube) => scene.add(cube));

    // Set up post-processing
    const outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
    outlinePass.edgeStrength = 6; // Increase the edge strength for a more visible outline
    outlinePass.edgeThickness = 2; // Increase the edge thickness for a more visible outline

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 2, 1, 1);
    bloomPass.threshold = bloomParams.threshold;
    bloomPass.strength = bloomParams.strength;
    bloomPass.radius = bloomParams.radius;

    const target = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.FloatType,
      // type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      colorSpace: THREE.SRGBColorSpace,
    });
    target.samples = 8;
    const composer = new EffectComposer(renderer, target);

    composer.addPass(new RenderPass(scene, camera));

    // Setting threshold to 1 will make sure nothing glows
    composer.addPass(new ShaderPass(GammaCorrectionShader));
    composer.addPass(bloomPass);
    composer.addPass(outlinePass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const idx = getIdxByPos(getCubePosBySide("R", { x, y }));
        const group = cubes.current[idx];
        outlinePass.selectedObjects.push(group);

        const stickers = group.children.slice(1);

        (stickers as THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>[]).forEach(
          (st) => {
            const colorHex = st.material.color.getHexString();
            if (colorHex === colorMapThree.X.getHexString()) return;

            const intMap = {
              [colorMapThree.D.getHexString()]: 2,
              [colorMapThree.U.getHexString()]: 2,
              [colorMapThree.F.getHexString()]: 4,
              [colorMapThree.B.getHexString()]: 2,
              [colorMapThree.L.getHexString()]: 2,
              [colorMapThree.R.getHexString()]: 5,
            };
            st.material.emissiveIntensity = intMap[colorHex] || 2;

            // st.material.emissiveIntensity = 2;
          }
        );
        // outlinePass.selectedObjects.push(cubeMesh);
      }
    }

    const gui = new GUI();

    const bloomFolder = gui.addFolder("bloom");

    bloomFolder.add(bloomParams, "threshold", 0.0, 1.0).onChange(function (value) {
      bloomPass.threshold = Number(value);
    });

    bloomFolder.add(bloomParams, "strength", 0.0, 3).onChange(function (value) {
      bloomPass.strength = Number(value);
    });

    bloomFolder
      .add(bloomParams, "radius", 0.0, 1.0)
      .step(0.01)
      .onChange(function (value) {
        bloomPass.radius = Number(value);
      });

    const toneMappingFolder = gui.addFolder("tone mapping");

    toneMappingFolder.add(bloomParams, "exposure", 0.1, 2).onChange(function (value) {
      renderer.toneMappingExposure = Math.pow(value, 4.0);
    });

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
  return (
    <div>
      <div ref={refContainer} />
      <script type="x-shader/x-vertex" id="vertexshader">
        {`varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`}
      </script>
      <script type="x-shader/x-fragment" id="fragmentshader">
        {`  uniform sampler2D baseTexture;
          uniform sampler2D bloomTexture;
          varying vec2 vUv;
          void main() {
            gl_FragColor = texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv);
          }`}
      </script>
    </div>
  );
}

export default CubeVisualization;
