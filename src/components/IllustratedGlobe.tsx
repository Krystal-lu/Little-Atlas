import React, { useEffect, useRef, useState, useCallback } from 'react';
import { geoOrthographic, geoPath, geoGraticule, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
// @ts-ignore
import landTopology from 'world-atlas/land-110m.json';
import { Place } from '../types';
import { Sparkles, RotateCw, MapPin } from 'lucide-react';

interface IllustratedGlobeProps {
  places: Place[];
  selectedPlaceId?: string;
  temporaryPin?: { longitude: number; latitude: number; name: string } | null;
  onSelectPlace: (place: Place) => void;
  onPinCoordinates?: (coords: { longitude: number; latitude: number }) => void;
  className?: string;
}

// Convert land topojson to GeoJSON once
const landGeoJson = feature(landTopology as any, (landTopology as any).objects.land);
const graticuleGenerator = geoGraticule().step([30, 30]);
const graticuleGeoJson = graticuleGenerator();

export const IllustratedGlobe: React.FC<IllustratedGlobeProps> = ({
  places,
  selectedPlaceId,
  temporaryPin,
  onSelectPlace,
  onPinCoordinates,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Globe rotation state: [lambda (longitude rotation), phi (latitude tilt)]
  const firstValidPlace = places.find(
    (p) => typeof p.longitude === 'number' && typeof p.latitude === 'number'
  );
  const rotationRef = useRef<[number, number]>([
    firstValidPlace ? -firstValidPlace.longitude! : -135,
    firstValidPlace ? -firstValidPlace.latitude! : -20,
  ]);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; rot: [number, number] }>({ x: 0, y: 0, rot: [0, 0] });
  const isAutoSpinningRef = useRef(true);
  const animationFrameRef = useRef<number | null>(null);
  const focusAnimationRef = useRef<{
    startRot: [number, number];
    targetRot: [number, number];
    startTime: number;
    duration: number;
  } | null>(null);

  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // Smoothly center globe when selectedPlaceId changes
  useEffect(() => {
    if (!selectedPlaceId) return;
    const targetPlace = places.find((p) => p.id === selectedPlaceId);
    if (
      !targetPlace ||
      typeof targetPlace.longitude !== 'number' ||
      typeof targetPlace.latitude !== 'number'
    )
      return;

    const targetRot: [number, number] = [
      -targetPlace.longitude,
      Math.max(-50, Math.min(50, -targetPlace.latitude)),
    ];

    // Normalize longitude difference to take shortest path
    let currentLambda = rotationRef.current[0] % 360;
    let targetLambda = targetRot[0] % 360;
    let diff = targetLambda - currentLambda;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    focusAnimationRef.current = {
      startRot: [rotationRef.current[0], rotationRef.current[1]],
      targetRot: [rotationRef.current[0] + diff, targetRot[1]],
      startTime: performance.now(),
      duration: 1200,
    };
    isAutoSpinningRef.current = false;
  }, [selectedPlaceId, places]);

  // Center on temporary search pin if supplied
  useEffect(() => {
    if (
      !temporaryPin ||
      typeof temporaryPin.longitude !== 'number' ||
      typeof temporaryPin.latitude !== 'number'
    )
      return;

    const targetRot: [number, number] = [
      -temporaryPin.longitude,
      Math.max(-50, Math.min(50, -temporaryPin.latitude)),
    ];

    let currentLambda = rotationRef.current[0] % 360;
    let targetLambda = targetRot[0] % 360;
    let diff = targetLambda - currentLambda;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    focusAnimationRef.current = {
      startRot: [rotationRef.current[0], rotationRef.current[1]],
      targetRot: [rotationRef.current[0] + diff, targetRot[1]],
      startTime: performance.now(),
      duration: 1200,
    };
    isAutoSpinningRef.current = false;
  }, [temporaryPin]);


  // Render loop
  const renderGlobe = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Center & radius for large illustrated centerpiece
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.44;

    // Handle focus animation interpolation
    if (focusAnimationRef.current) {
      const now = performance.now();
      const { startRot, targetRot, startTime, duration } = focusAnimationRef.current;
      const progress = Math.min(1, (now - startTime) / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      rotationRef.current = [
        startRot[0] + (targetRot[0] - startRot[0]) * ease,
        startRot[1] + (targetRot[1] - startRot[1]) * ease,
      ];

      if (progress >= 1) {
        focusAnimationRef.current = null;
      }
    } else if (isAutoSpinningRef.current && autoRotate && !isDraggingRef.current) {
      // Serene, gentle auto-spin
      rotationRef.current[0] += 0.05;
    }

    // Configure orthographic projection
    const projection = geoOrthographic()
      .scale(radius)
      .translate([cx, cy])
      .rotate(rotationRef.current)
      .clipAngle(90);

    const path = geoPath(projection, ctx);

    // 1. Globe Ambient Shadow (paper depth)
    ctx.beginPath();
    ctx.ellipse(cx, cy + radius * 0.96, radius * 0.85, radius * 0.18, 0, 0, Math.PI * 2);
    const shadowGrad = ctx.createRadialGradient(
      cx,
      cy + radius * 0.96,
      radius * 0.1,
      cx,
      cy + radius * 0.96,
      radius * 0.85
    );
    shadowGrad.addColorStop(0, 'rgba(58, 48, 38, 0.16)');
    shadowGrad.addColorStop(0.5, 'rgba(58, 48, 38, 0.07)');
    shadowGrad.addColorStop(1, 'rgba(58, 48, 38, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.fill();

    // 2. Illustrated Decorative Stand / Brass Ring (subtle nostalgic atlas artifact)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 14, 0, Math.PI * 2);
    ctx.strokeStyle = '#D6C9B3';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Degree tick marks on outer ring
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg * Math.PI) / 180;
      const x1 = cx + Math.cos(rad) * (radius + 10);
      const y1 = cy + Math.sin(rad) * (radius + 10);
      const x2 = cx + Math.cos(rad) * (radius + 17);
      const y2 = cy + Math.sin(rad) * (radius + 17);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#C5B59E';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // 3. Globe Sphere — Muted Dusty Blue Ocean with watercolor depth
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    const oceanGrad = ctx.createRadialGradient(
      cx - radius * 0.35,
      cy - radius * 0.35,
      radius * 0.1,
      cx,
      cy,
      radius
    );
    oceanGrad.addColorStop(0, '#C2D4DF'); // Soft sunlit dusty blue
    oceanGrad.addColorStop(0.65, '#AFC4D1'); // Natural dusty blue ocean
    oceanGrad.addColorStop(1, '#97AFC0'); // Edge depth
    ctx.fillStyle = oceanGrad;
    ctx.fill();

    // Clip rendering to globe sphere
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // 4. Illustrated Graticules (gentle dashed latitude/longitude lines)
    ctx.beginPath();
    path(graticuleGeoJson);
    ctx.strokeStyle = 'rgba(235, 244, 250, 0.45)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Equator accent line
    const equatorGeoJson: any = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: Array.from({ length: 361 }, (_, i) => [i - 180, 0]),
      },
    };
    ctx.beginPath();
    path(equatorGeoJson);
    ctx.strokeStyle = 'rgba(235, 244, 250, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 5. Continents — Muted Olive / Sage with Dark Hand-drawn Style Outlines
    ctx.beginPath();
    path(landGeoJson);
    // Fill: muted olive/sage
    ctx.fillStyle = '#CAD5BE';
    ctx.fill();

    // Stroke: dark hand-drawn style outline (#36312B)
    ctx.strokeStyle = '#36312B';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // 6. Memory Trails: Dotted routes between sequential places
    if (places.length > 1) {
      for (let i = 0; i < places.length - 1; i++) {
        const p1 = places[i];
        const p2 = places[i + 1];

        // Great circle arc line
        const routeGeoJson: any = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [p1.longitude, p1.latitude],
              [p2.longitude, p2.latitude],
            ],
          },
        };

        ctx.beginPath();
        path(routeGeoJson);
        ctx.strokeStyle = '#B85D43';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 7. Spherical Vignette / Tactile Lighting Shadow
    const sphereVignette = ctx.createRadialGradient(
      cx - radius * 0.35,
      cy - radius * 0.35,
      radius * 0.4,
      cx,
      cy,
      radius
    );
    sphereVignette.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    sphereVignette.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    sphereVignette.addColorStop(1, 'rgba(40, 34, 28, 0.28)'); // Curvature vignette
    ctx.fillStyle = sphereVignette;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Exit clip

    // 8. Hand-drawn Globe Rim Outer Stroke
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#332D27';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Secondary delicate paper outline
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(92, 80, 68, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 9. Visited Memory Pins
    const centerLngLat: [number, number] = [-rotationRef.current[0], -rotationRef.current[1]];

    places.forEach((place) => {
      if (typeof place.longitude !== 'number' || typeof place.latitude !== 'number') return;

      // Check if point is on visible hemisphere (great circle distance < PI/2)
      const dist = geoDistance([place.longitude, place.latitude], centerLngLat);
      if (dist > Math.PI / 2) return; // Behind the globe

      const pt = projection([place.longitude, place.latitude]);
      if (!pt) return;
      const [px, py] = pt;

      const isSelected = place.id === selectedPlaceId;
      const isHovered = place.id === hoveredPlace?.id;

      // Outer glow / pulse ring for selected pin
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(194, 109, 83, 0.25)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(194, 109, 83, 0.4)';
        ctx.fill();
      }

      // Pin base shadow
      ctx.beginPath();
      ctx.ellipse(px, py + 2.5, 4.5, 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(38, 30, 22, 0.35)';
      ctx.fill();

      // Pin Body (Terracotta / Muted rust)
      const pinRadius = isSelected ? 7 : isHovered ? 6 : 5;
      ctx.beginPath();
      ctx.arc(px, py, pinRadius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#A84C32' : '#C26D53';
      ctx.fill();
      ctx.strokeStyle = '#FAF6EE';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Inner white star / core dot
      ctx.beginPath();
      ctx.arc(px, py, pinRadius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#FAF6EE';
      ctx.fill();

      // Editorial Memory Label (Shown when selected or hovered)
      if (isSelected || isHovered) {
        const labelText = place.name;
        ctx.font = '500 12px "Newsreader", Georgia, serif';
        const textMetrics = ctx.measureText(labelText);
        const paddingX = 8;
        const paddingY = 4;
        const boxW = textMetrics.width + paddingX * 2;
        const boxH = 22;
        const boxX = px - boxW / 2;
        const boxY = py - pinRadius - boxH - 6;

        // Label paper card
        ctx.save();
        ctx.shadowColor = 'rgba(40, 32, 24, 0.18)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;

        ctx.beginPath();
        // Rounded card
        const r = 6;
        ctx.moveTo(boxX + r, boxY);
        ctx.lineTo(boxX + boxW - r, boxY);
        ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r);
        ctx.lineTo(boxX + boxW, boxY + boxH - r);
        ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - r, boxY + boxH);
        // Small speech pointer down
        ctx.lineTo(px + 4, boxY + boxH);
        ctx.lineTo(px, boxY + boxH + 4);
        ctx.lineTo(px - 4, boxY + boxH);
        ctx.lineTo(boxX + r, boxY + boxH);
        ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - r);
        ctx.lineTo(boxX, boxY + r);
        ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
        ctx.closePath();

        ctx.fillStyle = '#FAF5EB';
        ctx.fill();
        ctx.strokeStyle = '#D8CCA8';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Text
        ctx.fillStyle = '#2C2723';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, px, boxY + boxH / 2);
      }
    });

    // 10. Temporary Search / Preview Pin (Disappears when search or preview closes)
    if (
      temporaryPin &&
      typeof temporaryPin.longitude === 'number' &&
      typeof temporaryPin.latitude === 'number'
    ) {
      const dist = geoDistance([temporaryPin.longitude, temporaryPin.latitude], centerLngLat);
      if (dist <= Math.PI / 2) {
        const pt = projection([temporaryPin.longitude, temporaryPin.latitude]);
        if (pt) {
          const [px, py] = pt;

          // Dashed concentric preview ring
          ctx.beginPath();
          ctx.arc(px, py, 11, 0, Math.PI * 2);
          ctx.strokeStyle = '#B45A42';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Center preview dot
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#B45A42';
          ctx.fill();
          ctx.strokeStyle = '#FAF6EE';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Preview floating label
          const labelText = `Preview: ${temporaryPin.name}`;
          ctx.font = 'italic 11px "Newsreader", Georgia, serif';
          const textMetrics = ctx.measureText(labelText);
          const boxW = textMetrics.width + 14;
          const boxH = 20;
          const boxX = px - boxW / 2;
          const boxY = py - 26;

          ctx.save();
          ctx.fillStyle = 'rgba(250, 246, 238, 0.95)';
          ctx.strokeStyle = '#C26D53';
          ctx.lineWidth = 1;
          ctx.beginPath();
          // Rounded rect
          const r = 4;
          ctx.moveTo(boxX + r, boxY);
          ctx.lineTo(boxX + boxW - r, boxY);
          ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r);
          ctx.lineTo(boxX + boxW, boxY + boxH - r);
          ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - r, boxY + boxH);
          ctx.lineTo(boxX + r, boxY + boxH);
          ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - r);
          ctx.lineTo(boxX, boxY + r);
          ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#7D3827';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, px, boxY + boxH / 2);
          ctx.restore();
        }
      }
    }

    ctx.restore();
  }, [places, selectedPlaceId, temporaryPin, hoveredPlace, autoRotate]);

  // RequestAnimationFrame animation loop
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!active) return;
      renderGlobe();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderGlobe]);

  // Mouse & Touch Drag Interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    isAutoSpinningRef.current = false;
    focusAnimationRef.current = null;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rot: [...rotationRef.current],
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const sensitivity = 0.35;

      const newLambda = dragStartRef.current.rot[0] + dx * sensitivity;
      const newPhi = Math.max(-65, Math.min(65, dragStartRef.current.rot[1] - dy * sensitivity));

      rotationRef.current = [newLambda, newPhi];
      return;
    }

    // Test for hovering over a memory pin
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.44;

    const projection = geoOrthographic()
      .scale(radius)
      .translate([cx, cy])
      .rotate(rotationRef.current)
      .clipAngle(90);

    const centerLngLat: [number, number] = [-rotationRef.current[0], -rotationRef.current[1]];

    let found: Place | null = null;
    for (const place of places) {
      if (typeof place.longitude !== 'number' || typeof place.latitude !== 'number') continue;
      const dist = geoDistance([place.longitude, place.latitude], centerLngLat);
      if (dist > Math.PI / 2) continue;

      const pt = projection([place.longitude, place.latitude]);
      if (!pt) continue;

      const [px, py] = pt;
      const hitDist = Math.hypot(px - x, py - y);
      if (hitDist <= 16) {
        found = place;
        break;
      }
    }

    setHoveredPlace(found);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Check if it was a quick click rather than a drag
    const dx = Math.abs(e.clientX - dragStartRef.current.x);
    const dy = Math.abs(e.clientY - dragStartRef.current.y);

    if (dx < 6 && dy < 6) {
      // Click detection on a memory pin
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const width = rect.width;
        const height = rect.height;
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) * 0.44;

        const projection = geoOrthographic()
          .scale(radius)
          .translate([cx, cy])
          .rotate(rotationRef.current)
          .clipAngle(90);

        const centerLngLat: [number, number] = [-rotationRef.current[0], -rotationRef.current[1]];

        let clickedPlace: Place | null = null;
        for (const place of places) {
          if (typeof place.longitude !== 'number' || typeof place.latitude !== 'number') continue;
          const dist = geoDistance([place.longitude, place.latitude], centerLngLat);
          if (dist > Math.PI / 2) continue;

          const pt = projection([place.longitude, place.latitude]);
          if (!pt) continue;

          const [px, py] = pt;
          const hitDist = Math.hypot(px - x, py - y);
          if (hitDist <= 18) {
            clickedPlace = place;
            onSelectPlace(place);
            break;
          }
        }

        // If no place was clicked, but user clicked onto the globe face
        if (!clickedPlace && onPinCoordinates) {
          const distFromCenter = Math.hypot(x - cx, y - cy);
          if (distFromCenter <= radius * 0.98) {
            const inverted = projection.invert?.([x, y]);
            if (inverted && !isNaN(inverted[0]) && !isNaN(inverted[1])) {
              onPinCoordinates({ longitude: inverted[0], latitude: inverted[1] });
            }
          }
        }
      }
    }

    // Resume auto-spin after 3 seconds of inactivity
    setTimeout(() => {
      if (!isDraggingRef.current && !focusAnimationRef.current) {
        isAutoSpinningRef.current = true;
      }
    }, 3000);
  };

  const toggleAutoSpin = () => {
    const next = !autoRotate;
    setAutoRotate(next);
    isAutoSpinningRef.current = next;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      {/* Hand-drawn Illustrated Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full h-full touch-none ${
          hoveredPlace ? 'cursor-pointer' : isDraggingRef.current ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      />

      {/* Discrete subtle controls */}
      <div className="absolute bottom-6 right-6 z-10 flex items-center space-x-2">
        <button
          onClick={toggleAutoSpin}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-serif transition-colors border shadow-xs ${
            autoRotate
              ? 'bg-[#EAE1D2] border-[#D6C7B2] text-[#42372C]'
              : 'bg-[#FAF6EE]/80 border-[#E2D8C5] text-[#7A6F62] hover:bg-[#FAF6EE]'
          }`}
          title={autoRotate ? 'Pause globe drift' : 'Start gentle drift'}
        >
          <RotateCw
            className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`}
            style={{ animationDuration: '8s' }}
          />
          <span className="hidden sm:inline">{autoRotate ? 'Drifting' : 'Paused'}</span>
        </button>
      </div>

      {/* Little Illustrated Compass Rose Accent */}
      <div className="absolute top-6 left-6 pointer-events-none opacity-40 hover:opacity-80 transition-opacity hidden md:block">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-serif font-bold text-[#8C7D6B] mb-0.5">N</span>
          <div className="w-6 h-6 border border-[#BFAFA0] rounded-full flex items-center justify-center">
            <div className="w-1 h-3 bg-[#A84C32] rounded-xs -mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
