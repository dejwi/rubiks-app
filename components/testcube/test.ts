import { Vector3 } from "three";
import * as THREE from "three";

const solved_cube: string = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

const S = (f: string, i: number): number => {
  return "URFDLB".indexOf(f) * 9 + i - 1;
};

const perm_from_cycle = (cycle: number[]): [number, number][] => {
  let perms: [number, number][] = [];
  for (let i = 0; i < cycle.length - 1; i++) {
    perms.push([cycle[i], cycle[i + 1]]);
  }
  perms.push([cycle[cycle.length - 1], cycle[0]]);
  return perms;
};

const u_move: [number, number][] = [
  ...perm_from_cycle([S("U", 1), S("U", 3), S("U", 9), S("U", 7)]),
  ...perm_from_cycle([S("U", 2), S("U", 6), S("U", 8), S("U", 4)]),
  ...perm_from_cycle([S("F", 1), S("L", 1), S("B", 1), S("R", 1)]),
  ...perm_from_cycle([S("F", 2), S("L", 2), S("B", 2), S("R", 2)]),
  ...perm_from_cycle([S("F", 3), S("L", 3), S("B", 3), S("R", 3)]),
];

const apply_move = <T extends Iterable<any>>(cube: T, perm: [number, number][]): T => {
  let new_cube = [...cube];
  for (let x of perm) {
    new_cube[x[1]] = (cube as any)[x[0]];
  }

  return (Array.isArray(cube) ? new_cube : new_cube.join("")) as unknown as T;
};

apply_move(solved_cube, u_move);

const create_sticker = (pos: Vector3, dst?: Vector3) => ({
  pos: pos,
  dst: dst || pos,
});

// const create_gmove = (
//   name: string,
//   axis: Vector3,
//   angle: number,
//   predicate: (pos: Vector3) => boolean
// ) => ({
//   name,
//   axis,
//   angle,
//   predicate,
// });

type Predicate = (pos: Vector3) => boolean;

interface Sticker {
  pos: Vector3;
  dst: Vector3;
}

interface GMove {
  name: string;
  axis: Vector3;
  angle: number;
  predicate: Predicate;
}

const apply_sticker = (move: GMove, sticker: Sticker): Sticker =>
  move.predicate(sticker.pos)
    ? {
        ...sticker,
        pos: new Vector3()
          .copy(sticker.pos)
          .applyAxisAngle(move.axis, (-move.angle / 180) * Math.PI)
          .round(),
      }
    : sticker;

const get_face = (sticker: Vector3): string => {
  let { x, y, z } = sticker;
  return x === 3 ? "R" : x === -3 ? "L" : y === 3 ? "U" : y === -3 ? "D" : z === 3 ? "F" : z === -3 ? "B" : "X";
};

const create_gmove = (name: string, axis: Vector3, angle: number, predicate: Predicate): GMove => ({
  name,
  axis,
  angle,
  predicate,
});

const create_move_set = (base_name: string, axis: Vector3, pred: Predicate): GMove[] => {
  let move1: GMove = create_gmove(base_name, axis, 90, pred);
  let move2: GMove = create_gmove(base_name + "2", axis, 180, pred);
  let move3: GMove = create_gmove(base_name + "'", axis, 270, pred);
  return [move1, move2, move3];
};

type GCube = Sticker[];
const solved_gcube = (): GCube => {
  let stickers: GCube = [];

  for (let face of [3, -3]) {
    for (let coord1 of [-2, 0, 2]) {
      for (let coord2 of [-2, 0, 2]) {
        stickers.push(
          ...[
            create_sticker(new Vector3(face, coord1, coord2)),
            create_sticker(new Vector3(coord1, face, coord2)),
            create_sticker(new Vector3(coord1, coord2, face)),
          ]
        );
      }
    }
  }
  return stickers;
};

const gmoves = (() => {
  let create_move_set = (base_name: string, axis: Vector3, pred: Predicate) => {
    let move1 = create_gmove(base_name, axis, 90, pred);
    let move2 = create_gmove(base_name + "2", axis, 180, pred);
    let move3 = create_gmove(base_name + "'", axis, 270, pred);
    return [move1, move2, move3];
  };
  let U = create_move_set("U", new Vector3(0, 1, 0), (pos) => pos.y > 0);
  let u = create_move_set("u", new Vector3(0, 1, 0), (pos) => pos.y >= 0);
  let D = create_move_set("D", new Vector3(0, -1, 0), (pos) => pos.y < 0);
  let d = create_move_set("d", new Vector3(0, -1, 0), (pos) => pos.y <= 0);

  let E = create_move_set("E", new Vector3(0, 1, 0), (pos) => pos.y === 0);
  let y = create_move_set("y", new Vector3(0, 1, 0), () => true);

  let L = create_move_set("L", new Vector3(-1, 0, 0), (pos) => pos.x < 0);
  let R = create_move_set("R", new Vector3(1, 0, 0), (pos) => pos.x > 0);
  let l = create_move_set("l", new Vector3(-1, 0, 0), (pos) => pos.x <= 0);
  let r = create_move_set("r", new Vector3(1, 0, 0), (pos) => pos.x >= 0);
  let M = create_move_set("M", new Vector3(-1, 0, 0), (pos) => pos.x === 0);
  let x = create_move_set("x", new Vector3(1, 0, 0), () => true);

  let F = create_move_set("F", new Vector3(0, 0, 1), (pos) => pos.z > 0);
  let B = create_move_set("B", new Vector3(0, 0, -1), (pos) => pos.z < 0);
  let S = create_move_set("S", new Vector3(0, 0, 1), (pos) => pos.z === 0);
  let z = create_move_set("z", new Vector3(0, 0, 1), () => true);

  let gmoves: Record<string, GMove> = {};

  [U, D, u, d, E, y, L, R, l, r, M, x, F, B, S, z].flat().map((move) => (gmoves[move.name] = move));

  return gmoves;
})();

const apply_gmove = (cube: GCube, move: GMove) => cube.map((s) => apply_sticker(move, s));

const apply_gmoves = (gcube: GCube, moves: string) =>
  moves
    .trim()
    .split(/ +/)
    .filter((s) => s)
    .map((m) => gmoves[m])
    .reduce(apply_gmove, gcube);

const gcube_to_fcube = (gcube: GCube): string => {
  // URFDLB
  let scube: string[] = [];

  const fill_face = (stickers: Sticker[], idx: number): void => {
    stickers
      .sort((s, t) => s.pos.z - t.pos.z || s.pos.x - t.pos.x)
      .forEach((s) => {
        scube[idx++] = get_face(s.dst);
      });
  };

  const face_rotating_moves: string[] = ["", "y x", "x", "x2", "y' x", "y2 x"];

  face_rotating_moves.forEach((moves, i) =>
    fill_face(
      apply_gmoves(gcube, moves).filter((s) => get_face(s.pos) === "U"),
      i * 9
    )
  );

  return scube.join("");
};

const gcube_to_fcube_idx = (() => {
  // URFDLB
  let map: { [key: string]: number } = {};
  let repr = (vec3: Vector3): string => vec3.x + "," + vec3.y + "," + vec3.z;
  let work = (rot: string, idx: number): number => {
    for (let z of [-2, 0, 2]) {
      for (let x of [-2, 0, 2]) {
        let pos = apply_gmoves([create_sticker(new Vector3(x, 3, z))], rot)[0].pos;
        map[repr(pos)] = idx++;
      }
    }
    return idx;
  };

  let face_rotations: string[] = ["", "x' y'", "x'", "x2", "x' y", "x' y2"];
  face_rotations.forEach((rot, i) => work(rot, i * 9));
  return (vec: Vector3): number => map[repr(vec)];
})();

const convert_gmove_to_fmove = (gmove: GMove): [number, number][] =>
  apply_gmove(solved_gcube(), gmove)
    .map((s) => [gcube_to_fcube_idx(s.dst), gcube_to_fcube_idx(s.pos)] as [number, number])
    .filter(([x, y]) => x !== y);

const fmoves: Record<string, [number, number][]> = Object.fromEntries(
  Object.entries(gmoves).map(([k, v]) => [k, convert_gmove_to_fmove(v)])
);
// to save
// console.log({ fmoves });

const apply_fmoves = <T>(cube: T, moves: string): T =>
  // @ts-ignore
  moves
    .trim()
    .split(/ +/)
    .filter((s) => s)
    .map((m) => fmoves[m])
    // @ts-ignore
    .reduce(apply_move, cube);

// const create_simple_solver = (
//   is_solved: (fcube: string) => boolean,
//   candidate_moves: string[]
// ) => ({
//   is_solved,
//   moves: candidate_moves,
// });

// test
// const fb_pieces = [
//   S("L", 4),
//   S("L", 5),
//   S("L", 6),
//   S("L", 7),
//   S("L", 8),
//   S("L", 9),
//   S("F", 4),
//   S("F", 7),
//   S("B", 6),
//   S("B", 9),
//   S("D", 1),
//   S("D", 4),
//   S("D", 7),
// ];

// const fb_is_solved = (() => {
//   const fb_faces = fb_pieces.map((idx) => "URFDLB"[Math.floor(idx / 9)]);

//   return (fcube: string) => {
//     for (let i = 0; i < fb_pieces.length; i++) {
//       if (fcube[fb_pieces[i]] !== fb_faces[i]) return false; // early return for performance
//     }
//     return true;
//   };
// })();

const stm_moves = [
  "U",
  "U'",
  "U2",
  "D",
  "D'",
  "D2",
  "F",
  "F'",
  "F2",
  "B",
  "B'",
  "B2",
  "L",
  "L'",
  "L2",
  "R",
  "R'",
  "R2",
  "M",
  "M'",
  "M2",
  "E",
  "E'",
  "E2",
  "S",
  "S'",
  "S2",
];

// const fb_simple_solver = create_simple_solver(fb_is_solved, stm_moves);

// function solve_dfs(
//   solver: ReturnType<typeof create_simple_solver>,
//   cube: string,
//   solution: string,
//   depth_remaining: number
// ): string | null {
//   if (solver.is_solved(cube)) return solution.trim();
//   if (depth_remaining === 0) return null;
//   for (const move of solver.moves) {
//     let result = solve_dfs(
//       solver,
//       apply_move(cube, fmoves[move] as [number, number][]),
//       solution + " " + move,
//       depth_remaining - 1
//     );
//     if (result !== null) return result;
//   }
//   return null;
// }

// const scramble_dfs = "U R2 B L D";

// const solution_dfs = solve_dfs(
//   fb_simple_solver,
//   apply_fmoves(solved_cube, "L"),
//   "",
//   3
// );

// console.log({ solution_dfs });

// function solve_iddfs(
//   solver: ReturnType<typeof create_simple_solver>,
//   cube: string,
//   depth_limit: number
// ) {
//   for (let depth = 0; depth <= depth_limit; depth++) {
//     let solution = solve_dfs(solver, cube, "", depth);
//     if (solution !== null) return solution;
//   }
//   return null;
// }

// console.log(solve_iddfs(fb_simple_solver, apply_fmoves(solved_cube, "L"), 3));

const ifcube_idx_to_fcube_face = (idx: number) => "URFDLB"[Math.floor(idx / 9)];

const solved_ifcube = Array(54)
  .fill(null)
  .map((_, i) => i);

const mask_cube = (ifcube: number[], mask: number[]) =>
  [...ifcube].map((idx) => (mask.includes(idx) ? ifcube_idx_to_fcube_face(idx) : "X")).join("");

// Function that converts a fcube to a ifcube
// const fcube_to_ifcube = (fcube: string) => {
//   let ifcube: number[] = [];
//   for (let i = 0; i < fcube.length; i++) {
//     if (fcube[i] !== "X") {
//       ifcube.push(i);
//     }
//   }

const gen_pruning_table = (solved_states: string[], depth: number, moveset: string[]) => {
  let pruning_table: Record<string, number> = {};
  let previous_frontier = solved_states;
  solved_states.forEach((s) => (pruning_table[s] = 0));

  for (let i = 1; i <= depth; i++) {
    const frontier = [];
    for (let state of previous_frontier) {
      for (let move of moveset) {
        let new_state = apply_move(state, fmoves[move]);
        if (!pruning_table.hasOwnProperty(new_state)) {
          pruning_table[new_state] = i;
          frontier.push(new_state);
        }
      }
    }
    previous_frontier = [...frontier];
  }
  return pruning_table;
};

// const fb_pruning_depth = 4;

// const fb_pruning_table = gen_pruning_table(
//   [mask_cube(solved_ifcube, fb_pieces)],
//   fb_pruning_depth,
//   stm_moves
// );
// console.log(JSON.stringify(fb_pruning_table));

const create_solver = (
  is_solved: (cube: string) => boolean,
  candidate_moves: string[],
  pruning_table: Record<string, number>,
  pruning_depth: number
) => ({ pruning_table, pruning_depth, is_solved, moves: candidate_moves });

// const fb_solver = create_solver(
//   fb_is_solved,
//   stm_moves,
//   fb_pruning_table,
//   fb_pruning_depth
// );

function solve_dfs_with_pruning(
  solver: ReturnType<typeof create_solver>,
  cube: string,
  solution: string[],
  depth_remaining: number
): string | null {
  // console.log({ solution });
  const cube_str = Array.isArray(cube) ? cube.join("") : cube;
  if (solver.is_solved(cube_str)) return solution.join(" ");
  // Pruning
  let lower_bound = solver.pruning_table[cube_str];
  if (lower_bound === undefined) lower_bound = solver.pruning_depth + 1;
  if (lower_bound > depth_remaining) return null;

  for (const move of solver.moves) {
    if (solution.length && move[0] === solution[solution.length - 1][0]) continue; // aside: never use the same layer in consecutive moves
    solution.push(move);
    let result = solve_dfs_with_pruning(solver, apply_move(cube, fmoves[move]), solution, depth_remaining - 1);
    if (result !== null) return result;
    solution.pop();
  }
  return null;
}

function solve_iddfs2(
  solver: ReturnType<typeof create_solver>,
  masked_cube: string,
  depth_limit: number
): string | null {
  for (let depth = 0; depth <= depth_limit; depth++) {
    let solution = solve_dfs_with_pruning(solver, masked_cube, [], depth);
    if (solution !== null) return solution;
  }
  return null;
}

const gen_scramble = () => {
  let pprev = -1,
    prev = -1;
  let scramble = [];
  for (let i = 0; i < 30; i++) {
    let layer;
    do {
      layer = 0 | (Math.random() * 6);
    } while (layer === prev || (layer % 3 === prev % 3 && layer === pprev));
    scramble.push("URFDLB"[layer] + ["2", "'", ""][0 | (Math.random() * 3)]);
    pprev = prev;
    prev = layer;
  }
  return scramble.join(" ");
};

const gen_scramble_from_moves = (moves: string[]) => {
  let pprev = "",
    prev = "";
  let scramble = [];
  let axis_of_layer: Record<string, number> = { U: 1, D: 1, F: 2, B: 2, L: 3, R: 3, M: 3 };
  for (let i = 0; i < 30; i++) {
    let move: string;
    do {
      move = moves[0 | (Math.random() * moves.length)];
    } while (
      move[0] === prev[0] ||
      (axis_of_layer[move[0]] === axis_of_layer[prev[0]] && axis_of_layer[move[0]] === axis_of_layer[pprev[0]])
    );

    scramble.push(move);
    pprev = prev;
    prev = move;
  }
  return scramble.join(" ");
};

const create_fcube = (moves: string) => apply_fmoves(solved_cube, moves);
const create_ifcube = (moves: string) => apply_fmoves(solved_ifcube, moves);

// const fb_scramble = gen_scramble();

// const fb_solution = solve_iddfs2(fb_solver, create_ifcube(fb_scramble), 10);

// console.log({ fb_scramble, fb_solution });

const g1_mask = (ifcube: number[]) => {
  const eo_facelets = [
    S("U", 2),
    S("U", 4),
    S("U", 6),
    S("U", 8),
    S("D", 2),
    S("D", 4),
    S("D", 6),
    S("D", 8),
    S("F", 4),
    S("F", 6),
    S("B", 4),
    S("B", 6),
  ];
  return [...ifcube].map((idx) => (eo_facelets.includes(Number(idx)) ? "o" : "X")).join("");
};

const moveset = {
  mu: ["M", "M'", "M2", "U", "U'", "U2"],
  htm: ["U", "U'", "U2", "D", "D'", "D2", "F", "F'", "F2", "B", "B'", "B2", "L", "L'", "L2", "R", "R'", "R2"],
};

const phase1 = (() => {
  let moves = moveset.htm;
  let g1_pruning_table = gen_pruning_table([g1_mask(solved_ifcube)], 10, moves);
  let g1_solver = create_solver((x) => x === g1_mask(solved_ifcube), moves, g1_pruning_table, 7);
  return {
    moves,
    limit: 10,
    pruning_table: g1_pruning_table,
    solver: g1_solver,
    mask: g1_mask,
  };
})();

// const g1_scramble = "U F' D2 B' F L' F2 B R B' D' F' B' R2 L D B F2 D2 F' R F2 L2 F B2 R U R2 F D";

// const g1_solution = solve_iddfs2(phase1.solver, g1_mask(create_ifcube(g1_scramble)), phase1.limit);
// console.log({ g1_solution });

const g2_mask = (ifcube: number[]) =>
  (() => {
    const co_pieces = [S("U", 1), S("U", 3), S("U", 7), S("U", 9), S("D", 1), S("D", 3), S("D", 7), S("D", 9)];
    const eo_ud_pieces = [S("U", 2), S("U", 4), S("U", 6), S("U", 8), S("D", 2), S("D", 4), S("D", 6), S("D", 8)];
    const eo_e_pieces = [S("F", 4), S("F", 6), S("B", 4), S("B", 6)];
    return [...ifcube]
      .map((idx) =>
        eo_ud_pieces.includes(idx) || co_pieces.includes(idx) ? "x" : eo_e_pieces.includes(idx) ? "y" : "X"
      )
      .join("");
  })();

const phase2 = (() => {
  let g1_moves = ["U", "U'", "U2", "D", "D'", "D2", "L", "L'", "L2", "R", "R'", "R2", "F2", "B2"];
  let depth = 5;
  let g2_pruning_table = gen_pruning_table([g2_mask(solved_ifcube)], depth, g1_moves);
  let g2_solver = create_solver((x) => x === g2_mask(solved_ifcube), g1_moves, g2_pruning_table, depth);
  return {
    moves: g1_moves,
    limit: 10,
    pruning_table: g2_pruning_table,
    solver: g2_solver,
    mask: g2_mask,
  };
})();

// const g2_scramble = gen_scramble_from_moves(phase2.moves);
// const g2_solution = solve_iddfs2(phase2.solver, phase2.mask(create_ifcube(g2_scramble)), phase2.limit);

// console.log({ g2_scramble, g2_solution });

// const g3_corner_mask = (ifcube: number[]) => {
//   const cp_pieces = [..."UDFBLR"].map((f) => [1, 3, 7, 9].map((x) => S(f, x))).flat();
//   return [...ifcube].map((idx) => (cp_pieces.includes(idx) ? "URFDLB"[0 | (idx / 9)] : "X")).join("");
// };

// const g3_corner_table = gen_pruning_table([g3_corner_mask(solved_ifcube)], 10, ["U2", "D2", "F2", "B2", "L2", "R2"]);

const g3_mask = (ifcube: number[]) => {
  const cp_pieces = [..."UDFBLR"].map((f) => [1, 3, 7, 9].map((x) => S(f, x))).flat();
  const ep_pieces = [..."FBLR"].map((f) => [2, 4, 6, 8].map((x) => S(f, x))).flat();
  const face = (f: string) => (f === "B" ? "F" : f === "L" ? "R" : f);
  return [...ifcube]
    .map((idx) =>
      cp_pieces.includes(idx) ? "URFDLB"[0 | (idx / 9)] : ep_pieces.includes(idx) ? face("URFDLB"[0 | (idx / 9)]) : "X"
    )
    .join("");
};

const phase3 = (() => {
  let g2_moves = ["U", "U'", "U2", "D", "D'", "D2", "F2", "B2", "L2", "R2"];
  let d = 5;
  const solved_states_viewed_in_g2 = Object.keys(
    gen_pruning_table([g3_mask(solved_ifcube)], 10, ["U2", "D2", "F2", "B2", "L2", "R2"])
  );
  let g3_pruning_table = gen_pruning_table(solved_states_viewed_in_g2, d, g2_moves);
  let g3_is_solved = (cube: string) => g3_pruning_table[cube] === 0;
  // we could also say (cube) => solved_states_viewed_in_g2.includes(cube) but this is equivalent and faster
  let g3_solver = create_solver(g3_is_solved, g2_moves, g3_pruning_table, d);
  return { moves: g2_moves, limit: 13, pruning_table: g3_pruning_table, solver: g3_solver, mask: g3_mask };
})();

// const g3_scramble = gen_scramble_from_moves(phase3.moves);
// const g3_solution = solve_iddfs2(phase3.solver, phase3.mask(create_ifcube(g3_scramble)), phase3.limit);

// console.log({ g3_solution });

const phase4 = (() => {
  let g4_mask = (ifcube: number[]) => ifcube.map((idx) => "URFDLB"[0 | (idx / 9)]).join("");
  let moves = ["U2", "D2", "L2", "R2", "F2", "B2"];
  let depth = 6;
  let g4_pruning_table = gen_pruning_table([solved_cube], depth, moves);
  let g4_solver = create_solver((x) => x === solved_cube, moves, g4_pruning_table, depth);
  return { moves, limit: 14, pruning_table: g4_pruning_table, solver: g4_solver, mask: g4_mask };
})();

// const g4_scramble = gen_scramble_from_moves(phase4.moves);
// const g4_solution = solve_iddfs2(phase4.solver, phase4.mask(create_ifcube(g4_scramble)), phase4.limit);
// console.log({ g4_solution });

export const solve_thistlethwaite = (cube: number[]) => {
  let solution = [];
  let phases = [phase1, phase2, phase3, phase4];
  for (const phase of phases) {
    let phase_solution = solve_iddfs2(phase.solver, phase.mask(cube), phase.limit);
    if (phase_solution === null) return solution;
    solution.push(phase_solution);
    cube = apply_fmoves(cube, phase_solution);
  }
  return solution;
};

// const ifcub = [
//   51, 1, 27, 3, 4, 21, 18, 48, 20, 8, 41, 24, 16, 13, 39, 47, 52, 45, 38, 14, 9, 7, 22, 32, 42, 10, 36, 33, 5, 0, 28,
//   31, 34, 26, 30, 2, 35, 37, 6, 12, 40, 19, 29, 25, 53, 44, 46, 17, 50, 49, 23, 11, 43, 15,
// ];
// const tt_solution = solve_thistlethwaite(ifcub);

// console.log({
//   tt_solution,
//   solv: apply_fmoves(ifcub, tt_solution.join(" "))
//     .map((idx) => "URFDLB"[0 | (idx / 9)])
//     .join(""),
// });

/*

URFDLB
U - yellow
R - green
F - red
D - white
L - blue
B - orange

U R F D L B

BBDUUFFBF
ULFRRLBBB
LRRFFDLRL
DUUDDDFDU
DLURLUDFB
LURBBFRLR

BBDUUFFBFULFRRLBBBLRRFFDLRLDUUDDDFDUDLURLUDFBLURBBFRLR

*/
