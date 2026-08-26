import React, { useEffect, useRef } from 'react';

interface Pickleball3DSphereProps {
  className?: string;
  size?: number;
}

export default function Pickleball3DSphere({ className = '', size = 72 }: Pickleball3DSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate 3D points evenly on a sphere (Fibonacci sphere algorithm)
    const numHoles = 24;
    const points: { x: number; y: number; z: number }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < numHoles; i++) {
      const y = 1 - (i / (numHoles - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      points.push({ x, y, z });
    }

    let rotX = 0.3;
    let rotY = 0;
    let rotZ = 0.15;
    let animId: number;

    const render = () => {
      // Smooth continuous multi-axis 3D rotation
      rotY += 0.018;
      rotX += 0.008;
      rotZ += 0.005;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      const dpr = window.devicePixelRatio || 1;
      const w = size;
      const h = size;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const r = (w / 2) - 4; // Sphere radius

      // 1. Draw outer sphere silhouette
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 2. Project and draw holes on the 3D surface
      for (const p of points) {
        // Rotate around Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;
        let y1 = p.y;

        // Rotate around X
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;
        let x2 = x1;

        // Rotate around Z
        let x3 = x2 * cosZ - y2 * sinZ;
        let y3 = x2 * sinZ + y2 * cosZ;
        let z3 = z2;

        // Only draw holes on the front hemisphere (facing camera)
        if (z3 > 0.02) {
          const screenX = cx + x3 * r;
          const screenY = cy + y3 * r;

          // Perspective scaling & oval foreshortening based on spherical curve
          const baseHoleRadius = 4.2;
          const zDepth = z3; // 0 to 1
          const holeRx = baseHoleRadius * (0.85 + zDepth * 0.35);
          const holeRy = baseHoleRadius * Math.max(0.2, zDepth);

          // Calculate rotation angle of the hole ellipse along sphere normal
          const angle = Math.atan2(y3, x3);

          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.rotate(angle);

          ctx.beginPath();
          ctx.ellipse(0, 0, holeRy, holeRx, 0, 0, Math.PI * 2);
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
          ctx.shadowBlur = 6;
          ctx.stroke();

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [size]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Ambient Radial Spotlight Aura */}
      <div className="absolute w-20 h-20 rounded-full bg-emerald-400/20 blur-[22px] pointer-events-none" />
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="relative z-10 pointer-events-none"
      />
    </div>
  );
}
