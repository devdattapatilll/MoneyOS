"use client";

import { useState } from "react";
import type { RefObject } from "react";
import { FileDown } from "lucide-react";

interface Props {
  targetRef: RefObject<HTMLElement>;
}

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function reportFileName() {
  return `money-os-report-${new Date().toISOString().slice(0, 10)}.pdf`;
}

export default function DownloadReportButton({ targetRef }: Props) {
  const [exporting, setExporting] = useState(false);

  async function handleDownload() {
    const target = targetRef.current;
    if (!target || exporting) return;

    setExporting(true);
    try {
      await document.fonts?.ready;
      await waitForPaint();

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4", compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      const reportWidth = Math.max(target.scrollWidth, 1180);
      const sections = Array.from(target.querySelectorAll<HTMLElement>("[data-report-section]")).filter((section) => {
        const rect = section.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      const captureTargets = sections.length > 0 ? sections : [target];
      const scale = Math.min(2, window.devicePixelRatio || 1.5);
      let cursorY = margin;
      let hasContent = false;

      const addPageIfNeeded = (height: number) => {
        if (hasContent && cursorY + height > pageHeight - margin) {
          pdf.addPage();
          cursorY = margin;
        }
      };

      const addCanvasToPdf = (canvas: HTMLCanvasElement) => {
        const imageWidth = contentWidth;
        const imageHeight = (canvas.height * imageWidth) / canvas.width;
        const gap = 14;

        if (imageHeight <= contentHeight) {
          addPageIfNeeded(imageHeight);
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, cursorY, imageWidth, imageHeight, undefined, "FAST");
          cursorY += imageHeight + gap;
          hasContent = true;
          return;
        }

        if (hasContent && cursorY > margin) {
          pdf.addPage();
          cursorY = margin;
        }

        const sliceCanvas = document.createElement("canvas");
        const sliceWidth = canvas.width;
        const sliceHeight = Math.floor((contentHeight * canvas.width) / imageWidth);
        let sourceY = 0;

        while (sourceY < canvas.height) {
          const currentSliceHeight = Math.min(sliceHeight, canvas.height - sourceY);
          sliceCanvas.width = sliceWidth;
          sliceCanvas.height = currentSliceHeight;
          const context = sliceCanvas.getContext("2d");
          if (!context) throw new Error("Could not prepare the PDF canvas.");

          context.fillStyle = "#0b0f19";
          context.fillRect(0, 0, sliceWidth, currentSliceHeight);
          context.drawImage(canvas, 0, sourceY, sliceWidth, currentSliceHeight, 0, 0, sliceWidth, currentSliceHeight);

          const slicePdfHeight = (currentSliceHeight * imageWidth) / sliceWidth;
          pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", margin, cursorY, imageWidth, slicePdfHeight, undefined, "FAST");
          hasContent = true;
          sourceY += currentSliceHeight;

          if (sourceY < canvas.height) {
            pdf.addPage();
            cursorY = margin;
          } else {
            cursorY += slicePdfHeight + gap;
          }
        }
      };

      for (const section of captureTargets) {
        const canvas = await html2canvas(section, {
          backgroundColor: "#0b0f19",
          logging: false,
          scale,
          useCORS: true,
          windowWidth: reportWidth,
          windowHeight: Math.max(target.scrollHeight, window.innerHeight),
          onclone: (documentClone) => {
            const report = documentClone.querySelector<HTMLElement>("[data-report-root]");
            if (report) {
              report.style.width = `${reportWidth}px`;
              report.style.maxWidth = "none";
              report.style.background = "#0b0f19";
            }

            documentClone.querySelectorAll<HTMLElement>("[data-report-root] .overflow-auto").forEach((element) => {
              element.style.overflow = "visible";
            });
          },
        });
        addCanvasToPdf(canvas);
      }

      pdf.save(reportFileName());
    } catch (error) {
      console.error(error);
      alert("The report could not be downloaded. Please let the dashboard finish loading and try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={exporting}
      className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FileDown className="h-4 w-4" />
      {exporting ? "Preparing PDF..." : "Download Report"}
    </button>
  );
}
