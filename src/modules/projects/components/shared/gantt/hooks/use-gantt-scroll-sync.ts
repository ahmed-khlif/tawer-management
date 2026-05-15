"use client";

import { useEffect, type RefObject } from "react";

/**
 * Synchronises vertical scroll between the frozen left panel and
 * the scrollable right timeline. Also maps Shift+Scroll → horizontal
 * scroll on the right panel for keyboard-first navigation.
 */
export function useGanttScrollSync(
  leftRef: RefObject<HTMLElement | null>,
  rightRef: RefObject<HTMLElement | null>,
  headerRef: RefObject<HTMLElement | null>,
) {
  // ── Scroll sync ────────────────────────────────────────────────────────
  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    const header = headerRef.current;
    if (!left || !right || !header) return;

    let syncingVert = false;
    let syncingHoriz = false;

    function syncVertFromLeft() {
      if (syncingVert) return;
      syncingVert = true;
      right!.scrollTop = left!.scrollTop;
      syncingVert = false;
    }

    function syncVertFromRight() {
      if (syncingVert) return;
      syncingVert = true;
      left!.scrollTop = right!.scrollTop;
      syncingVert = false;
    }

    function syncHorizFromRight() {
      if (syncingHoriz) return;
      syncingHoriz = true;
      header!.scrollLeft = right!.scrollLeft;
      syncingHoriz = false;
    }

    left.addEventListener("scroll", syncVertFromLeft, { passive: true });
    right.addEventListener("scroll", syncVertFromRight, { passive: true });
    right.addEventListener("scroll", syncHorizFromRight, { passive: true });

    return () => {
      left.removeEventListener("scroll", syncVertFromLeft);
      right.removeEventListener("scroll", syncVertFromRight);
      right.removeEventListener("scroll", syncHorizFromRight);
    };
  }, [leftRef, rightRef, headerRef]);

  // ── Shift+Scroll → horizontal pan ──────────────────────────────────────
  useEffect(() => {
    const el = rightRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      if (e.shiftKey) {
        e.preventDefault();
        el!.scrollLeft += e.deltaY;
      }
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [rightRef]);
}
