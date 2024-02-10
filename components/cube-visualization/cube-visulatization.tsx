"use client";

import * as THREE from "three";

import { useEffect, useRef } from "react";
import { colorMapThree, cube_sides, cube_sides_scan, getIdxByPos } from "@/helpers/helper";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { genEmptyThreeCube } from "./gen-empty-cube";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { getCubePosBySide } from "@/helpers/cube-pos-by-side";
import { ICubeSide } from "@/helpers/types";
import { useAppStore } from "@/helpers/store";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ghostSideAnimationSettings } from "./animation-settings";

// interface IProps {
//   cube: string;
//   highlight?: ICubeSide;
// }

function CubeVisualization() {
  const { highlight, objects, cube, currentScanFace } = useAppStore();
  // const objects = useRef(genEmptyThreeCube());
  const outline_selection = useRef<THREE.Object3D<THREE.Object3DEventMap>[]>([]);
  const refContainer = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const inited = useRef(false);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  // const prevGhostStickers = useRef<
  //   {
  //     sticker: THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshStandardMaterial, THREE.Object3DEventMap>;
  //     orgPos: THREE.Vector3;
  //   }[]
  // >([]);

  useEffect(() => {
    const { baseOffset, baseOpacity, color, delayBy, duration, endOffset, endOpacity } = ghostSideAnimationSettings;

    // Stop the previous timeline if it exists
    if (timeline.current) {
      timeline.current.kill();
    }

    // Create a new timeline
    timeline.current = gsap.timeline();

    if (currentScanFace !== 0) {
      const prevScanFace = cube_sides_scan[(currentScanFace ?? cube_sides_scan.length) - 1];

      for (let i = 0; i < 9; i++) {
        // Set position to previously animated stickers
        const stickerIdx = cube_sides.indexOf(prevScanFace) * 9 + i;

        const prevGhostSticker = objects.current.stickers[stickerIdx];
        const orgPos = objects.current.orgStickerPos[stickerIdx];

        const newColor = colorMapThree[cube[stickerIdx] as ICubeSide];

        gsap.to(prevGhostSticker.position, {
          x: orgPos.x,
          y: orgPos.y,
          z: orgPos.z,
          opacity: 1,
          duration: 0.05,
          ease: "power1.inOut",
          delay: delayBy(i),
        });
        gsap.to(prevGhostSticker.material.color, {
          r: newColor.r,
          g: newColor.g,
          b: newColor.b,
          duration: 0.05,
          ease: "power1.inOut",
          delay: delayBy(i),
        });
      }
    }

    if (currentScanFace === null) return;

    const ghostStickerSide = cube_sides_scan[currentScanFace];

    for (let i = 0; i < 9; i++) {
      const sticker = objects.current.stickers[cube_sides.indexOf(ghostStickerSide) * 9 + i];

      sticker.material.color = color.clone();

      const targetPosition = sticker.position.clone();
      switch (ghostStickerSide) {
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
      const comp = () => {
        timeline.current?.add(
          gsap.to(sticker.material, {
            opacity: endOpacity,
            duration,
            repeat: -1,
            yoyo: true,
            ease: "power1.in",
            delay: delayBy(i),
          }),
          0
        );
      };

      gsap.to(sticker.material, {
        opacity: baseOpacity,
        duration: 2,
        ease: "power1.in",
        delay: delayBy(i),
        onComplete: comp,
      });
    }
  }, [currentScanFace]);

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

            const intMap = {
              [colorMapThree.D.getHexString()]: 2,
              [colorMapThree.U.getHexString()]: 2,
              [colorMapThree.F.getHexString()]: 4,
              [colorMapThree.B.getHexString()]: 2,
              [colorMapThree.L.getHexString()]: 2,
              [colorMapThree.R.getHexString()]: 5,
            };
            st.material.emissiveIntensity = intMap[colorHex] || 2;

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
    objects.current.cubes.forEach((group) => scene.add(group));
    sceneRef.current = scene;

    // Set up post-processing
    const outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
    outlinePass.edgeStrength = 6; // Increase the edge strength for a more visible outline
    outlinePass.edgeThickness = 2; // Increase the edge thickness for a more visible outline
    outlinePass.selectedObjects = outline_selection.current;

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
