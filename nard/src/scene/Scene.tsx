import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { Bloom, EffectComposer, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { useGame } from '../store/game';
import { THEMES } from '../textures/themes';
import { Board } from './Board';
import { CameraRig } from './CameraRig';
import { Checkers } from './Checkers';
import { Dice } from './Dice';
import { Effects } from './Effects';
import { Interaction } from './Interaction';
import { Markers } from './Markers';
import { BOARD_CX } from './layout';

function Lights({ high }: { high: boolean }) {
  const shadowSize = high ? 2048 : 1024;
  return (
    <>
      <hemisphereLight args={['#ffe9cf', '#2a1a10', 0.35]} />
      <directionalLight
        position={[BOARD_CX - 7, 16, 9]}
        intensity={2.3}
        color="#ffe3c2"
        castShadow
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
        shadow-radius={6}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-camera-near={1}
        shadow-camera-far={45}
      />
      {/* cool rim from behind to separate the pieces */}
      <directionalLight position={[BOARD_CX + 6, 7, -12]} intensity={0.55} color="#b9cbff" />
      {/* warm lamp pool over the board */}
      <spotLight
        position={[BOARD_CX, 18, 2]}
        angle={0.62}
        penumbra={0.9}
        intensity={140}
        decay={1.6}
        color="#ffd6a8"
      />
    </>
  );
}

function Studio() {
  // Procedural reflections for the lacquer and clearcoat — no HDR download.
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#1a120c']} />
      <Lightformer form="rect" intensity={2.2} color="#ffe6c8" position={[0, 9, 0]} rotation-x={Math.PI / 2} scale={[18, 10, 1]} />
      <Lightformer form="rect" intensity={1.4} color="#ffd2a0" position={[-12, 4, 4]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} />
      <Lightformer form="rect" intensity={0.9} color="#a8c0ff" position={[12, 4, -6]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} />
      <Lightformer form="ring" intensity={1.6} color="#fff0dc" position={[4, 6, 10]} scale={4} />
    </Environment>
  );
}

export function Scene() {
  const themeId = useGame((s) => s.settings.theme);
  const quality = useGame((s) => s.settings.quality);
  const theme = THEMES[themeId];
  const high = quality === 'high';
  const dpr = useMemo<[number, number]>(() => (high ? [1, 2] : [1, 1.25]), [high]);

  return (
    <Canvas
      shadows={{ type: THREE.PCFSoftShadowMap }}
      dpr={dpr}
      camera={{ fov: 34, near: 0.5, far: 200, position: [0, 30, 30] }}
      gl={{ antialias: !high, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      style={{ position: 'fixed', inset: 0, touchAction: 'none' }}
    >
      <color attach="background" args={[theme.background]} />
      <fog attach="fog" args={[theme.background, 34, 80]} />
      <Suspense fallback={null}>
        <Studio />
      </Suspense>
      <Lights high={high} />
      <Board theme={theme} />
      <Checkers theme={theme} />
      <Dice theme={theme} />
      <Markers />
      <Effects />
      <CameraRig />
      <Interaction />
      {high && (
        <EffectComposer multisampling={4}>
          <Bloom intensity={0.55} luminanceThreshold={0.82} luminanceSmoothing={0.2} mipmapBlur radius={0.7} />
          <Vignette offset={0.28} darkness={0.62} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <SMAA />
        </EffectComposer>
      )}
    </Canvas>
  );
}
