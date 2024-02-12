import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store/store";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cube_sides, solved_cube } from "@/helpers/helper";
import { ICubeSide } from "@/helpers/types";
import { Toggle } from "../ui/toggle";
import { solveCube } from "@/lib/solver/solver";
import { useState } from "react";
import { ICubeMoves, cube_moves } from "@/lib/moves/moves";

export function CubeDevTools() {
  const { cube, highlight, updateStore, updateCube, rotateCube, rotateCube2Part, toggleCubeRotating } = useAppStore();
  const toggles = useAppStore((state) => ({
    scanReversed: state.scanReversed,
    previewReversed: state.previewReversed,
    isScanRefreshing: state.isScanRefreshing,
    devScanPreviewShow: state.devScanPreviewShow,
    isScanRefreshGlow: state.isScanRefreshGlow,
  }));
  const [move, setMove] = useState<ICubeMoves>("F");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="fixed left-4 bottom-4">
          DevTools
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Devtools</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Cube</Label>
            <Input className="col-span-2" value={cube} onChange={(e) => updateCube(e.target.value, true)} />
            <Button variant="outline" onClick={() => updateCube(solved_cube, true)}>
              Set solved
            </Button>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Highlight</Label>
            <Select
              onValueChange={(val) => updateStore({ highlight: val === "none" ? undefined : (val as ICubeSide) })}
              value={highlight}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a Highlight" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">None</SelectItem>
                  {cube_sides.map((side) => (
                    <SelectItem value={side} key={`dev-select-highlight-${side}`}>
                      {side}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(toggles).map(([key, value]) => (
              <Toggle
                key={`dev-toggle-${key}`}
                variant="outline"
                pressed={value}
                onClick={() => updateStore({ [key]: !value })}
              >
                {key}
              </Toggle>
            ))}
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => {
                console.log({ solution: solveCube(cube) });
              }}
            >
              Solve cube
            </Button>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">RotateSide</Label>
            <Select onValueChange={(val) => setMove(val as ICubeMoves)} value={move}>
              <SelectTrigger>
                <SelectValue placeholder="Select a side" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">None</SelectItem>
                  {cube_moves.map((m) => (
                    <SelectItem value={m} key={`dev-select-highlight-${m}`}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button type="button" variant="secondary" onClick={() => rotateCube(move)}>
              Rotate
            </Button>
            <Button type="button" variant="secondary" onClick={() => rotateCube2Part(move)}>
              Rotate 2part
            </Button>
          </div>
          <div>
            <Button onClick={() => toggleCubeRotating()}>Toggle rotating cube</Button>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
