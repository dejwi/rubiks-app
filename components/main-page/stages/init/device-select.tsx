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
import { useAppStore } from "@/lib/store/store";
import { useEffect, useState } from "react";
import { useToast } from "../../../ui/use-toast";

export function DeviceSelect() {
  const { updateStore, deviceId } = useAppStore();
  const [devices, setDevices] = useState<{ id: string; label: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const check = async () => {
      try {
        const st = await navigator.mediaDevices.getUserMedia({ video: true });
        st.getTracks().forEach((t) => t.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const filt = devices.filter((d) => d.kind === "videoinput" && d.deviceId);
        setDevices(filt.map((d) => ({ id: d.deviceId, label: d.label })));

        if (filt.length) updateStore({ deviceId: filt[0]?.deviceId });
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Camera Permission Denied",
          description: "Please allow camera access to use this app.",
        });
      }
    };

    check();
  }, []);

  return (
    <Select value={deviceId} onValueChange={(id) => updateStore({ deviceId: id })}>
      <SelectTrigger className="w-[200px]">
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
