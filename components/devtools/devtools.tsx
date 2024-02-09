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
import { useAppStore } from "@/helpers/store";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cube_sides, solved_cube } from "@/helpers/helper";
import { ICubeSide } from "@/helpers/types";
import { Toggle } from "../ui/toggle";

export function CubeDevTools() {
  const { cube, highlight, updateStore } = useAppStore();
  const toggles = useAppStore((state) => ({
    scanComplete: state.scanComplete,
    scanReversed: state.scanReversed,
    previewReversed: state.previewReversed,
    devScanPreviewRefresh: state.devScanPreviewRefresh,
    devScanPreviewShow: state.devScanPreviewShow,
  }));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">DevTools</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Devtools</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Cube</Label>
            <Input className="col-span-2" value={cube} onChange={(e) => updateStore({ cube: e.target.value })} />
            <Button variant="outline" onClick={() => updateStore({ cube: solved_cube })}>
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
