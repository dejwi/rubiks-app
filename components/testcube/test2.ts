enum Fc {
  U1 = 0,
  U2 = 1,
  U3 = 2,
  U4 = 3,
  U5 = 4,
  U6 = 5,
  U7 = 6,
  U8 = 7,
  U9 = 8,
  R1 = 9,
  R2 = 10,
  R3 = 11,
  R4 = 12,
  R5 = 13,
  R6 = 14,
  R7 = 15,
  R8 = 16,
  R9 = 17,
  F1 = 18,
  F2 = 19,
  F3 = 20,
  F4 = 21,
  F5 = 22,
  F6 = 23,
  F7 = 24,
  F8 = 25,
  F9 = 26,
  D1 = 27,
  D2 = 28,
  D3 = 29,
  D4 = 30,
  D5 = 31,
  D6 = 32,
  D7 = 33,
  D8 = 34,
  D9 = 35,
  L1 = 36,
  L2 = 37,
  L3 = 38,
  L4 = 39,
  L5 = 40,
  L6 = 41,
  L7 = 42,
  L8 = 43,
  L9 = 44,
  B1 = 45,
  B2 = 46,
  B3 = 47,
  B4 = 48,
  B5 = 49,
  B6 = 50,
  B7 = 51,
  B8 = 52,
  B9 = 53,
}

enum Corner {
  URF = 0,
  UFL = 1,
  ULB = 2,
  UBR = 3,
  DFR = 4,
  DLF = 5,
  DBL = 6,
  DRB = 7,
}

enum Edge {
  UR = 0,
  UF = 1,
  UL = 2,
  UB = 3,
  DR = 4,
  DF = 5,
  DL = 6,
  DB = 7,
  FR = 8,
  FL = 9,
  BL = 10,
  BR = 11,
}

const cornerFacelet: number[][] = [
  [Fc.U9, Fc.R1, Fc.F3],
  [Fc.U7, Fc.F1, Fc.L3],
  [Fc.U1, Fc.L1, Fc.B3],
  [Fc.U3, Fc.B1, Fc.R3],
  [Fc.D3, Fc.F9, Fc.R7],
  [Fc.D1, Fc.L9, Fc.F7],
  [Fc.D7, Fc.B9, Fc.L7],
  [Fc.D9, Fc.R9, Fc.B7],
];

const edgeFacelet = [
  [Fc.U6, Fc.R2],
  [Fc.U8, Fc.F2],
  [Fc.U4, Fc.L2],
  [Fc.U2, Fc.B2],
  [Fc.D6, Fc.R8],
  [Fc.D2, Fc.F8],
  [Fc.D4, Fc.L8],
  [Fc.D8, Fc.B8],
  [Fc.F6, Fc.R4],
  [Fc.F4, Fc.L6],
  [Fc.B6, Fc.L4],
  [Fc.B4, Fc.R6],
];

const centerFacelet: Record<string, number> = {
  U: Fc.U5,
  R: Fc.R5,
  F: Fc.F5,
  D: Fc.D5,
  L: Fc.L5,
  B: Fc.B5,
};

const cornerColor = [
  ["U", "R", "F"],
  ["U", "F", "L"],
  ["U", "L", "B"],
  ["U", "B", "R"],
  ["D", "F", "R"],
  ["D", "L", "F"],
  ["D", "B", "L"],
  ["D", "R", "B"],
];

const edgeColor = [
  ["U", "R"],
  ["U", "F"],
  ["U", "L"],
  ["U", "B"],
  ["D", "R"],
  ["D", "F"],
  ["D", "L"],
  ["D", "B"],
  ["F", "R"],
  ["F", "L"],
  ["B", "L"],
  ["B", "R"],
];

// const fcube: string = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";
// const fcube = "BBDUUFFBFULFRRLBBBLRRFFDLRLDUUDDDFDUDLURLUDFBLURBBFRLR";
export const fcube_to_ifcube = (fcube: string) => {
  const out_cube = fcube.split("");
  // cc = cubie.CubieCube()
  // cc.cp = [-1] * 8  # invalidate corner and edge permutation
  // cc.ep = [-1] * 12
  for (let i = 0; i < cornerFacelet.length; i++) {
    // # facelets of corner  at position i
    const fac = cornerFacelet[i];
    let out_ori = 0;
    for (let ori = 0; ori < fac.length; ori++) {
      out_ori = ori;
      if (fcube[fac[ori]] == "U" || fcube[fac[ori]] == "D") break;
    }

    // # colors which identify the corner at position i
    const idx1 = fac[(out_ori + 1) % 3];
    const col1 = fcube[idx1];
    const idx2 = fac[(out_ori + 2) % 3];
    const col2 = fcube[idx2];
    for (let j = 0; j < cornerFacelet.length; j++) {
      // # colors of corner j
      const col = cornerColor[j];
      if (col1 == col[1] && col2 == col[2]) {
        out_cube[fac[(out_ori + 3) % 3]] = cornerFacelet[j][col.indexOf(col[0])].toString();
        out_cube[idx1] = cornerFacelet[j][col.indexOf(col[1])].toString();
        out_cube[idx2] = cornerFacelet[j][col.indexOf(col[2])].toString();

        break;
      }
    }
  }
  for (let i = 0; i < edgeFacelet.length; i++) {
    for (let j = 0; j < edgeFacelet.length; j++) {
      const col = edgeColor[j];
      if (
        (fcube[edgeFacelet[i][0]] === col[0] && fcube[edgeFacelet[i][1]] === col[1]) ||
        (fcube[edgeFacelet[i][0]] === col[1] && fcube[edgeFacelet[i][1]] === col[0])
      ) {
        out_cube[edgeFacelet[i][0]] = edgeFacelet[j][0].toString();
        out_cube[edgeFacelet[i][1]] = edgeFacelet[j][1].toString();
        break;
      }
    }
  }

  // Check center facelet colors and assign correct indexes based on where it should be
  Object.values(centerFacelet).forEach((idx) => {
    const cur = fcube[idx];
    out_cube[idx] = centerFacelet[cur].toString();
  });

  return out_cube.map((n) => Number(n));
};
