import { useEffect, useEffectEvent } from "react";

/**
 * Runs `onFrame` on every animation frame while the component is mounted.
 * `dt` is the time since the previous frame in ms, capped at 64ms so a
 * backgrounded tab doesn't cause animations to jump when it returns.
 */
export function useAnimationFrame(onFrame: (now: number, dt: number) => void) {
  const handleFrame = useEffectEvent(onFrame);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = () => {
      const now = performance.now();
      const dt = Math.min(64, now - last);
      last = now;
      handleFrame(now, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}
