"use client";

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";

type FadeInProps = ComponentPropsWithoutRef<"div"> & {
  /** Delay in ms before the reveal transition starts. */
  delay?: number;
};

/** Fades and lifts its content into place the first time it scrolls into view. */
export default function FadeIn({ delay = 0, className, style, ...rest }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const classes = ["fade-in", visible && "is-visible", className].filter(Boolean).join(" ");

  return (
    <div
      ref={ref}
      className={classes}
      style={{ ...style, transitionDelay: `${delay}ms` }}
      {...rest}
    />
  );
}
