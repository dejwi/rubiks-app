"use client";

import { colorMapThree } from "@/lib/maps/cube";
import { ICubeSide } from "@/types/types";
import { motion } from "framer-motion";

const ScanInstructionsInfo = () => {
  return (
    <motion.div
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -200, opacity: 0 }}
      transition={{ ease: "easeInOut" }}
    >
      <h1 className="font-extrabold tracking-tight text-[2.5rem] leading-[3rem]">Get Ready to Scan:</h1>
      <span className="block text-xs text-muted-foreground max-w-[12rem] tracking-tight leading-[18px] mt-3 -mb-5">
        <ol className="list-decimal ml-[2ch] flex flex-col gap-[0.12rem]">
          <li>
            Hold Your Cube: Position your cube in your hand so that the{" "}
            <TextColor color="F">red center is facing you</TextColor>.
          </li>
          <li>
            <span>Orient the Sides:</span>
            <ul className="list-disc ml-[1ch]">
              <li>
                <TextColor color="L">Left Side</TextColor>: Ensure the <TextColor color="L">blue center</TextColor> is
                on the left side.
              </li>
              <li>
                <TextColor color="R">Right Side</TextColor>: Make sure the <TextColor color="R">green center</TextColor>{" "}
                is on the right side.
              </li>
              <li>
                <TextColor color="U">Top Side</TextColor>: Position the <TextColor color="U">yellow center</TextColor>{" "}
                on the top side.
              </li>
              <li>
                <TextColor color="D">Bottom Side</TextColor>: Keep the <TextColor color="D">white center</TextColor> on
                the bottom side.
              </li>
            </ul>
          </li>
          <li>
            Match the Preview: Use the 3D cube preview to visualize the correct orientation. Adjust your cube to match
            the preview.
          </li>
        </ol>
      </span>
    </motion.div>
  );
};

const TextColor = ({ color, children }: { color: ICubeSide; children: React.ReactNode }) => (
  <span style={{ color: `#${colorMapThree[color].getHexString()}` }}>{children}</span>
);

export default ScanInstructionsInfo;
