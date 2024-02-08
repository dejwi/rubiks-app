"use client";

import * as THREE from "three";

import { useEffect, useRef } from "react";
import {
  colorMapThree,
  cubeColorMap,
  getIdxByPos,
  getPosByIdx,
} from "@/helpers/helper";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { IRubiks } from "@/helpers/types";
import { genEmptyThreeCube } from "./empty-cube";
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
// import { GlitchPass } from "three/addons/postprocessing/GlitchPass.js";
// import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const CUBE_SIZE = 1;

interface IProps {
  rubiks: IRubiks;
}

function CubeVisualization({ rubiks }: IProps) {
  const cubes = useRef<THREE.Group[]>(genEmptyThreeCube());
  const refContainer = useRef<HTMLDivElement>(null);
  const inited = useRef(false);

  useEffect(() => {
    console.log({ rubiks });
    for (let i = 0; i < rubiks.length; i++) {
      Object.entries(rubiks[i]).forEach(([side, color]) => {
        if (color) {
          const cubeMesh = cubes.current[i].children[0] as THREE.Mesh;

          const mat = (cubeMesh.material as THREE.MeshLambertMaterial[])[
            Number(side)
          ];

          const colorToSet = colorMapThree[color];
          mat.color = colorToSet;
          mat.emissive = colorToSet;
        }
      });
    }
  }, [rubiks]);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    // const BLOOM_SCENE = 1;

    // const bloomLayer = new THREE.Layers();
    // bloomLayer.set(BLOOM_SCENE);

    const darkMaterial = new THREE.MeshLambertMaterial({ color: "black" });
    const materials = {};

    // === THREE.JS CODE START ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("gainsboro");
    // scene.background = new THREE.Color("red");

    const ambientLight = new THREE.AmbientLight("white", 5);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight("white", 4);
    light.position.set(1, 1, 1);
    scene.add(light);

    const width = 500;
    const height = 500;
    const camera = new THREE.PerspectiveCamera(40, width / height);

    camera.position.set(0, 5, 10);
    camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = Math.pow(1.2768, 4.0);
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
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

    // Set up post-processing

    const outlinePass = new OutlinePass(
      new THREE.Vector2(width, height),
      scene,
      camera
    );

    const bloomParams = {
      threshold: 1.3,
      strength: 0.162,
      radius: 0.02,
      exposure: 1,
    };
    // const bloomParams = {
    //   threshold: 0.73,
    //   strength: 0.345,
    //   radius: 0.23,
    //   exposure: 1,
    // };

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      2,
      1,
      1
    );
    // const bloomPass = new UnrealBloomPass(
    //   new THREE.Vector2(width, height),
    //   1.5, // strength
    //   0.4, // radius
    //   0.85 // threshold
    // );
    bloomPass.threshold = bloomParams.threshold;
    bloomPass.strength = bloomParams.strength;
    bloomPass.radius = bloomParams.radius;

    // const outputPass = new OutputPass();

    const target = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      colorSpace: THREE.SRGBColorSpace,
      // colorSpace: THREE.sRGBEncoding,
    });
    target.samples = 8;
    const composer = new EffectComposer(renderer, target);

    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new ShaderPass(GammaCorrectionShader));
    // Setting threshold to 1 will make sure nothing glows
    composer.addPass(bloomPass);
    // composer.addPass(outputPass);

    const outputPass = new OutputPass();

    composer.addPass(outputPass);

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const idx = getIdxByPos(getCubePosByFace("right", { x, y }));
        // toGlow.push(cubes.current[idx]);
        const cubeMesh = cubes.current[idx].children[0] as THREE.Mesh;

        (cubeMesh.material as THREE.MeshLambertMaterial[]).forEach((m) => {
          const colorHex = m.color.getHexString();
          if (colorHex === colorMapThree.inside.getHexString()) return;

          // if (colorHex === colorMapThree.Y.getHexString())
          //   m.emissiveIntensity = 2;
          // else if (colorHex === colorMapThree.R.getHexString())
          //   m.emissiveIntensity = 100;
          // else if (colorHex === colorMapThree.G.getHexString())
          //   m.emissiveIntensity = 4;
          m.emissiveIntensity = 4;
        });
        // cubeMesh.layers.enable(BLOOM_SCENE);
        // outlinePass.selectedObjects.push(cubeMesh);
      }
    }

    // gui
    const gui = new GUI();

    const bloomFolder = gui.addFolder("bloom");

    bloomFolder
      .add(bloomParams, "threshold", 0.0, 1.0)
      .onChange(function (value) {
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

    toneMappingFolder
      .add(bloomParams, "exposure", 0.1, 2)
      .onChange(function (value) {
        renderer.toneMappingExposure = Math.pow(value, 4.0);
      });

    /*      function animate() {
      requestAnimationFrame(animate);

      controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

      bloomComposer.render();
      finalComposer.render();
      // renderer.render(scene, camera);
    }*/

    function render() {
      requestAnimationFrame(render);

      // scene.traverse(darkenNonBloomed);
      // bloomComposer.render();
      // scene.traverse(restoreMaterial);
      controls.update();
      composer.render();
      // renderer.render(scene, camera);

      // render the entire scene, then render bloom scene on top
      // finalComposer.render();
    }

    function darkenNonBloomed(obj: THREE.Object3D) {
      if ((obj as THREE.Mesh).isMesh && bloomLayer.test(obj.layers) === false) {
        // @ts-ignore
        materials[obj.uuid] = obj.material;
        // @ts-ignore
        obj.material = darkMaterial;
      }
    }

    function restoreMaterial(obj: THREE.Object3D) {
      // @ts-ignore
      if (materials[obj.uuid]) {
        // @ts-ignore
        obj.material = materials[obj.uuid];
        // @ts-ignore
        delete materials[obj.uuid];
      }
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
    // animate();
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
