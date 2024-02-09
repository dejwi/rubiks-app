"use client";

import { colorMapThree } from "@/helpers/helper";
import { RGBToHSV } from "@/helpers/rgb-to-hsv";
import { useAppStore } from "@/helpers/store";
import { IScanResult } from "@/helpers/types";
import { useEffect, useState } from "react";
import { Toggle } from "../ui/toggle";

interface IProps {
  getScannedColors: () => IScanResult;
}

const DevScanResultPreview = ({ getScannedColors }: IProps) => {
  const [data, setData] = useState<Array<IScanResult[number] & { id: number }>>([]);
  const previewRefresh = useAppStore((s) => s.devScanPreviewRefresh);
  const updateStore = useAppStore((s) => s.updateStore);

  useEffect(() => {
    if (!previewRefresh) return;
    const interval = setInterval(() => {
      setData(getScannedColors().map((scanData) => ({ ...scanData, id: Math.random() })));
    }, 550);
    return () => {
      clearInterval(interval);
    };
  }, [previewRefresh, getScannedColors]);

  return (
    <div>
      <Toggle
        pressed={previewRefresh}
        onClick={() => updateStore({ devScanPreviewRefresh: !previewRefresh })}
        className="w-[10rem]"
        variant="outline"
      >
        {previewRefresh ? "Pause" : "Unpause"}
      </Toggle>
      <div className="grid grid-cols-3 w-[10rem] h-[10rem] grid-rows-3 border border-violet-600">
        {data?.map(({ destSide, scanData, id }) => (
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
