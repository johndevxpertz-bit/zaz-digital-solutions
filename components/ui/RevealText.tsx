"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";

type RevealTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  /** Animate immediately on mount instead of waiting for scroll (e.g. hero headline). */
  immediate?: boolean;
};

/**
 * Word-stagger headline reveal: each word sits behind its own overflow-hidden
 * mask and slides up into place. Reserved for headline-length strings (hero
 * <h1>, major section <h2>s) — never for body copy, which stays on the
 * simpler block-level Reveal fade.
 */
export default function RevealText({
  text,
  as = "h2",
  className,
  style,
  delay = 0,
  immediate = false,
}: RevealTextProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const Tag = as;
  const words = text.split(" ").filter(Boolean);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const wordEls = el.querySelectorAll<HTMLElement>(".zaz-reveal-word-inner");

    if (prefersReducedMotion()) {
      gsap.set(wordEls, { y: "0%" });
      return;
    }

    registerGsap();

    const animation = gsap.fromTo(
      wordEls,
      { y: "110%" },
      {
        y: "0%",
        duration: 0.9,
        delay,
        stagger: 0.045,
        ease: "power3.out",
        scrollTrigger: immediate
          ? undefined
          : {
              trigger: el,
              start: "top 85%",
              once: true,
            },
      }
    );

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [delay, immediate]);

  return (
    <Tag ref={containerRef} className={className} style={style}>
      {words.map((word, index) => (
        <span key={index}>
          <span
            className="zaz-reveal-word-mask"
            style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}
          >
            <span
              className="zaz-reveal-word-inner"
              style={{ display: "inline-block", transform: "translateY(110%)" }}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
