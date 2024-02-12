"use client";

import React from "react";
import { motion } from "framer-motion";

const MainPageHeading = () => {
  const text = ["Scan.", "Solve.", "Be proud."];

  return (
    <div>
      <motion.h1
        className="font-extrabold tracking-tight text-[2.5rem] leading-[3rem]"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.025,
            },
          },
        }}
        initial="hidden"
        animate="visible"
      >
        {text.map((t) => (
          <AnimatedText key={`head-${t}`} text={t} />
        ))}
        {/* Scan.
          <br />
          Solve.
          <br />
          Be proud. */}
      </motion.h1>

      <motion.span
        className="block text-xs text-muted-foreground max-w-[12rem] tracking-tight leading-[18px] mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.15 }}
      >
        Scan your cube with an smartphone and get step-by-step solution
      </motion.span>
    </div>
  );
};

export default MainPageHeading;

const animatedTextVariants = {
  hidden: {
    y: "200%",
    // color: "#0055FF",
    opacity: 0,
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.85 },
  },
  visible: {
    y: 0,
    // color: "#FFFFFF",
    opacity: 1,
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.75 },
  },
};

const AnimatedText = ({ text }: { text: string }) => {
  const characters = text.split("");

  return (
    <div>
      {characters.map((char, i) => (
        <span className="inline-block overflow-hidden" key={`text-${char}`}>
          <motion.span className="inline-block" variants={animatedTextVariants}>
            {char}
          </motion.span>
        </span>
      ))}
    </div>
  );
};
