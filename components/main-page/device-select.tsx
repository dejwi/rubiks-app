"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/helpers/store";
import { useEffect, useState } from "react";

export function DeviceSelect() {
  const { updateStore, deviceId } = useAppStore();
  const [devices, setDevices] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    (async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const filt = devices.filter((d) => d.kind === "videoinput");
      setDevices(filt.map((d) => ({ id: d.deviceId, label: d.label })));
    })();
  }, []);

  return (
    <Select value={deviceId} onValueChange={(id) => updateStore({ deviceId: id })}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a camera device" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Select a camera device</SelectLabel>
          {devices.map((device) => (
            <SelectItem key={`device-sel-${device.id}`} value={device.id}>
              {device.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
