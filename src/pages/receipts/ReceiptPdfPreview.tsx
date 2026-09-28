import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface ReceiptPdfPreviewProps {
  pdfUrl: string;
}

export function ReceiptPdfPreview({
  pdfUrl,
}: ReceiptPdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let pdfDocument: pdfjsLib.PDFDocumentProxy | null = null;

    async function renderPdf() {
      if (!pdfUrl || !canvasRef.current) {
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const response = await fetch(pdfUrl);
        const buffer = await response.arrayBuffer();

        if (cancelled) {
          return;
        }

        pdfDocument = await pdfjsLib.getDocument({
          data: buffer,
        }).promise;

        const page = await pdfDocument.getPage(1);

        if (cancelled) {
          return;
        }

        const containerWidth =
          containerRef.current?.clientWidth || 800;

        const baseViewport = page.getViewport({
          scale: 1,
        });

        const horizontalPadding = 32;

        const scale =
          (containerWidth - horizontalPadding) /
          baseViewport.width;

        const viewport = page.getViewport({
          scale: Math.max(scale, 0.5),
        });

        const canvas = canvasRef.current;

        if (!canvas) {
          return;
        }

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error(
            "Unable to create PDF preview canvas.",
          );
        }

        const deviceScale =
          window.devicePixelRatio || 1;

        canvas.width =
          Math.floor(viewport.width * deviceScale);

        canvas.height =
          Math.floor(viewport.height * deviceScale);

        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.setTransform(
          deviceScale,
          0,
          0,
          deviceScale,
          0,
          0,
        );

        context.clearRect(
          0,
          0,
          viewport.width,
          viewport.height,
        );

        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;

        if (!cancelled) {
          setLoading(false);
        }
      } catch (renderError) {
        console.error(
          "PDF preview rendering failed:",
          renderError,
        );

        if (!cancelled) {
          setLoading(false);
          setError(true);
        }
      }
    }

    renderPdf();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-[500px] w-full justify-center overflow-auto bg-white p-4 sm:p-6"
    >
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            <p className="text-sm font-medium text-slate-500">
              Loading receipt preview...
            </p>
          </div>
        </div>
      )}

      {error ? (
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-semibold text-red-600">
              Unable to preview receipt.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Please use Download PDF to open the receipt.
            </p>
          </div>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="block h-auto max-w-full rounded-sm bg-white shadow-lg"
        />
      )}
    </div>
  );
}