export type ICubeSide = "U" | "R" | "F" | "D" | "L" | "B" | "X";

export type IFaces = "front" | "top" | "back" | "bottom" | "left" | "right";

export type IScanResult = {
  destSide: ICubeSide;
  scanData: Uint8ClampedArray;
}[];
