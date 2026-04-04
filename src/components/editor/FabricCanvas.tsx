"use client";

/**
 * FabricCanvas — SSR-safe fabric.js canvas wrapper.
 * All fabric imports are lazy (inside useEffect / handlers)
 * so this file never runs on the server.
 */

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

// ─── Public handle ────────────────────────────────────────────────────────────

export interface FabricHandle {
  /** Load (or replace) the main product image onto the canvas */
  loadProduct(dataUrl: string): void;
  /** Fill canvas with a solid colour */
  setBackground(color: string): void;
  /** Tile/fill canvas with an image background */
  setBackgroundImage(dataUrl: string): void;
  /** Clear the background image and reset to a colour */
  clearBackgroundImage(fallbackColor?: string): void;
  /** Add an editable text object at the bottom-centre */
  addText(text: string): void;
  /** Remove the current product image from the canvas */
  clearProduct(): void;
  /** Export canvas as a PNG data-URL at 2× resolution */
  exportPNG(): string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  width: number;
  height: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFabric = any;

const FabricCanvas = forwardRef<FabricHandle, Props>(({ width, height }, ref) => {
  const elRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<AnyFabric>(null);
  const productRef = useRef<AnyFabric>(null);

  // ── Init / resize ──────────────────────────────────────────────────────────
  useEffect(() => {
    let canvas: AnyFabric;
    let removeKey: (() => void) | undefined;

    const init = async () => {
      const { fabric } = await import("fabric");

      canvas = new fabric.Canvas(elRef.current!, {
        width,
        height,
        backgroundColor: "#FFFFFF",
        preserveObjectStacking: true,
      });
      canvasRef.current = canvas;

      // Delete / Backspace removes selected object (skip while editing text)
      const onKey = (e: KeyboardEvent) => {
        const active = canvas.getActiveObject() as AnyFabric;
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
    };

    init();

    return () => {
      removeKey?.();
      canvasRef.current?.dispose();
      canvasRef.current = null;
      productRef.current = null;
    };
    // We intentionally re-create the canvas when dimensions change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // ── Exposed handle ─────────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    // ── loadProduct ──────────────────────────────────────────────────────────
    loadProduct(dataUrl: string) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      import("fabric").then(({ fabric }) => {
        // Remove previous product
        if (productRef.current) {
          canvas.remove(productRef.current);
          productRef.current = null;
        }

        fabric.Image.fromURL(
          dataUrl,
          (img: AnyFabric) => {
            const scale = Math.min(
              (canvas.width * 0.78) / img.width,
              (canvas.height * 0.78) / img.height
            );
            img.set({
              left: canvas.width / 2,
              top: canvas.height / 2,
              originX: "center",
              originY: "center",
              scaleX: scale,
              scaleY: scale,
            });
            productRef.current = img;
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
          },
          { crossOrigin: "anonymous" }
        );
      });
    },

    // ── setBackground ─────────────────────────────────────────────────────────
    setBackground(color: string) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Clear any background image first
      canvas.setBackgroundImage(null, () => {});
      canvas.setBackgroundColor(color, () => canvas.renderAll());
    },

    // ── setBackgroundImage ────────────────────────────────────────────────────
    setBackgroundImage(dataUrl: string) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      import("fabric").then(({ fabric }) => {
        fabric.Image.fromURL(
          dataUrl,
          (img: AnyFabric) => {
            // Cover the entire canvas
            const scaleX = canvas.width / img.width;
            const scaleY = canvas.height / img.height;
            const scale = Math.max(scaleX, scaleY);
            img.set({
              scaleX: scale,
              scaleY: scale,
              left: canvas.width / 2,
              top: canvas.height / 2,
              originX: "center",
              originY: "center",
              selectable: false,
              evented: false,
            });
            // Clear solid colour so bg-image shows through
            canvas.setBackgroundColor("", () => {});
            canvas.setBackgroundImage(img, () => {
              if (productRef.current) canvas.bringToFront(productRef.current);
              canvas.renderAll();
            });
          },
          { crossOrigin: "anonymous" }
        );
      });
    },

    // ── clearBackgroundImage ──────────────────────────────────────────────────
    clearBackgroundImage(fallbackColor = "#FFFFFF") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setBackgroundImage(null, () => {});
      canvas.setBackgroundColor(fallbackColor, () => canvas.renderAll());
    },

    // ── addText ───────────────────────────────────────────────────────────────
    addText(text: string) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      import("fabric").then(({ fabric }) => {
        const t = new fabric.IText(text || "Teks Kamu", {
          left: canvas.width / 2,
          top: canvas.height * 0.85,
          originX: "center",
          originY: "center",
          fontSize: Math.round(canvas.width * 0.055),
          fontWeight: "bold",
          fontFamily: "Inter, sans-serif",
          fill: "#FFFFFF",
          shadow: "2px 2px 8px rgba(0,0,0,0.55)",
        });
        canvas.add(t);
        canvas.setActiveObject(t);
        canvas.renderAll();
      });
    },

    // ── clearProduct ──────────────────────────────────────────────────────────
    clearProduct() {
      const canvas = canvasRef.current;
      if (!canvas || !productRef.current) return;
      canvas.remove(productRef.current);
      productRef.current = null;
      canvas.renderAll();
    },

    // ── exportPNG ─────────────────────────────────────────────────────────────
    exportPNG() {
      const canvas = canvasRef.current;
      if (!canvas) return "";
      return canvas.toDataURL({ format: "png", multiplier: 2 }); // 2× for crisp quality
    },
  }));

  return <canvas ref={elRef} style={{ display: "block" }} />;
});

FabricCanvas.displayName = "FabricCanvas";
export default FabricCanvas;
