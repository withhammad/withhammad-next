"use client";

// ---------------------------------------------------------------------------
// Interactive 3D agent-network constellation.
//
// Deliberately dependency-light: raw three + @react-three/fiber only (no drei),
// because this ships on a marketing page and every KB counts. Labels are sprite
// canvas textures rather than DOM overlays so nothing has to sync React state
// to the render loop.
//
// Perf + a11y guards:
//   - Lazy-loaded by the parent via next/dynamic (ssr: false).
//   - Render loop is parked ("never") whenever the canvas is off-screen.
//   - prefers-reduced-motion kills auto-rotation and the travelling pulses;
//     drag-to-explore still works, and the full node list stays in the DOM
//     below as real text, so nothing here is load-bearing for content.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { AISystem } from "@/lib/ai-systems";

// Warm = shipped, cool = still being built; two hues so status is readable
// without relying on the label alone.
const ACCENT = "#FF8C00";
const ACCENT_WARM = "#FFC24D";
const ACCENT_COOL = "#38BDF8";
const NODE_RADIUS = 3.4;

/** Even point distribution on a sphere — avoids the clumping of random polar angles. */
function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push(
      new THREE.Vector3(
        Math.cos(theta) * r * radius,
        y * radius * 0.72, // squash vertically so it reads as a disc-ish cloud
        Math.sin(theta) * r * radius,
      ),
    );
  }
  return points;
}

function makeLabelTexture(text: string, accent: string): THREE.CanvasTexture {
  const dpr = 2;
  const fontSize = 34;
  const padX = 18;
  const padY = 12;

  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  const textWidth = measure.measureText(text).width;

  const w = Math.ceil(textWidth + padX * 2);
  const h = Math.ceil(fontSize + padY * 2);

  const canvas = document.createElement("canvas");
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // pill background
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.arcTo(w, 0, w, r, r);
  ctx.lineTo(w, h - r);
  ctx.arcTo(w, h, w - r, h, r);
  ctx.lineTo(r, h);
  ctx.arcTo(0, h, 0, h - r, r);
  ctx.lineTo(0, r);
  ctx.arcTo(0, 0, r, 0, r);
  ctx.closePath();
  ctx.fillStyle = "rgba(10, 10, 11, 0.86)";
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = "#F5F5F7";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, w / 2, h / 2 + 1);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  // Stash the aspect so the sprite can be scaled without re-measuring.
  (tex as THREE.CanvasTexture & { aspect?: number }).aspect = w / h;
  return tex;
}

function AgentNode({
  system,
  position,
  isSelected,
  onSelect,
  reduced,
}: {
  system: AISystem;
  position: THREE.Vector3;
  isSelected: boolean;
  onSelect: (id: string) => void;
  reduced: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const accent = system.status === "production" ? ACCENT_WARM : ACCENT_COOL;
  const label = useMemo(
    () => makeLabelTexture(system.shortName, accent),
    [system.shortName, accent],
  );
  useEffect(() => () => label.dispose(), [label]);

  const labelAspect =
    (label as THREE.CanvasTexture & { aspect?: number }).aspect ?? 4;
  const labelHeight = 0.34;

  const active = hovered || isSelected;

  useFrame((state) => {
    const target = active ? 1.45 : 1;
    if (meshRef.current) {
      // Smoothed scale — reads as a spring without pulling in a physics lib.
      meshRef.current.scale.lerp(
        new THREE.Vector3(target, target, target),
        0.15,
      );
    }
    if (haloRef.current) {
      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      const base = active ? 0.28 : 0.1;
      const pulse = reduced
        ? base
        : base + Math.sin(state.clock.elapsedTime * 2 + position.x) * 0.04;
      mat.opacity += (pulse - mat.opacity) * 0.12;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(system.id);
        }}
      >
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={active ? 1.5 : 0.7}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>

      {/* Soft halo so nodes stay legible against the dark backdrop */}
      <mesh ref={haloRef} scale={2.6}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      <sprite position={[0, 0.72, 0]} scale={[labelHeight * labelAspect, labelHeight, 1]}>
        <spriteMaterial
          map={label}
          transparent
          depthTest={false}
          opacity={active ? 1 : 0.72}
        />
      </sprite>
    </group>
  );
}

/** Small dot that travels center → node, suggesting task dispatch. */
function Pulse({
  target,
  offset,
  color,
}: {
  target: THREE.Vector3;
  offset: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime * 0.45 + offset) % 1;
    ref.current.position.copy(target).multiplyScalar(t);
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    // Fade in at launch and out on arrival so the loop has no visible seam.
    mat.opacity = Math.sin(t * Math.PI) * 0.9;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function Scene({
  systems,
  selectedId,
  onSelect,
  reduced,
}: {
  systems: AISystem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  reduced: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  const positions = useMemo(
    () => fibonacciSphere(systems.length, NODE_RADIUS),
    [systems.length],
  );

  // Drag-to-rotate, tracked in refs so dragging never triggers a React render.
  const drag = useRef({ active: false, lastX: 0, lastY: 0, vx: 0, vy: 0 });
  const rotation = useRef({ x: -0.15, y: 0 });

  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      drag.current.active = true;
      drag.current.lastX = e.clientX;
      drag.current.lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.lastX;
      const dy = e.clientY - drag.current.lastY;
      drag.current.lastX = e.clientX;
      drag.current.lastY = e.clientY;
      drag.current.vx = dx * 0.005;
      drag.current.vy = dy * 0.005;
      rotation.current.y += drag.current.vx;
      rotation.current.x = THREE.MathUtils.clamp(
        rotation.current.x + drag.current.vy,
        -0.9,
        0.9,
      );
    };
    const up = (e: PointerEvent) => {
      drag.current.active = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  // Connection lines: one LineSegments for every center→node link.
  const lines = useMemo(() => {
    const verts: number[] = [];
    positions.forEach((p) => verts.push(0, 0, 0, p.x, p.y, p.z));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(ACCENT),
      transparent: true,
      opacity: 0.28,
    });
    return new THREE.LineSegments(geo, mat);
  }, [positions]);

  useEffect(() => {
    return () => {
      lines.geometry.dispose();
      (lines.material as THREE.Material).dispose();
    };
  }, [lines]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (!reduced && !drag.current.active) {
        rotation.current.y += delta * 0.12;
      }
      groupRef.current.rotation.y = rotation.current.y;
      groupRef.current.rotation.x = rotation.current.x;
    }
    if (coreRef.current && !reduced) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.04;
      coreRef.current.scale.setScalar(s);
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[6, 6, 6]} intensity={70} color={ACCENT} />
      <pointLight position={[-6, -3, 4]} intensity={45} color={ACCENT_WARM} />

      <group ref={groupRef}>
        <primitive object={lines} />

        {/* Orchestrator core */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.62, 1]} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={1.1}
            roughness={0.2}
            metalness={0.3}
            flatShading
          />
        </mesh>
        <mesh scale={1.9}>
          <icosahedronGeometry args={[0.62, 1]} />
          <meshBasicMaterial
            color={ACCENT}
            wireframe
            transparent
            opacity={0.18}
            depthWrite={false}
          />
        </mesh>

        {/* Outer shell for depth cueing */}
        <mesh>
          <icosahedronGeometry args={[NODE_RADIUS + 1.1, 1]} />
          <meshBasicMaterial
            color={ACCENT}
            wireframe
            transparent
            opacity={0.05}
            depthWrite={false}
          />
        </mesh>

        {!reduced &&
          positions.map((p, i) => (
            <Pulse
              key={`pulse-${i}`}
              target={p}
              offset={i / positions.length}
              color={systems[i].status === "production" ? ACCENT_WARM : ACCENT_COOL}
            />
          ))}

        {systems.map((s, i) => (
          <AgentNode
            key={s.id}
            system={s}
            position={positions[i]}
            isSelected={selectedId === s.id}
            onSelect={onSelect}
            reduced={reduced}
          />
        ))}
      </group>
    </>
  );
}

export default function AgentNetwork3D({
  systems,
  selectedId,
  onSelect,
}: {
  systems: AISystem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "160px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Clear any pointer-cursor override left behind on unmount.
  useEffect(() => () => { document.body.style.cursor = ""; }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-[420px] w-full touch-none sm:h-[520px]"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0.6, 9.2], fov: 45 }}
        dpr={[1, 1.75]}
        frameloop={inView ? "always" : "never"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Scene
          systems={systems}
          selectedId={selectedId}
          onSelect={onSelect}
          reduced={reduced}
        />
      </Canvas>

      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]/70">
        Drag to rotate · tap a node
      </p>
    </div>
  );
}
