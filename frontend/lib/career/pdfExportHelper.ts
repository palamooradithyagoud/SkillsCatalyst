/**
 * PDF Export Helper for Resumes
 * Converts resume DOM content to a standard, high-resolution A4 PDF file using jsPDF and html2canvas-pro.
 * 
 * Guarantees:
 * 1. True PDF direct file download (NO browser print dialog / window.print()).
 * 2. Exact standard A4 dimensions (210mm x 297mm) regardless of desktop or mobile viewport.
 * 3. 100% CLICKABLE HYPERLINKS preserved in the PDF (LinkedIn, GitHub, LeetCode, CodeChef, HackerRank, Portfolio, Emails, Projects).
 * 4. Retina 2x clarity for razor-sharp typography and clean rule lines.
 * 5. Automatic multi-page handling if the resume content exceeds 1 page.
 */

export interface ExportResumePdfOptions {
  /** Target element ID to export. Defaults to 'resume-printable-document' */
  elementId?: string;
  /** Full name of the candidate for naming the downloaded file */
  fullName?: string;
  /** Optional custom file name (without .pdf extension) */
  customFileName?: string;
}

interface PdfLinkAnnotation {
  x: number;
  y: number;
  w: number;
  h: number;
  url: string;
}

export async function exportResumeAsPdf(options: ExportResumePdfOptions = {}): Promise<void> {
  const { elementId = "resume-printable-document", fullName, customFileName } = options;

  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("exportResumeAsPdf can only be executed in a browser environment.");
  }

  const sourceEl = document.getElementById(elementId);
  if (!sourceEl) {
    throw new Error(`Resume preview element with id "${elementId}" was not found.`);
  }

  // Generate a clean, filesystem-safe filename
  const baseName = customFileName
    ? customFileName.trim()
    : `${(fullName || "My").trim().replace(/[^a-zA-Z0-9_\-\s]/g, "").replace(/\s+/g, "_") || "My"}_Resume`;
  const fileName = `${baseName}.pdf`;

  // Standard A4 width in pixels at standard 96 DPI: 210mm * 96 / 25.4 ≈ 794px
  const CANONICAL_WIDTH = 794;

  // Wait for Google fonts and web fonts to finish rendering
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue even if font ready check rejects
    }
  }

  // Create an off-screen sandbox container attached to document.body
  // This guarantees identical A4 rendering geometry on BOTH mobile phones and desktop monitors!
  const sandbox = document.createElement("div");
  sandbox.id = "resume-pdf-export-sandbox";
  sandbox.style.position = "fixed";
  sandbox.style.top = "-99999px";
  sandbox.style.left = "0";
  sandbox.style.width = `${CANONICAL_WIDTH}px`;
  sandbox.style.minWidth = `${CANONICAL_WIDTH}px`;
  sandbox.style.maxWidth = `${CANONICAL_WIDTH}px`;
  sandbox.style.zIndex = "-99999";
  sandbox.style.backgroundColor = "#ffffff";
  sandbox.style.visibility = "visible";
  sandbox.style.display = "block";
  sandbox.style.overflow = "visible";
  sandbox.style.pointerEvents = "none";

  // Deep clone the resume document
  const clone = sourceEl.cloneNode(true) as HTMLElement;
  clone.id = "resume-printable-document-clone";
  clone.style.display = "block";
  clone.style.visibility = "visible";
  clone.style.width = `${CANONICAL_WIDTH}px`;
  clone.style.minWidth = `${CANONICAL_WIDTH}px`;
  clone.style.maxWidth = `${CANONICAL_WIDTH}px`;
  clone.style.boxSizing = "border-box";
  clone.style.backgroundColor = "#ffffff";
  clone.style.color = "#0f172a";
  clone.style.boxShadow = "none";
  clone.style.border = "none";
  clone.style.margin = "0";
  clone.style.padding = "32px 36px"; // Standard ~10mm margins on A4
  clone.style.transform = "none";

  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  try {
    // ──────────────────────────────────────────────────────────
    // 1. EXTRACT ALL CLICKABLE LINK ANNOTATIONS FROM THE RESUME
    // ──────────────────────────────────────────────────────────
    const linkAnnotations: PdfLinkAnnotation[] = [];
    const cloneRect = clone.getBoundingClientRect();
    const scaleMm = 210 / (clone.offsetWidth || CANONICAL_WIDTH);

    const anchorElements = Array.from(clone.querySelectorAll("a[href]"));

    anchorElements.forEach((anchor) => {
      let rawHref = anchor.getAttribute("href") || "";
      rawHref = rawHref.trim();
      if (!rawHref || rawHref === "#" || rawHref.startsWith("javascript:")) {
        return;
      }

      // Ensure proper protocol so PDF viewers open external browser correctly
      let finalUrl = rawHref;
      if (
        !/^https?:\/\//i.test(finalUrl) &&
        !/^mailto:/i.test(finalUrl) &&
        !/^tel:/i.test(finalUrl)
      ) {
        finalUrl = `https://${finalUrl}`;
      }

      const clientRects = anchor.getClientRects();
      if (clientRects && clientRects.length > 0) {
        for (let i = 0; i < clientRects.length; i++) {
          const rect = clientRects[i];
          if (rect.width <= 0 || rect.height <= 0) continue;

          const relX = rect.left - cloneRect.left;
          const relY = rect.top - cloneRect.top;

          linkAnnotations.push({
            x: Math.max(relX * scaleMm - 0.3, 0),
            y: Math.max(relY * scaleMm - 0.3, 0),
            w: Math.max(rect.width * scaleMm + 0.6, 3),
            h: Math.max(rect.height * scaleMm + 0.6, 3),
            url: finalUrl,
          });
        }
      } else {
        const rect = anchor.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const relX = rect.left - cloneRect.left;
          const relY = rect.top - cloneRect.top;

          linkAnnotations.push({
            x: Math.max(relX * scaleMm - 0.3, 0),
            y: Math.max(relY * scaleMm - 0.3, 0),
            w: Math.max(rect.width * scaleMm + 0.6, 3),
            h: Math.max(rect.height * scaleMm + 0.6, 3),
            url: finalUrl,
          });
        }
      }
    });

    // ──────────────────────────────────────────────────────────
    // 2. RENDER RETINA CANVAS
    // ──────────────────────────────────────────────────────────
    let imgData: string;
    let canvasWidth: number;
    let canvasHeight: number;

    try {
      const html2canvasPro = (await import("html2canvas-pro")).default;
      const canvas = await html2canvasPro(clone, {
        scale: 2, // 2x high-resolution retina rendering
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
        width: CANONICAL_WIDTH,
        windowWidth: CANONICAL_WIDTH,
      });

      imgData = canvas.toDataURL("image/jpeg", 0.98);
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
    } catch (primaryErr) {
      console.warn("html2canvas-pro failed, falling back to html-to-image:", primaryErr);
      const { toJpeg } = await import("html-to-image");

      const measuredHeight = Math.max(clone.scrollHeight, clone.offsetHeight, 1050);
      imgData = await toJpeg(clone, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: "#FFFFFF",
        cacheBust: true,
        width: CANONICAL_WIDTH,
        height: measuredHeight,
      });

      canvasWidth = CANONICAL_WIDTH * 2;
      canvasHeight = measuredHeight * 2;
    }

    // ──────────────────────────────────────────────────────────
    // 3. GENERATE A4 PDF WITH CLICKABLE ANNOTATIONS
    // ──────────────────────────────────────────────────────────
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const imgWidthMm = pageWidthMm;
    const imgHeightMm = (canvasHeight * pageWidthMm) / canvasWidth;

    let heightLeftMm = imgHeightMm;
    let positionMm = 0;

    // Page 1
    pdf.addImage(imgData, "JPEG", 0, positionMm, imgWidthMm, imgHeightMm, undefined, "FAST");
    heightLeftMm -= pageHeightMm;

    // Subsequent pages if resume content naturally extends beyond 1 A4 page
    while (heightLeftMm > 2.5) {
      positionMm -= pageHeightMm;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, positionMm, imgWidthMm, imgHeightMm, undefined, "FAST");
      heightLeftMm -= pageHeightMm;
    }

    // Overlay real clickable PDF link annotations onto the exact coordinates
    const totalPages = pdf.getNumberOfPages();
    linkAnnotations.forEach((link) => {
      // Determine which A4 page (1-indexed) this link falls on
      const targetPage = Math.floor(link.y / pageHeightMm) + 1;
      const targetY = link.y - ((targetPage - 1) * pageHeightMm);

      if (targetPage <= totalPages && targetY >= 0 && targetY < pageHeightMm) {
        pdf.setPage(targetPage);
        pdf.link(link.x, targetY, link.w, link.h, { url: link.url });
      }
    });

    // Direct download trigger (no print dialog!)
    pdf.save(fileName);
  } finally {
    // Always clean up sandbox element
    if (sandbox && sandbox.parentNode) {
      sandbox.parentNode.removeChild(sandbox);
    }
  }
}
