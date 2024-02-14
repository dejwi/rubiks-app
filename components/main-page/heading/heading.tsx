"use client";

import React from "react";
import { motion } from "framer-motion";

const MainPageHeading = () => {
  const text = ["Scan.", "Solve.", "Be proud."];
  const subText = ["Scan your cube with an", "smartphone and get step-by-step", "solution."];

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
        exit="hidden"
      >
        {text.map((t) => (
          <AnimatedText key={`head-${t}`} text={t} />
        ))}
      </motion.h1>

      <motion.span
        className="block text-xs text-muted-foreground max-w-[12rem] tracking-tight leading-[18px] mt-1"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.005,
              delayChildren: 0.8,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* <AnimatedText text={subText} /> */}
        {subText.map((t) => (
          <AnimatedText key={`sub-${t}`} text={t} />
        ))}
      </motion.span>
    </div>
  );
};

export default MainPageHeading;

const animatedTextVariants = {
  hidden: {
    y: "200%",
    opacity: 0,
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.85 },
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: { ease: [0.455, 0.03, 0.515, 0.955], duration: 0.75 },
  },
};

const AnimatedText = ({ text }: { text: string }) => {
  //  Split each word of props.text into an array
  const splitWords = text.split(" ");

  // Create storage array
  const words: string[][] = [];

  // Push each word into words array
  for (const [, item] of splitWords.entries()) {
    words.push(item.split(""));
  }

  // Add a space ("\u00A0") to the end of each word
  words.map((word) => {
    return word.push("\u00A0");
  });

  return (
    <div>
      {words.map((word, index) => {
        return (
          // Wrap each word in the Wrapper component
          <span className="whitespace-nowrap" key={`w-${word}-${index}`}>
            {words[index].flat().map((element, index) => {
              return (
                <span className="inline-block overflow-hidden" key={`text-${element}`}>
                  <motion.span className="inline-block" variants={animatedTextVariants}>
                    {element}
                  </motion.span>
                </span>
              );
            })}
          </span>
        );
      })}
      {/* {characters.map((char, i) => (
        <span className="inline-block overflow-hidden" key={`text-${char}`}>
          <motion.span className="inline-block" variants={animatedTextVariants}>
            {char}
          </motion.span>
        </span>
      ))} */}
    </div>
  );
};
