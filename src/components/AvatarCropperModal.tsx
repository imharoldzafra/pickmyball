import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderOpen, Check } from 'lucide-react';

interface AvatarCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string | null;
  onCropComplete: (croppedDataUrl: string) => void;
  onChangePhoto: () => void;
}

export default function AvatarCropperModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  onChangePhoto,
}: AvatarCropperModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Touch Pinch, Twist & Pan ref
  const touchState = useRef({
    initialDistance: 0,
    initialAngle: 0,
    initialScale: 1,
    initialRotation: 0,
    isPinching: false,
    dragStart: { x: 0, y: 0 },
    isDragging: false,
  });

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const getTouchAngle = (t1: React.Touch, t2: React.Touch) => {
    return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
  };

  const handleScaleChange = (newScale: number) => {
    const prevScale = scale;
    setScale(newScale);

    setPosition((prev) => {
      if (newScale <= 1) {
        return { x: 0, y: 0 };
      }
      // When zooming out towards 1x, smoothly pull position back to center
      if (prevScale > 1) {
        const factor = (newScale - 1) / (prevScale - 1);
        const maxBound = (newScale - 1) * 140;
        const newX = Math.max(-maxBound, Math.min(maxBound, prev.x * factor));
        const newY = Math.max(-maxBound, Math.min(maxBound, prev.y * factor));
        return { x: newX, y: newY };
      }
      return prev;
    });
  };

  // 📱 Multi-Touch: 2-finger Pinch-to-Zoom & Twist-to-Rotate + 1-finger Pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const distance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const angle = getTouchAngle(t1, t2);
      
      touchState.current.initialDistance = distance;
      touchState.current.initialAngle = angle;
      touchState.current.initialScale = scale;
      touchState.current.initialRotation = rotation;
      touchState.current.isPinching = true;
      touchState.current.isDragging = false;
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      touchState.current.isDragging = true;
      touchState.current.isPinching = false;
      touchState.current.dragStart = {
        x: t.clientX - position.x,
        y: t.clientY - position.y,
      };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchState.current.isPinching) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const distance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const currentAngle = getTouchAngle(t1, t2);

      // 2-Finger Zoom
      if (touchState.current.initialDistance > 0) {
        const factor = distance / touchState.current.initialDistance;
        const newScale = Math.min(3.5, Math.max(0.8, touchState.current.initialScale * factor));
        handleScaleChange(newScale);
      }

      // 2-Finger Twist / Rotation
      const angleDiff = currentAngle - touchState.current.initialAngle;
      const newRotation = (touchState.current.initialRotation + angleDiff + 360) % 360;
      setRotation(Math.round(newRotation));
    } else if (e.touches.length === 1 && touchState.current.isDragging) {
      const t = e.touches[0];
      const newX = t.clientX - touchState.current.dragStart.x;
      const newY = t.clientY - touchState.current.dragStart.y;
      const maxBound = Math.max(30, (scale - 0.7) * 160);
      setPosition({
        x: Math.max(-maxBound, Math.min(maxBound, newX)),
        y: Math.max(-maxBound, Math.min(maxBound, newY)),
      });
    }
  };

  const handleTouchEnd = () => {
    touchState.current.isPinching = false;
    touchState.current.isDragging = false;
    setIsDragging(false);
  };

  // 🖱️ Pointer / Mouse Drag handlers for desktop
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || e.pointerType === 'touch') return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const maxBound = Math.max(30, (scale - 0.7) * 160);
    setPosition({
      x: Math.max(-maxBound, Math.min(maxBound, newX)),
      y: Math.max(-maxBound, Math.min(maxBound, newY)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Render crop to Canvas and Export
  const handleFinish = () => {
    if (!imageSrc) {
      onClose();
      return;
    }

    const canvas = document.createElement('canvas');
    const size = 320;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);

      // Save context
      ctx.save();

      // Translate to center
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      // Calculate translation offset based on frame size (260px in UI vs 320px on canvas)
      const ratio = size / 260;
      ctx.translate(position.x * ratio, position.y * ratio);

      // Draw image centered
      const imgAspect = img.width / img.height;
      let drawWidth = size;
      let drawHeight = size;

      if (imgAspect > 1) {
        drawWidth = size * imgAspect;
        drawHeight = size;
      } else {
        drawWidth = size;
        drawHeight = size / imgAspect;
      }

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      const finalDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      onCropComplete(finalDataUrl);
      onClose();
    };
    img.src = imageSrc;
  };

  return createPortal(
    <AnimatePresence>
      {/* Outer Fullscreen Backdrop */}
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-3 selection:bg-transparent">
        
        {/* Mobile Phone Mock Container */}
        <div className="w-full max-w-md h-full sm:h-[92vh] bg-[#05080c] flex flex-col justify-between select-none overflow-hidden sm:rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative">
          
          {/* Top Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-[#070b10] z-20 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Adjust Frame
            </h2>

            <div className="w-9" /> {/* Visual balance spacer */}
          </div>

          {/* 📷 Viewport Frame / Crop Stage */}
          <div 
            className="relative flex-1 bg-[#030609] flex items-center justify-center overflow-hidden touch-none cursor-grab active:cursor-grabbing"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Draggable & Scalable Image */}
            <motion.div
              animate={{
                x: position.x,
                y: position.y,
                scale: scale,
                rotate: rotation,
              }}
              transition={{
                type: 'spring',
                stiffness: isDragging ? 1000 : 300,
                damping: isDragging ? 100 : 25,
              }}
              className="absolute flex items-center justify-center pointer-events-none"
            >
              <img
                src={imageSrc}
                alt="Crop preview"
                className="max-w-[340px] max-h-[340px] object-contain pointer-events-none"
                draggable={false}
              />
            </motion.div>

            {/* 🔘 Circular Aperture Mask with Box-Shadow & Rule-of-Thirds Grid */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-[260px] h-[260px] rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.85)] border-2 border-emerald-400/90 flex items-center justify-center overflow-hidden">
                
                {/* Subtle outer neon ring glow */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_15px_rgba(16,185,129,0.3)] pointer-events-none" />

                {/* Instagram Rule-of-Thirds 3x3 Grid (Crisp Black Lines) */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Horizontal black lines */}
                  <div className="absolute top-1/3 left-0 right-0 h-[1.5px] bg-black/85 shadow-[0_0_1px_rgba(255,255,255,0.25)]" />
                  <div className="absolute top-2/3 left-0 right-0 h-[1.5px] bg-black/85 shadow-[0_0_1px_rgba(255,255,255,0.25)]" />
                  {/* Vertical black lines */}
                  <div className="absolute left-1/3 top-0 bottom-0 w-[1.5px] bg-black/85 shadow-[0_0_1px_rgba(255,255,255,0.25)]" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-[1.5px] bg-black/85 shadow-[0_0_1px_rgba(255,255,255,0.25)]" />
                </div>
              </div>
            </div>
          </div>

          {/* 🎛️ Bottom Control Bar */}
          <div className="bg-[#070b10] border-t border-white/10 p-4 sm:p-5 space-y-2.5 z-20 shrink-0">
            {/* Primary Finished Button */}
            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-[#050a0a] rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm active:scale-96 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-[#050a0a]" /> Finished
            </button>

            {/* Change Photo Option */}
            <button
              type="button"
              onClick={onChangePhoto}
              className="w-full py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all active:scale-96 flex items-center justify-center gap-2"
            >
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              <span>Choose Different Photo from Gallery</span>
            </button>
          </div>

        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
