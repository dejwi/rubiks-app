export type IFaceColor = "W" | "G" | "R" | "O" | "Y" | "B" | null;

export type IRubiks = Record<string, IFaceColor>[];

export type IFaces = "front" | "top" | "back" | "bottom" | "left" | "right";

export type IScanResult = {
  faceColor: IFaceColor;
  scanData: Uint8ClampedArray;
}[];
