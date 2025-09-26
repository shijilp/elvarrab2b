// components/Barcode.tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";

type Props = {
  value: string;
  height?: number; // bar height in px
  maxWidthMm?: number; // physical width of label area in mm (content box)
  quietMm?: number; // left/right quiet zone in mm
  minModule?: number; // min bar module width (px)
  maxModule?: number; // max bar module width (px)
  showText?: boolean; // human-readable text
};

export default function Barcode({
  value,
  height = 22,
  maxWidthMm = 34, // for a 38x25mm label with ~2mm padding left/right
  quietMm = 1.5, // quiet zone each side (≈ 10 modules is ideal, we keep a small constant on tiny labels)
  minModule = 0.6,
  maxModule = 1.2,
  showText = false,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [wrapPx, setWrapPx] = useState<number | null>(null);

  // Convert mm → px based on current device CSS dpi (~96dpi, 1in=25.4mm)
  const mmToPx = (mm: number) => (mm / 25.4) * 96;

  // Approximate modules needed for CODE128:
  // start(11) + n*11 + check(11) + stop(13) ≈ 11n + 35
  const modulesNeeded = (n: number) => 11 * n + 35;

  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const resize = () => setWrapPx(wrapRef.current!.clientWidth);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !wrapPx || !value) return;

    const contentPx = Math.min(wrapPx, mmToPx(maxWidthMm));
    const quietPx = mmToPx(quietMm);
    const usablePx = Math.max(8, contentPx - 2 * quietPx);

    // Compute a module width that fits in the usable width
    const mods = modulesNeeded(value.length);
    const moduleWidth = Math.min(
      maxModule,
      Math.max(minModule, usablePx / mods)
    );

    // Render
    JsBarcode(svgRef.current, value, {
      format: "CODE128",
      height,
      width: moduleWidth,
      marginLeft: quietPx,
      marginRight: quietPx,
      marginTop: 0,
      marginBottom: 0,
      displayValue: showText,
      fontSize: 9,
      lineColor: "#000",
    });

    // Make SVG scale nicely in print & screen
    svgRef.current.style.width = "100%";
    svgRef.current.style.height = "auto";
    svgRef.current.setAttribute("preserveAspectRatio", "xMidYMid meet");
  }, [
    value,
    wrapPx,
    height,
    maxWidthMm,
    quietMm,
    minModule,
    maxModule,
    showText,
  ]);

  return (
    <div ref={wrapRef} style={{ lineHeight: 0 }}>
      <svg ref={svgRef} aria-label={`Barcode ${value}`} />
    </div>
  );
}
