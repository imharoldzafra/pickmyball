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
    const numHoles = 26;
    const points: { x: number; y: number; z: number }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < numHoles; i++) {
      const y = 1 - (i / (numHoles - 1)) * 2; // y from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      points.push({ x, y, z });
    }

    let rotX = 0.35;
    let rotY = 0;
    let rotZ = 0.2;
    let animId: number;

    const render = () => {
      // Smooth continuous multi-axis 3D rotation
      rotY += 0.016;
      rotX += 0.007;
      rotZ += 0.004;

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
      const r = (w / 2) - 2; // Sphere radius

      // Base Sphere with realistic optic lime/yellow gradient shading
      const lightX = cx - r * 0.35;
      const lightY = cy - r * 0.35;
      const sphereGrad = ctx.createRadialGradient(lightX, lightY, r * 0.1, cx, cy, r);
      sphereGrad.addColorStop(0, '#F5FB8B');    // Sunlight hot spot
      sphereGrad.addColorStop(0.35, '#DBEC38'); // Vibrant optic yellow-lime (tournament standard)
      sphereGrad.addColorStop(0.75, '#BFD423'); // Midtone court lime
      sphereGrad.addColorStop(1, '#819914');    // Soft spherical ambient shadow

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Subtle crisp rim outline
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(100, 120, 15, 0.25)';
      ctx.stroke();

      // 3. Project and draw realistic drilled pickleball holes
      for (const p of points) {
        // Rotate around Y
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        const y1 = p.y;

        // Rotate around X
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        const x2 = x1;

        // Rotate around Z
        const x3 = x2 * cosZ - y2 * sinZ;
        const y3 = x2 * sinZ + y2 * cosZ;
        const z3 = z2;

        // Only draw holes on the front hemisphere facing camera
        if (z3 > 0.04) {
          const screenX = cx + x3 * r;
          const screenY = cy + y3 * r;

          // Perspective foreshortening
          const baseHoleRadius = Math.max(2.2, r * 0.13);
          const zDepth = z3; // 0 to 1
          const holeRx = baseHoleRadius * (0.8 + zDepth * 0.3);
          const holeRy = baseHoleRadius * Math.max(0.22, zDepth);

          const angle = Math.atan2(y3, x3);

          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.rotate(angle);

          // Deep hole cavity
          ctx.beginPath();
          ctx.ellipse(0, 0, holeRy, holeRx, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(40, 52, 8, 0.85)';
          ctx.fill();

          // Hole rim edge bevel highlight
          ctx.lineWidth = 0.8;
          ctx.strokeStyle = 'rgba(245, 251, 140, 0.45)';
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
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="relative z-10 pointer-events-none"
      />
    </div>
  );
}
