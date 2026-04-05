"use client";

/**
 * FabricCanvas — SSR-safe fabric.js v5 canvas wrapper.
 * All fabric imports are lazy (inside useEffect / handlers).
 * Uses a pending-ops queue so handle calls before canvas is ready
 * are automatically replayed once init() completes.
 */

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TextStyle {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  fill?: string;
  /** 0–1 fraction of canvas height from top */
  topFrac?: number;
  /** 0–1 fraction of canvas width from left; default = 0.5 (center) */
  leftFrac?: number;
  originX?: "left" | "center" | "right";
  originY?: "top" | "center" | "bottom";
  shadow?: string;
  strokeWidth?: number;
  stroke?: string;
}

export type LogoPosition = "tl" | "tc" | "tr" | "bl" | "bc" | "br";

export interface ImageOverlayOpts {
  /** One of the 6 position presets */
  position?: LogoPosition;
  /** Width as fraction of canvas width (default 0.22) */
  widthFrac?: number;
}

export interface FabricHandle {
  // ── Product ──────────────────────────────────────────────────────────────
  loadProduct(dataUrl: string): void;
  clearProduct(): void;

  // ── Background ───────────────────────────────────────────────────────────
  setBackground(color: string): void;
  setBackgroundImage(dataUrl: string): void;
  clearBackgroundImage(fallbackColor?: string): void;

  // ── Named text objects ────────────────────────────────────────────────────
  /** Create or update a text layer identified by `id` */
  setTextById(id: string, style: TextStyle): void;
  /** Remove a named object */
  removeById(id: string): void;

  // ── Named image overlays ──────────────────────────────────────────────────
  /** Set/replace a named image overlay (logo, sticker …) */
  setImageById(id: string, dataUrl: string, opts?: ImageOverlayOpts): void;

  // ── Export ────────────────────────────────────────────────────────────────
  exportPNG(): string;
}

// ─── Internal ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type F = any;

interface Props {
  width: number;
  height: number;
  /** Called once after fabric canvas is fully initialised */
  onReady?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FabricCanvas = forwardRef<FabricHandle, Props>(({ width, height, onReady }, ref) => {
  const elRef       = useRef<HTMLCanvasElement>(null);
  const canvasRef   = useRef<F>(null);
  const productRef  = useRef<F>(null);
  const pendingRef  = useRef<Array<() => void>>([]);   // ops queued before init

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Run `op` now if canvas is ready, else queue it */
  const run = (op: () => void) => {
    if (canvasRef.current) {
      op();
    } else {
      pendingRef.current.push(op);
    }
  };

  /** Return object whose `name` === id, or null */
  const findById = (id: string): F | null => {
    const canvas: F = canvasRef.current;
    if (!canvas) return null;
    return canvas.getObjects().find((o: F) => o.name === id) ?? null;
  };

  /** Compute x/y for a logo position */
  const posXY = (
    pos: LogoPosition,
    logoW: number,
    logoH: number,
    cW: number,
    cH: number,
    pad: number
  ) => {
    const left =
      pos.endsWith("l") ? pad
      : pos.endsWith("r") ? cW - logoW - pad
      : (cW - logoW) / 2;
    const top =
      pos.startsWith("t") ? pad
      : cH - logoH - pad;
    return { left, top };
  };

  // ── Init / destroy ─────────────────────────────────────────────────────────
  useEffect(() => {
    let canvas: F;
    let removeKey: (() => void) | undefined;

    const init = async () => {
      const { fabric } = await import("fabric");

      canvas = new fabric.Canvas(elRef.current!, {
        width,
        height,
        backgroundColor: "#FFFFFF",
        preserveObjectStacking: true,
        selection: true,
      });
      canvasRef.current = canvas;

      // Keyboard delete
      const onKey = (e: KeyboardEvent) => {
        const active: F = canvas.getActiveObject();
        if (!active) return;
        if (e.key !== "Delete" && e.key !== "Backspace") return;
        if (active.type === "i-text" && active.isEditing) return;
        if (active === productRef.current) productRef.current = null;
        canvas.remove(active);
        canvas.discardActiveObject();
        canvas.renderAll();
      };
      window.addEventListener("keydown", onKey);
      removeKey = () => window.removeEventListener("keydown", onKey);

      // Flush pending ops
      pendingRef.current.forEach((op) => op());
      pendingRef.current = [];

      // Notify parent
      onReady?.();
    };

    init();

    return () => {
      removeKey?.();
      canvasRef.current?.dispose();
      canvasRef.current = null;
      productRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // ── Handle ─────────────────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({

    // ── loadProduct ────────────────────────────────────────────────────────
    loadProduct(dataUrl: string) {
      run(() => {
        const canvas: F = canvasRef.current;
        import("fabric").then(({ fabric }) => {
          if (productRef.current) {
            canvas.remove(productRef.current);
            productRef.current = null;
          }
          // No crossOrigin for data URLs — setting it causes silent failure
          const isDataUrl = dataUrl.startsWith("data:");
          fabric.Image.fromURL(
            dataUrl,
            (img: F) => {
              if (!img || !img.width) {
                console.error("[FabricCanvas] loadProduct: fromURL failed");
                return;
              }
              const scale = Math.min(
                (canvas.width  * 0.80) / img.width,
                (canvas.height * 0.80) / img.height
              );
              img.set({
                left: canvas.width / 2,
                top:  canvas.height / 2,
                originX: "center",
                originY: "center",
                scaleX: scale,
                scaleY: scale,
                name: "__product__",
              });
              productRef.current = img;
              canvas.add(img);
              canvas.setActiveObject(img);
              canvas.renderAll();
            },
            isDataUrl ? undefined : { crossOrigin: "anonymous" }
          );
        });
      });
    },

    // ── clearProduct ───────────────────────────────────────────────────────
    clearProduct() {
      run(() => {
        const canvas: F = canvasRef.current;
        if (productRef.current) {
          canvas.remove(productRef.current);
          productRef.current = null;
          canvas.renderAll();
        }
      });
    },

    // ── setBackground ──────────────────────────────────────────────────────
    setBackground(color: string) {
      run(() => {
        const canvas: F = canvasRef.current;
        canvas.setBackgroundImage(null, () => {});
        canvas.setBackgroundColor(color, () => canvas.renderAll());
      });
    },

    // ── setBackgroundImage ─────────────────────────────────────────────────
    setBackgroundImage(dataUrl: string) {
      run(() => {
        const canvas: F = canvasRef.current;
        import("fabric").then(({ fabric }) => {
          const isBgDataUrl = dataUrl.startsWith("data:");
          fabric.Image.fromURL(
            dataUrl,
            (img: F) => {
              if (!img || !img.width) {
                console.error("[FabricCanvas] setBackgroundImage: fromURL failed");
                return;
              }
              const scale = Math.max(
                canvas.width  / img.width,
                canvas.height / img.height
              );
              img.set({
                scaleX: scale,
                scaleY: scale,
                left: canvas.width  / 2,
                top:  canvas.height / 2,
                originX: "center",
                originY: "center",
                selectable: false,
                evented: false,
              });
              canvas.setBackgroundColor("", () => {});
              canvas.setBackgroundImage(img, () => {
                if (productRef.current) canvas.bringToFront(productRef.current);
                canvas.renderAll();
              });
            },
            isBgDataUrl ? undefined : { crossOrigin: "anonymous" }
          );
        });
      });
    },

    // ── clearBackgroundImage ───────────────────────────────────────────────
    clearBackgroundImage(fallbackColor = "#FFFFFF") {
      run(() => {
        const canvas: F = canvasRef.current;
        canvas.setBackgroundImage(null, () => {});
        canvas.setBackgroundColor(fallbackColor, () => canvas.renderAll());
      });
    },

    // ── setTextById ────────────────────────────────────────────────────────
    setTextById(id: string, style: TextStyle) {
      run(() => {
        const canvas: F = canvasRef.current;
        import("fabric").then(({ fabric }) => {
          const existing = findById(id);
          const cW = canvas.width as number;
          const cH = canvas.height as number;

          const topFrac  = style.topFrac  ?? 0.85;
          const leftFrac = style.leftFrac ?? 0.5;
          const origX    = style.originX  ?? "center";
          const origY    = style.originY  ?? "center";

          const props = {
            fontSize:    style.fontSize   ?? Math.round(cW * 0.06),
            fontFamily:  style.fontFamily ?? "Inter, sans-serif",
            fontWeight:  style.fontWeight ?? "bold",
            fontStyle:   (style.fontStyle  ?? "normal") as "" | "normal" | "italic" | "oblique",
            textAlign:   style.textAlign  ?? "center",
            fill:        style.fill       ?? "#FFFFFF",
            shadow:      style.shadow     ?? "2px 2px 6px rgba(0,0,0,0.5)",
            stroke:      style.stroke,
            strokeWidth: style.strokeWidth ?? 0,
            left:        cW * leftFrac,
            top:         cH * topFrac,
            originX:     origX,
            originY:     origY,
            selectable:  true,
            name:        id,
          };

          if (existing) {
            existing.set({ ...props, text: style.text ?? existing.text });
            canvas.renderAll();
          } else {
            const t = new fabric.IText(style.text ?? "", props);
            canvas.add(t);
            canvas.bringToFront(t);
            canvas.renderAll();
          }
        });
      });
    },

    // ── removeById ─────────────────────────────────────────────────────────
    removeById(id: string) {
      run(() => {
        const canvas: F = canvasRef.current;
        const obj = findById(id);
        if (obj) {
          canvas.remove(obj);
          canvas.renderAll();
        }
      });
    },

    // ── setImageById ───────────────────────────────────────────────────────
    setImageById(id: string, dataUrl: string, opts: ImageOverlayOpts = {}) {
      run(() => {
        const canvas: F = canvasRef.current;
        import("fabric").then(({ fabric }) => {
          // Remove existing
          const existing = findById(id);
          if (existing) canvas.remove(existing);

          const cW      = canvas.width  as number;
          const cH      = canvas.height as number;
          const wFrac   = opts.widthFrac ?? 0.22;
          const pad     = cW * 0.04;
          const pos     = opts.position ?? "br";

          const isOverlayDataUrl = dataUrl.startsWith("data:");
          fabric.Image.fromURL(
            dataUrl,
            (img: F) => {
              if (!img || !img.width) {
                console.error("[FabricCanvas] setImageById: fromURL failed for id=", id);
                return;
              }
              const targetW = cW * wFrac;
              const scale   = targetW / img.width;
              const logoH   = img.height * scale;
              const { left, top } = posXY(pos, targetW, logoH, cW, cH, pad);
              img.set({
                left,
                top,
                scaleX: scale,
                scaleY: scale,
                selectable: true,
                evented: true,
                name: id,
                opacity: 1,
              });
              canvas.add(img);
              canvas.bringToFront(img);
              canvas.renderAll();
            },
            isOverlayDataUrl ? undefined : { crossOrigin: "anonymous" }
          );
        });
      });
    },

    // ── exportPNG ──────────────────────────────────────────────────────────
    exportPNG() {
      const canvas: F = canvasRef.current;
      if (!canvas) return "";
      return canvas.toDataURL({ format: "png", multiplier: 2 });
    },
  }));

  return <canvas ref={elRef} style={{ display: "block" }} />;
});

FabricCanvas.displayName = "FabricCanvas";
export default FabricCanvas;
