"use client";

// ---------------------------------------------------------------------------
// Ambient 3D "neural field" — the shared visual language for the AI-forward
// redesign. Used full-bleed behind the hero and (at lower density) as a section
// backdrop elsewhere.
//
// Built for cheapness, because this sits behind the LCP element:
//   - Particles are one THREE.Points draw call; links are one LineSegments.
//   - Neighbour links are computed ONCE at init, not per frame (the naive
//     per-frame O(n²) version is what makes these effects janky).
//   - Density scales down on small viewports; render loop parks off-screen.
//   - prefers-reduced-motion freezes drift/parallax and renders a single frame.
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const INDIGO = new THREE.Color("#6366F1");
const AMBER = new THREE.Color("#F59E0B");

function Field({
  count,
  reduced,
  interactive,
}: {
  count: number;
  reduced: boolean;
  interactive: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { size } = useThree();
  const pointer = useRef({ x: 0, y: 0 });

  // Particle cloud + the static link set between near neighbours.
  const { points, links, basePositions, drift } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const drift = new Float32Array(count * 3);
    const verts: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      // Shell-biased distribution: hollow-ish centre reads better behind text.
      const r = 3.2 + Math.pow(Math.random(), 0.6) * 3.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      const z = r * Math.cos(phi);
      pos.set([x, y, z], i * 3);
      verts.push(new THREE.Vector3(x, y, z));

      // A minority of amber nodes keeps the brand accent present.
      const c = Math.random() > 0.86 ? AMBER : INDIGO;
      col.set([c.r, c.g, c.b], i * 3);

      drift.set(
        [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0.3 + Math.random() * 0.7],
        i * 3,
      );
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // One-shot neighbour pass, capped so dense viewports can't explode.
    const MAX_LINKS = 420;
    const THRESHOLD = 1.35;
    const lineVerts: number[] = [];
    outer: for (let i = 0; i < verts.length; i++) {
      for (let j = i + 1; j < verts.length; j++) {
        if (verts[i].distanceTo(verts[j]) < THRESHOLD) {
          lineVerts.push(
            verts[i].x, verts[i].y, verts[i].z,
            verts[j].x, verts[j].y, verts[j].z,
          );
          if (lineVerts.length / 6 >= MAX_LINKS) break outer;
        }
      }
    }
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.Float32BufferAttribute(lineVerts, 3));
    const lMat = new THREE.LineBasicMaterial({
      color: INDIGO,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    });

    return {
      points: new THREE.Points(pGeo, pMat),
      links: new THREE.LineSegments(lGeo, lMat),
      basePositions: pos.slice(),
      drift,
    };
  }, [count]);

  useEffect(() => {
    return () => {
      points.geometry.dispose();
      (points.material as THREE.Material).dispose();
      links.geometry.dispose();
      (links.material as THREE.Material).dispose();
    };
  }, [points, links]);

  useEffect(() => {
    if (!interactive || reduced) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive, reduced]);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    if (reduced) {
      g.rotation.set(0.1, 0.35, 0);
      return;
    }

    g.rotation.y += delta * 0.045;
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      0.08 + pointer.current.y * 0.12,
      0.04,
    );
    g.position.x = THREE.MathUtils.lerp(g.position.x, pointer.current.x * -0.5, 0.04);

    // Gentle per-particle breathing so the cloud never looks like a static mesh.
    const geo = pointsRef.current?.geometry;
    if (geo) {
      const arr = geo.attributes.position.array as Float32Array;
      const t = state.clock.elapsedTime;
      for (let i = 0; i < arr.length; i += 3) {
        const speed = drift[i + 2];
        arr[i + 1] =
          basePositions[i + 1] + Math.sin(t * speed * 0.5 + drift[i]) * 0.09;
      }
      geo.attributes.position.needsUpdate = true;
    }
  });

  const coreScale = size.width < 640 ? 0.75 : 1;

  return (
    <group ref={groupRef}>
      <primitive object={links} />
      <primitive object={points} ref={pointsRef} />

      {/* Orchestrator core — the same motif as the /work agent network */}
      <mesh scale={coreScale}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial
          color={INDIGO}
          wireframe
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={coreScale * 0.45}>
        <icosahedronGeometry args={[1.15, 0]} />
        <meshBasicMaterial
          color={INDIGO}
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function NeuralField({
  density = 1,
  interactive = true,
  className = "",
}: {
  /** Multiplier on the particle count. 1 = hero, ~0.5 = section backdrop. */
  density?: number;
  interactive?: boolean;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Particle budget by viewport — phones get roughly a third of desktop.
  useEffect(() => {
    const w = window.innerWidth;
    const base = w < 640 ? 260 : w < 1024 ? 480 : 760;
    setCount(Math.round(base * density));
  }, [density]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!count) return <div ref={wrapRef} className={className} aria-hidden />;

  return (
    <div ref={wrapRef} className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 11], fov: 50 }}
        dpr={[1, 1.6]}
        frameloop={inView ? "always" : "never"}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <Field count={count} reduced={reduced} interactive={interactive} />
      </Canvas>
    </div>
  );
}
