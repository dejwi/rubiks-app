"use client";

import { colorMapThree } from "@/lib/maps/cube";
import { RGBToHSV } from "@/lib/helpers/rgb-to-hsv";
import { useAppStore } from "@/lib/store/store";

import { Toggle } from "../ui/toggle";

const DevScanResultPreview = () => {
  const previewRefresh = useAppStore((s) => s.isScanRefreshing);
  const [updateStore, lastScanResult] = useAppStore((s) => [s.updateStore, s.lastScanResult]);

  return (
    <div>
      <Toggle
        pressed={previewRefresh}
        onClick={() => updateStore({ isScanRefreshing: !previewRefresh })}
        className="w-[10rem]"
        variant="outline"
      >
        {previewRefresh ? "Pause" : "Unpause"}
      </Toggle>
      <div className="grid grid-cols-3 w-[10rem] h-[10rem] grid-rows-3 border border-violet-600">
        {lastScanResult?.map(({ destSide, scanData, id }) => (
          <div
            key={`dev-scan-preview-${id}`}
            className="flex items-center justify-center w-full h-full"
            style={{
              background: `#${destSide ? colorMapThree[destSide]?.getHexString() : colorMapThree.X.getHexString()}`,
            }}
            onClick={() => {
              console.log({
                hsv: RGBToHSV(scanData[0], scanData[1], scanData[2]),
                rgh: scanData,
              });
            }}
          >
            {destSide}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DevScanResultPreview;
