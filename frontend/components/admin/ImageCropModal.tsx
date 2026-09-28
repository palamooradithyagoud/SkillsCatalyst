"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Check,
  X,
  Sparkles,
  Move,
  Sliders,
} from "lucide-react";

export interface AspectRatioOption {
  id: string;
  label: string;
  ratio: number | null; // width / height, or null for free/original
}

export interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileName?: string;
  title?: string;
  description?: string;
  aspectOptions?: AspectRatioOption[];
  defaultAspectId?: string;
  onCropComplete: (croppedFile: File, previewUrl: string) => Promise<void> | void;
  onClose: () => void;
  onSkipCrop?: () => void;
}

const DEFAULT_ASPECT_OPTIONS: AspectRatioOption[] = [
  { id: "hero", label: "2.6:1 (Hero Banner)", ratio: 2.63 },
  { id: "16:9", label: "16:9 (Widescreen)", ratio: 16 / 9 },
  { id: "4:3", label: "4:3 (Standard)", ratio: 4 / 3 },
  { id: "1:1", label: "1:1 (Square)", ratio: 1 },
  { id: "free", label: "Original", ratio: null },
];

export default function ImageCropModal({
  isOpen,
  imageSrc,
  fileName = "cropped_image.jpg",
  title = "Adjust & Crop Image",
  description = "Drag to reposition, use the slider or scroll to zoom, and select your preferred framing.",
  aspectOptions = DEFAULT_ASPECT_OPTIONS,
  defaultAspectId,
  onCropComplete,
  onClose,
  onSkipCrop,
}: ImageCropModalProps) {
  const [selectedAspectId, setSelectedAspectId] = useState<string>(
    defaultAspectId || aspectOptions[0]?.id || "16:9"
  );
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Reset transforms whenever a new image or aspect is chosen
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      if (defaultAspectId) {
        setSelectedAspectId(defaultAspectId);
      }
    }
  }, [isOpen, imageSrc, defaultAspectId]);

  // Load natural dimensions of the image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [imageSrc]);

  if (!isOpen || !imageSrc) return null;

  // Selected aspect ratio
  const activeAspect = aspectOptions.find((a) => a.id === selectedAspectId) || aspectOptions[0];
  const aspectValue = activeAspect?.ratio ?? (imageSize ? imageSize.width / imageSize.height : 16 / 9);

  // Calculate crop box dimensions in pixels based on container (max 480w, 320h)
  const maxBoxW = 460;
  const maxBoxH = 260;
  let cropBoxW = maxBoxW;
  let cropBoxH = cropBoxW / aspectValue;

  if (cropBoxH > maxBoxH) {
    cropBoxH = maxBoxH;
    cropBoxW = cropBoxH * aspectValue;
  }

  // Base scale calculation to ensure image covers the crop frame at zoom = 1
  const naturalW = imageSize?.width || 800;
  const naturalH = imageSize?.height || 600;
  // If rotated 90 or 270, effective dimensions swap
  const isRotatedQuarter = rotation % 180 !== 0;
  const effW = isRotatedQuarter ? naturalH : naturalW;
  const effH = isRotatedQuarter ? naturalW : naturalH;

  const baseScale = Math.max(cropBoxW / effW, cropBoxH / effH);

  // Mouse / Touch handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Scroll wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.min(Math.max(0.6, Number((prev + delta).toFixed(2))), 3.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Apply Crop and generate File
  const handleApplyCrop = async () => {
    if (!imageRef.current || !imageSize) return;
    setProcessing(true);

    try {
      // Create high-res off-screen canvas (e.g. 1920 max edge for high quality)
      const targetMaxDim = 1920;
      let targetW = targetMaxDim;
      let targetH = Math.round(targetW / aspectValue);

      if (targetH > targetMaxDim) {
        targetH = targetMaxDim;
        targetW = Math.round(targetH * aspectValue);
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize 2D canvas context.");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Ratio between canvas resolution and UI crop box
      const canvasScale = targetW / cropBoxW;

      // 1. Move origin to canvas center
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // 2. Scale coordinate system to match UI
      ctx.scale(canvasScale, canvasScale);

      // 3. Apply user pan
      ctx.translate(pan.x, pan.y);

      // 4. Apply user rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // 5. Apply baseScale * zoom
      const totalScale = baseScale * zoom;
      ctx.scale(totalScale, totalScale);

      // 6. Draw original image centered
      ctx.drawImage(
        imageRef.current,
        -naturalW / 2,
        -naturalH / 2,
        naturalW,
        naturalH
      );

      // Convert canvas to blob
      const mimeType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), mimeType, 0.92);
      });

      if (!blob) throw new Error("Failed to generate cropped image file.");

      const cleanFileName = fileName.replace(/\.[^/.]+$/, "") + (mimeType === "image/png" ? "_cropped.png" : "_cropped.jpg");
      const croppedFile = new File([blob], cleanFileName, { type: mimeType });
      const previewUrl = URL.createObjectURL(blob);

      await onCropComplete(croppedFile, previewUrl);
      onClose();
    } catch (err) {
      console.error("Crop application failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5 hidden sm:block">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Crop Modal"
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Aspect Ratio Pill Switcher ── */}
        <div className="px-5 py-2.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-purple-400" />
            <span>Preset:</span>
          </span>
          {aspectOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setSelectedAspectId(opt.id);
                setPan({ x: 0, y: 0 });
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedAspectId === opt.id
                  ? "bg-purple-600 text-white shadow-xs shadow-purple-600/30"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ── Visual Crop Workspace Area ── */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative w-full h-[320px] sm:h-[360px] bg-slate-950 flex items-center justify-center overflow-hidden select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        >
          {/* ── Cropping Target Frame (Interactive Aperture) ── */}
          <div
            className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-purple-500/80 pointer-events-none ring-8 ring-black/60"
            style={{
              width: `${cropBoxW}px`,
              height: `${cropBoxH}px`,
            }}
          >
            {/* The Image Rendered with Transform */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop Source"
              crossOrigin="anonymous"
              draggable={false}
              className="absolute pointer-events-none max-w-none origin-center transition-transform duration-75 ease-out"
              style={{
                left: "50%",
                top: "50%",
                width: `${naturalW}px`,
                height: `${naturalH}px`,
                transform: `translate(-50%, -50%) translate3d(${pan.x}px, ${pan.y}px, 0) rotate(${rotation}deg) scale(${baseScale * zoom})`,
              }}
            />

            {/* Rule of Thirds Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>

            {/* Corner Crop Indicators */}
            <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-white pointer-events-none drop-shadow-sm" />
            <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-white pointer-events-none drop-shadow-sm" />
            <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-white pointer-events-none drop-shadow-sm" />
            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-white pointer-events-none drop-shadow-sm" />
          </div>

          {/* Drag hint overlay badge */}
          <div className="absolute bottom-2.5 left-3 pointer-events-none px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 font-medium flex items-center gap-1.5 shadow-sm">
            <Move className="w-3 h-3 text-purple-400" />
            <span>Click &amp; drag to reposition</span>
          </div>
        </div>

        {/* ── Fine-Tuning Controls Bar ── */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-4">
          {/* Zoom Slider */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[220px]">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(0.6, Number((prev - 0.1).toFixed(2))))}
              aria-label="Zoom Out"
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={0.6}
              max={3.5}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              aria-label="Image Zoom Level"
              className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-full cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3.5, Number((prev + 0.1).toFixed(2))))}
              aria-label="Zoom In"
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold text-purple-400 w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Rotate & Reset Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRotate}
              title="Rotate 90° Clockwise"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-purple-400" />
              <span>Rotate</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              title="Reset Zoom & Panning"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ── Modal Footer Actions ── */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            {onSkipCrop && (
              <button
                type="button"
                onClick={onSkipCrop}
                disabled={processing}
                className="text-xs text-slate-400 hover:text-purple-300 font-semibold underline underline-offset-4 cursor-pointer disabled:opacity-50"
              >
                Upload original without crop
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={processing}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-900/30 inline-flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Apply &amp; Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
