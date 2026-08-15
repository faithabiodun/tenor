"use client";

import {useEffect, useRef, useState} from "react";

/**
 * Progressive reveal on scroll.
 *
 * The page tells its argument one beat at a time rather than presenting the whole wall at
 * once. Each block waits until it is genuinely on screen, then arrives.
 *
 * It reveals once and stays revealed. Re-hiding on scroll-up is a common flourish and it is
 * the wrong behaviour: content a reader has already seen should not disappear when they look
 * back at it, and on a short viewport it makes the page flicker as it settles.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer, or motion is unwelcome: show it immediately rather than gating content
    // behind an effect that may never run.
    if (
      typeof IntersectionObserver === "undefined" ||
      (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      setShown(true);
      return;
    }

    // Belt and braces, because a reveal that never fires is not a missing animation, it is
    // permanently invisible content. The rect check covers anything already on screen at
    // mount, the scroll listener covers the case where observer callbacks are not being
    // delivered at all, and the observer does the ordinary work.
    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      setShown(true);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    const inView = () => {
      const b = el.getBoundingClientRect();
      const h = window.innerHeight || document.documentElement.clientHeight;
      // Any part of it past the top edge and a little way up from the bottom.
      return b.top < h * 0.92 && b.bottom > 0;
    };

    const onScroll = () => {
      if (inView()) show();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) show();
      },
      {threshold: 0.1},
    );

    io.observe(el);
    window.addEventListener("scroll", onScroll, {passive: true});
    window.addEventListener("resize", onScroll, {passive: true});
    if (inView()) show();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${shown ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? {transitionDelay: `${delay}ms`} : undefined}
    >
      {children}
    </div>
  );
}
