import { ICubeSide } from "./types";

export const colorScanMap: Record<string, { H: [number, number]; S: [number, number]; V: [number, number] }[]> = {
  W: [
    {
      H: [0, 360],
      S: [0, 32],
      V: [64, 100],
    },
  ],
  O: [
    {
      H: [0, 40],
      S: [0, 79],
      V: [0, 100],
    },
    {
      H: [6, 40],
      S: [0, 88],
      V: [0, 100],
    },
    {
      H: [10, 40],
      S: [0, 100],
      V: [0, 100],
    },
    {
      H: [348, 360],
      S: [0, 77],
      V: [0, 92],
    },
  ],
  Y: [
    {
      H: [46, 70],
      S: [0, 100],
      V: [0, 100],
    },
    {
      H: [56, 85],
      S: [0, 90],
      V: [72, 100],
    },
  ],
  G: [
    {
      H: [70, 156],
      S: [0, 100],
      V: [0, 100],
    },
  ],
  R: [
    {
      H: [0, 12],
      S: [0, 100],
      V: [0, 100],
    },
    {
      H: [330, 360],
      S: [0, 100],
      V: [0, 100],
    },
  ],
  B: [
    {
      H: [180, 270],
      S: [0, 100],
      V: [0, 100],
    },
  ],
};

export const scannedColorToSide: Record<string, ICubeSide> = {
  W: "D",
  O: "B",
  Y: "U",
  G: "R",
  R: "F",
  B: "L",
};
