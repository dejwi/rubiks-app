"use client";

import { colorScanMap, scannedColorToSide } from "@/lib/maps/color-scan-map";
import { reverseCord } from "@/lib/helpers/helper";
import { RGBToHSV } from "@/lib/helpers/rgb-to-hsv";
import { useAppStore } from "@/lib/store/store";
import { IScanResult } from "@/types/types";
import { useCallback } from "react";

interface IProps {
  video: HTMLVideoElement | undefined;
  canvas: HTMLCanvasElement | undefined;
}

export const useGetScannedColors = ({ canvas, video }: IProps) => {
  const scanSize = useAppStore((s) => s.scanSize);
  const scanReversed = useAppStore((s) => s.scanReversed);

  const getScannedColors = useCallback((): IScanResult => {
    if (!canvas || !video) return [];

    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;
    // 120 - 416
    // x - 1920

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.log("no ctx");
      return [];
    }
    ctx.drawImage(video, 0, 0);
    ctx.fillStyle = "#1c75d0A2";

    const calculatedScanSize = scanSize * (width / window.innerWidth);
    const offset = 3;
    const spacing = calculatedScanSize / 3 - offset;
    const startX = width / 2 - spacing + offset / 2;
    const startY = height / 2 - spacing + offset / 2;

    const colors: IScanResult = [];
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        // helper dispaly
        // const cbsize = 20;
        // ctx.fillRect(startX + x * spacing - cbsize / 2, startY + y * spacing - cbsize / 2, cbsize, cbsize);

        const data = ctx.getImageData(startX + x * spacing, startY + y * spacing, 1, 1).data;
        const hsv = RGBToHSV(data[0], data[1], data[2]);

        const colorToSet = Object.entries(colorScanMap).find(([, ranges]) =>
          ranges.some(
            (range) =>
              hsv[0] >= range.H[0] &&
              hsv[0] <= range.H[1] &&
              hsv[1] >= range.S[0] &&
              hsv[1] <= range.S[1] &&
              hsv[2] >= range.V[0] &&
              hsv[2] <= range.V[1]
          )
        )?.[0];
        const mappedSide = colorToSet ? scannedColorToSide[colorToSet] || "X" : "X";

        const obj: IScanResult[number] = { scanData: data, destSide: mappedSide };
        if (scanReversed) {
          colors[reverseCord[x] + y * 3] = obj;
        } else {
          colors[x + y * 3] = obj;
        }
      }
    }

    // ctx?.fillRect(
    //   width / 2 - calculatedScanSize / 2,
    //   height / 2 - calculatedScanSize / 2,
    //   calculatedScanSize,
    //   calculatedScanSize
    // );

    return colors;

    // const x = ctx.getImageData(width / 2, height / 2, 1, 1).data;
    // console.log(x);
    // setColor(`rgb(${x[0]}, ${x[1]}, ${x[2]})`);
    // screenshotImg.current.src = canvas.current.toDataURL("image/webp");
  }, [scanReversed, canvas, video, scanSize]);

  return getScannedColors;
};
