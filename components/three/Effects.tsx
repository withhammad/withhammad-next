"use client";

// Tier-gated post-processing.
//
// Bloom is SELECTIVE by construction rather than by config: the AI core shader
// pushes emissive above 1.0, and luminanceThreshold sits at 1, so only that
// material blooms. Nothing else in the scene glows by accident.
//
// Loaded through next/dynamic by the scenes, so the postprocessing bundle
// never enters a page that renders at tier 0/1.

import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import { useMemo } from "react";

export default function Effects({ heavy }: { heavy: boolean }) {
  const offset = useMemo(() => new Vector2(0.0006, 0.0004), []);
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.9}
        luminanceThreshold={1}
        luminanceSmoothing={0.25}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.28} darkness={0.72} />
      {heavy ? (
        <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.16} />
      ) : (
        <></>
      )}
      {heavy ? <ChromaticAberration offset={offset} /> : <></>}
    </EffectComposer>
  );
}
