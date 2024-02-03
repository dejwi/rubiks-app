"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { emptyRubiksCube } from "@/helpers/empty-cube";
import { IRubiks, IFaces, IFaceColor, IScanResult } from "@/helpers/types";
import { getCubePosByFace } from "@/helpers/fill-cube-face";
import {
  cubeColorMap,
  cubeSidesMap,
  getIdxByPos,
  reverseCord,
} from "@/helpers/helper";
import CubeVisualization from "@/components/cube-visualization/cube-visulatization";
import { colorScanMap } from "@/helpers/color-scan-map";

// const RGBToHSL = (r: number, g: number, b: number) => {
//   r /= 255;
//   g /= 255;
//   b /= 255;
//   const l = Math.max(r, g, b);
//   const s = l - Math.min(r, g, b);
//   const h = s
//     ? l === r
//       ? (g - b) / s
//       : l === g
//       ? 2 + (b - r) / s
//       : 4 + (r - g) / s
//     : 0;
//   return [
//     60 * h < 0 ? 60 * h + 360 : 60 * h,
//     100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
//     (100 * (2 * l - s)) / 2,
//   ];
// };

// function that converts rgb to hsv
const RGBToHSV = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  const h =
    max === min
      ? 0
      : max === r
      ? (g - b) / d + (g < b ? 6 : 0)
      : max === g
      ? (b - r) / d + 2
      : (r - g) / d + 4;
  return [h * 60, s * 100, v * 100];
};

// const whiteMinL = 85;
// const whiteMaxH = 11;
// const greenRange = [90, 156];
// const redRange1 = [0, 12];
// const redRange2 = [330, 360];

// const orangeRange = [13, 45];
// const orangeRangeEdge1 = [0, 25];
// const orangeEdgeS1 = [25, 72];

// const orangeRangeEdge2 = [354, 360];
// const orangeEdgeS2 = [30, 64];

// const yellowRange = [46, 89];
// const blueRange = [200, 270];

const scanSize = 170;

const facesToScan: IFaces[] = [
  "front",
  "left",
  "back",
  "right",
  "bottom",
  "top",
];

function MainPage() {
  const [streamStared, setStreamStarted] = useState(false);
  const [devices, setDevices] = useState<{ id: string; label: string }[]>([]);
  const [cube, setCube] = useState<IRubiks>([...emptyRubiksCube]);
  const [currentScanFace, setCurrentScanFace] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanReversed, setScanReversed] = useState(true);
  const [previewReversed, setPreviewReversed] = useState(true);
  const [testPreviewFace, setTestPreviewFace] = useState<IScanResult>([]);
  const [togglePreview, setTogglePreview] = useState(true);

  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const select = useRef<HTMLSelectElement>(null);
  const screenshotImg = useRef<HTMLImageElement>(null);

  useEffect(() => {
    (async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const filt = devices.filter((d) => d.kind === "videoinput");
      console.log(devices);
      setDevices(filt.map((d) => ({ id: d.deviceId, label: d.label })));
    })();
  }, []);

  const getScannedColors = useCallback((): IScanResult => {
    if (!canvas.current || !screenshotImg.current || !video.current) return [];
    const width = video.current.videoWidth;
    const height = video.current.videoHeight;
    canvas.current.width = width;
    canvas.current.height = height;

    const ctx = canvas.current.getContext("2d");
    if (!ctx) return [];
    ctx.drawImage(video.current, 0, 0);
    ctx.fillStyle = "#1c75d0A2";

    const offset = 3;
    const spacing = scanSize / 3 - offset;
    const startX = width / 2 - spacing + offset / 2;
    const startY = height / 2 - spacing + offset / 2;

    const colors: IScanResult = [];
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        // helper dispaly
        // ctx.fillRect(
        //   startX + i * spacing - cbsize / 2,
        //   startY + j * spacing - cbsize / 2,
        //   cbsize,
        //   cbsize
        // );

        const data = ctx.getImageData(
          startX + x * spacing,
          startY + y * spacing,
          1,
          1
        ).data;
        const hsv = RGBToHSV(data[0], data[1], data[2]);

        let colorToSet = (Object.entries(colorScanMap).find(([, ranges]) =>
          ranges.some(
            (range) =>
              hsv[0] >= range.H[0] &&
              hsv[0] <= range.H[1] &&
              hsv[1] >= range.S[0] &&
              hsv[1] <= range.S[1] &&
              hsv[2] >= range.V[0] &&
              hsv[2] <= range.V[1]
          )
        )?.[0] || null) as IFaceColor;

        const obj = { faceColor: colorToSet, scanData: data };
        if (scanReversed) {
          colors[reverseCord[x] + y * 3] = obj;
        } else {
          colors[x + y * 3] = obj;
        }
      }
    }
    return colors;

    // ctx.fillRect(
    //   width / 2 - scanSize / 2,
    //   height / 2 - scanSize / 2,
    //   scanSize,
    //   scanSize,
    // );

    // const x = ctx.getImageData(width / 2, height / 2, 1, 1).data;
    // console.log(x);
    // setColor(`rgb(${x[0]}, ${x[1]}, ${x[2]})`);
    // screenshotImg.current.src = canvas.current.toDataURL("image/webp");
  }, [scanReversed]);

  useEffect(() => {
    if (!togglePreview) return;
    const interval = setInterval(() => {
      setTestPreviewFace(getScannedColors());
    }, 550);
    return () => {
      clearInterval(interval);
    };
  }, [togglePreview, getScannedColors]);

  return (
    <div className="flex flex-col min-h-[100vh]">
      <div className="py-3">
        <span className="text-3xl">
          Current to scan: {facesToScan[currentScanFace]}
        </span>
      </div>
      <select name="camera" ref={select} className="mb-5">
        {devices.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>
      <div className="flex gap-4 [&_button]:bg-slate-500 [&_button]:cursor-pointer">
        <button onClick={() => setScanReversed((state) => !state)}>
          Reverse: {scanReversed.toString()}
        </button>
        <button onClick={() => setTogglePreview((state) => !state)}>
          Preview: {togglePreview.toString()}
        </button>
        <button
          onClick={async () => {
            if (!video.current) return;
            if (streamStared) {
              video.current?.play();
            }
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            video.current.srcObject = stream;
            setStreamStarted(true);
          }}
        >
          Start
        </button>
        <button onClick={() => video.current?.pause()}>Pause</button>
        <button
          onClick={() => {
            const tempCube = [...cube];
            const colors = getScannedColors().map((s) => s.faceColor);

            colors?.forEach((color, i) => {
              const y = Math.floor(i / 3);
              const x = i - y * 3;

              const currentFace = facesToScan[currentScanFace];
              const cubeIdx = getIdxByPos(
                getCubePosByFace(currentFace, {
                  x,
                  y,
                })
              );

              tempCube[cubeIdx][cubeSidesMap[currentFace]] = color;
            });

            setCube(tempCube);
            if (currentScanFace === facesToScan.length - 1) {
              setScanComplete(true);
            } else {
              setCurrentScanFace((idx) => idx + 1);
            }
          }}
        >
          Scan
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex items-center justify-center w-[40rem]">
          <video
            autoPlay
            ref={video}
            className={
              scanReversed || previewReversed ? "-scale-x-100" : undefined
            }
          />
          {/* <div
            className="absolute bg-blue-500/50"
            style={{ width: `${scanSize}px`, height: `${scanSize}px` }}
          /> */}
          {streamStared && (
            <div
              className="absolute grid grid-cols-3 grid-rows-3 [&_div]:border-2 [&_div]:border-red-600"
              style={{ width: `${scanSize}px`, height: `${scanSize}px` }}
            >
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
          )}
          {/* <div className="absolute bg-red-900/20 w-2 h-2" /> */}
        </div>
        <div className="grid grid-cols-3 w-[10rem] h-[10rem] grid-rows-3">
          {testPreviewFace?.map(({ faceColor, scanData }, i) => (
            // bugs with key
            // eslint-disable-next-line react/jsx-key
            <div
              style={{
                background: faceColor
                  ? cubeColorMap[faceColor]
                  : cubeColorMap.inside,
              }}
              onClick={() => {
                console.log({
                  hsv: RGBToHSV(scanData[0], scanData[1], scanData[2]),
                  rgh: scanData,
                });
              }}
            />
          ))}
        </div>
      </div>

      <canvas
        ref={canvas}
        className={`w-[40rem] hidden  ${scanReversed ? "-scale-x-100" : ""}`}
      />
      <img ref={screenshotImg} />
      <div>{currentScanFace > 0 && <CubeVisualization rubiks={cube} />}</div>
    </div>
  );
}

export default MainPage;
