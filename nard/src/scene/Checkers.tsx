import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGame } from '../store/game';
import type { Checker } from '../engine/checkers';
import type { BoardTheme, CheckerLook } from '../textures/themes';
import { CH, checkerRest, R } from './layout';
import { easeInOutCubic, easeOutCubic, motionBus, type MotionKind } from './motion';

function checkerGeometry() {
  const h = CH / 2;
  const b = 0.05;
  const pts: THREE.Vector2[] = [];
  pts.push(new THREE.Vector2(0, -h));
  pts.push(new THREE.Vector2(R - b, -h));
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R - b + Math.sin(a) * b, -h + b - Math.cos(a) * b));
  }
  pts.push(new THREE.Vector2(R, h - b));
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R - b + Math.cos(a) * b, h - b + Math.sin(a) * b));
  }
  // top face with a carved ring groove and a slightly raised center
  pts.push(new THREE.Vector2(R * 0.86, h));
  pts.push(new THREE.Vector2(R * 0.84, h - 0.02));
  pts.push(new THREE.Vector2(R * 0.79, h - 0.02));
  pts.push(new THREE.Vector2(R * 0.77, h));
  pts.push(new THREE.Vector2(R * 0.3, h + 0.006));
  pts.push(new THREE.Vector2(0, h + 0.008));
  const g = new THREE.LatheGeometry(pts, 72);
  g.computeVertexNormals();
  return g;
}

/** Engraved medallion texture for the checker face. */
function faceTexture(color: string) {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d')!;
  const cx = S / 2;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cx, 118, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cx, 106, 0, Math.PI * 2);
  ctx.stroke();
  // eight-pointed star (shamseh)
  ctx.lineWidth = 4;
  for (const off of [0, Math.PI / 4]) {
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = off + (i * Math.PI) / 2;
      const x = cx + Math.cos(a) * 70;
      const y = cx + Math.sin(a) * 70;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cx, 18, 0, Math.PI * 2);
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const GLOW = new THREE.Color('#ffc86a');

interface Anim {
  key: string;
  from: THREE.Vector3;
  to: THREE.Vector3;
  start: number;
  delay: number;
  dur: number;
  kind: MotionKind;
  active: boolean;
  edgeFrom: number;
  edgeTo: number;
  edge: number;
  dragging: boolean;
  landedAt: number;
  lift: number;
  glow: number;
  tiltAxis: THREE.Vector3;
  init: boolean;
}

function CheckerPiece({
  checker,
  look,
  geo,
  faceMap,
  movable,
  selected,
}: {
  checker: Checker;
  look: CheckerLook;
  geo: THREE.BufferGeometry;
  faceMap: THREE.Texture;
  movable: boolean;
  selected: boolean;
}) {
  const group = useRef<THREE.Group>(null!);
  const tilt = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: look.color,
        roughness: look.roughness,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        sheen: 0.35,
        sheenColor: new THREE.Color(look.sheen),
        sheenRoughness: 0.4,
        emissive: GLOW,
        emissiveIntensity: 0,
      }),
    [look],
  );
  const faceMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: faceMap,
        transparent: true,
        metalness: 0.9,
        roughness: 0.3,
        color: '#ffffff',
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    [faceMap],
  );
  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: GLOW,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  const a = useRef<Anim>({
    key: '',
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
    start: 0,
    delay: 0,
    dur: 0,
    kind: 'move',
    active: false,
    edgeFrom: 0,
    edgeTo: 0,
    edge: 0,
    dragging: false,
    landedAt: -10,
    lift: 0,
    glow: 0,
    tiltAxis: new THREE.Vector3(1, 0, 0),
    init: false,
  });

  useFrame((state, dt) => {
    const s = a.current;
    const g = group.current;
    const now = state.clock.elapsedTime;
    const rest = checkerRest(checker.owner, checker.loc, checker.slot);
    const key = `${checker.loc}:${checker.slot}`;
    const drag = motionBus.drag?.id === checker.id ? motionBus.drag : null;

    if (!s.init) {
      s.init = true;
      s.key = key;
      g.position.set(...rest.pos);
      s.edge = rest.onEdge ? 1 : 0;
    }

    if (drag) {
      // follow the pointer with a quick spring
      const k = 1 - Math.exp(-dt * 28);
      const prev = g.position.clone();
      g.position.x += (drag.pos[0] - g.position.x) * k;
      g.position.y += (drag.pos[1] - g.position.y) * k;
      g.position.z += (drag.pos[2] - g.position.z) * k;
      const v = g.position.clone().sub(prev);
      const lean = Math.min(0.35, v.length() * 6);
      if (v.lengthSq() > 1e-6) s.tiltAxis.set(v.z, 0, -v.x).normalize();
      tilt.current.quaternion.slerp(new THREE.Quaternion().setFromAxisAngle(s.tiltAxis, lean), 0.25);
      s.dragging = true;
      s.active = false;
    } else if (key !== s.key || s.dragging) {
      // start a flight from wherever we are now
      const hint = motionBus.hints.get(checker.id);
      motionBus.hints.delete(checker.id);
      s.key = key;
      s.from.copy(g.position);
      s.to.set(...rest.pos);
      s.kind = hint?.kind ?? (s.dragging ? 'drop' : 'move');
      s.dur = hint?.duration ?? (s.dragging ? 0.28 : 0.45);
      s.delay = hint?.delay ?? 0;
      s.start = now;
      s.edgeFrom = s.edge;
      s.edgeTo = rest.onEdge ? 1 : 0;
      s.active = true;
      s.dragging = false;
      const dir = s.to.clone().sub(s.from);
      dir.y = 0;
      if (dir.lengthSq() > 1e-6) s.tiltAxis.set(dir.z, 0, -dir.x).normalize();
    }

    if (s.active) {
      const t = (now - s.start - s.delay) / s.dur;
      if (t >= 1) {
        s.active = false;
        g.position.copy(s.to);
        s.edge = s.edgeTo;
        s.landedAt = now;
        tilt.current.quaternion.identity();
      } else if (t > 0) {
        const d = Math.hypot(s.to.x - s.from.x, s.to.z - s.from.z);
        const e = s.kind === 'drop' ? easeOutCubic(t) : easeInOutCubic(t);
        g.position.lerpVectors(s.from, s.to, e);
        const arcH =
          s.kind === 'drop' ? 0.12
          : s.kind === 'hit' ? Math.min(2.6, 1.0 + d * 0.16)
          : s.kind === 'reset' ? Math.min(2.4, 0.9 + d * 0.12)
          : Math.min(1.9, 0.45 + d * 0.11);
        // asymmetric arc: quick lift, gentle descent
        const tt = Math.pow(t, 0.85);
        g.position.y += arcH * Math.sin(Math.PI * tt);
        s.edge = s.edgeFrom + (s.edgeTo - s.edgeFrom) * easeInOutCubic(t);
        const lean = Math.sin(Math.PI * t) * (s.kind === 'hit' ? 0.9 : 0.28) * (s.kind === 'drop' ? 0.3 : 1);
        tilt.current.quaternion.setFromAxisAngle(s.tiltAxis, s.kind === 'hit' ? lean * 2.2 * t : lean);
      }
    } else if (!drag) {
      // landing settle: a tiny damped bob
      const since = now - s.landedAt;
      const target = new THREE.Vector3(...rest.pos);
      if (since < 0.25 && s.kind !== 'drop') {
        target.y += Math.sin(since * 38) * 0.03 * (1 - since / 0.25);
      }
      g.position.copy(target);
    }

    // selection lift and hover
    const hovered = motionBus.hover === checker.id;
    const liftTarget = selected ? 0.32 : hovered && movable ? 0.08 : 0;
    s.lift += (liftTarget - s.lift) * (1 - Math.exp(-dt * 14));
    tilt.current.position.y = s.lift;

    // edge rotation for the off tray
    tilt.current.rotation.x = 0;
    const edgeQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (Math.PI / 2) * s.edge * (checker.owner === 0 ? -1 : 1));
    (tilt.current.children[0] as THREE.Object3D).quaternion.copy(edgeQ);

    // glow
    const pulse = 0.5 + 0.5 * Math.sin(now * 4.2);
    const glowTarget = selected ? 0.55 : movable ? 0.12 + pulse * 0.16 : 0;
    s.glow += (glowTarget - s.glow) * (1 - Math.exp(-dt * 10));
    mat.emissiveIntensity = s.glow * (checker.owner === 1 ? 0.42 : 0.3);
    ringMat.opacity = selected ? 0.95 : movable ? 0.25 + pulse * 0.45 : 0;
    ring.current.visible = ringMat.opacity > 0.01;
    ring.current.scale.setScalar(selected ? 1 + pulse * 0.04 : 1);
  });

  return (
    <group ref={group}>
      <group ref={tilt}>
        <group>
          <mesh geometry={geo} material={mat} castShadow receiveShadow userData={{ checkerId: checker.id }} />
          <mesh position={[0, CH / 2 + 0.0095, 0]} rotation-x={-Math.PI / 2} material={faceMat}>
            <circleGeometry args={[R * 0.74, 48]} />
          </mesh>
          <mesh ref={ring} position={[0, 0, 0]} rotation-x={-Math.PI / 2} material={ringMat}>
            <ringGeometry args={[R * 1.02, R * 1.14, 64]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function Checkers({ theme }: { theme: BoardTheme }) {
  const checkers = useGame((s) => s.checkers);
  const legal = useGame((s) => s.legal);
  const selected = useGame((s) => s.selected);
  const turn = useGame((s) => s.turn);
  const busy = useGame((s) => s.busy);
  const phase = useGame((s) => s.phase);
  const geo = useMemo(checkerGeometry, []);
  const faceMaps = useMemo(
    () => [faceTexture(theme.checkers[0].rim), faceTexture(theme.checkers[1].rim)] as const,
    [theme],
  );

  // top checker of each movable stack
  const tops = useMemo(() => {
    const sources = new Set(phase === 'move' && !busy ? legal.map((m) => m.from) : []);
    const top = new Map<number, Checker>();
    for (const c of checkers) {
      if (c.owner !== turn || !sources.has(c.loc)) continue;
      const cur = top.get(c.loc);
      if (!cur || c.slot > cur.slot) top.set(c.loc, c);
    }
    return top;
  }, [checkers, legal, turn, busy, phase]);

  return (
    <group>
      {checkers.map((c) => {
        const top = tops.get(c.loc);
        const isTop = top?.id === c.id;
        return (
          <CheckerPiece
            key={c.id}
            checker={c}
            look={theme.checkers[c.owner]}
            geo={geo}
            faceMap={faceMaps[c.owner]}
            movable={isTop && selected !== c.loc}
            selected={isTop && selected === c.loc}
          />
        );
      })}
    </group>
  );
}
