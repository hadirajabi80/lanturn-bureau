import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useGame, type DiceView } from '../store/game';
import { FACE_NORMALS, sampleThrow } from '../physics/dice';
import { sound } from '../audio/sound';
import type { BoardTheme } from '../textures/themes';
import { DIE, diceHalf } from './layout';
import { easeInOutCubic } from './motion';

const PIP_LAYOUT: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]],
};

function pipGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const spacing = DIE * 0.25;
  const r = DIE * 0.085;
  for (const [valStr, normal] of Object.entries(FACE_NORMALS)) {
    const val = Number(valStr);
    const n = normal.clone();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    for (const [u, v] of PIP_LAYOUT[val]) {
      // inlaid disc sitting on the flat part of the face
      const g = new THREE.CircleGeometry(r, 32);
      g.translate(u * spacing, v * spacing, DIE / 2 + 0.0012);
      g.applyQuaternion(q);
      parts.push(g);
    }
  }
  return mergeGeometries(parts)!;
}

interface DieAnim {
  settled: boolean;
  gatherFrom: { p: THREE.Vector3; q: THREE.Quaternion } | null;
  gatherStart: number;
  laneKey: string;
  impactIdx: number;
  startTime: number;
  goneAt: number;
  dim: number;
  yaw: number;
}

const lanePos = (dice: DiceView, i: number) => {
  const lane = dice.lanes[i];
  const h = diceHalf(lane);
  const same = dice.lanes.filter((l) => l === lane).length;
  const idx = dice.lanes.slice(0, i).filter((l) => l === lane).length;
  const off = same === 2 ? (idx === 0 ? -0.5 : 0.5) : 0;
  return new THREE.Vector3(h.cx + off, DIE / 2, 0);
};

function Die({ dice, index, theme, dimmed }: { dice: DiceView; index: number; theme: BoardTheme; dimmed: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);
  const skin = theme.dice[dice.skins[index]];
  const body = useMemo(() => new RoundedBoxGeometry(DIE, DIE, DIE, 5, DIE * 0.14), []);
  const pips = useMemo(pipGeometry, []);
  const bodyMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: skin.body,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        transmission: 0,
        sheen: 0.2,
      }),
    [skin.body],
  );
  const baseColor = useMemo(() => new THREE.Color(skin.body), [skin.body]);
  const dimColor = useMemo(() => new THREE.Color(skin.body).multiplyScalar(0.42), [skin.body]);
  const gold = new THREE.Color(skin.pip).getHSL({ h: 0, s: 0, l: 0 }).l > 0.5;
  const pipMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: skin.pip, roughness: gold ? 0.3 : 0.55, metalness: gold ? 0.85 : 0, polygonOffset: true, polygonOffsetFactor: -2 }),
    [skin.pip, gold],
  );

  const a = useRef<DieAnim>({
    settled: false,
    gatherFrom: null,
    gatherStart: 0,
    laneKey: '',
    impactIdx: 0,
    startTime: -1,
    goneAt: -1,
    dim: 0,
    yaw: (Math.random() - 0.5) * 0.35,
  });

  const restQuat = useMemo(() => {
    const align = new THREE.Quaternion().setFromUnitVectors(FACE_NORMALS[dice.values[index]], new THREE.Vector3(0, 1, 0));
    return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a.current.yaw).multiply(align);
  }, [dice.values, index]);

  useFrame((state, dt) => {
    const s = a.current;
    const g = group.current;
    const now = state.clock.elapsedTime;
    if (s.startTime < 0) {
      s.startTime = now;
      if (!dice.rec) {
        s.settled = true;
        g.position.copy(lanePos(dice, index));
        g.quaternion.copy(restQuat);
        s.laneKey = dice.lanes.join(',');
      }
    }
    const t = now - s.startTime;

    if (!s.settled && dice.rec) {
      const rec = dice.rec;
      const p = new THREE.Vector3();
      const q = new THREE.Quaternion();
      sampleThrow(rec, index, t, p, q);
      g.position.copy(p);
      g.quaternion.copy(q.multiply(rec.remap[index]));
      // fade/scale in during the first frames as they leave the hand
      inner.current.scale.setScalar(Math.min(1, 0.6 + t * 6));
      while (s.impactIdx < rec.impacts.length && rec.impacts[s.impactIdx].t <= t) {
        const imp = rec.impacts[s.impactIdx++];
        if (imp.die === index) sound.dice(0, imp.strength);
      }
      if (t >= rec.duration + 0.12) {
        s.settled = true;
        s.gatherFrom = { p: g.position.clone(), q: g.quaternion.clone() };
        s.gatherStart = now;
        s.laneKey = dice.lanes.join(',');
      }
    } else if (s.settled) {
      const key = dice.lanes.join(',');
      if (key !== s.laneKey) {
        s.laneKey = key;
        s.gatherFrom = { p: g.position.clone(), q: g.quaternion.clone() };
        s.gatherStart = now;
      }
      if (s.gatherFrom) {
        const target = lanePos(dice, index);
        const dist = s.gatherFrom.p.distanceTo(target);
        const dur = 0.38 + Math.min(0.4, dist * 0.04);
        const k = Math.min(1, (now - s.gatherStart) / dur);
        const e = easeInOutCubic(k);
        g.position.lerpVectors(s.gatherFrom.p, target, e);
        g.position.y += Math.sin(Math.PI * k) * Math.min(1.4, 0.15 + dist * 0.1);
        g.quaternion.slerpQuaternions(s.gatherFrom.q, restQuat, e);
        if (k >= 1) s.gatherFrom = null;
      }
    }

    // pick up at end of turn
    if (dice.gone) {
      if (s.goneAt < 0) s.goneAt = now;
      const k = Math.min(1, (now - s.goneAt) / 0.32);
      inner.current.scale.setScalar(1 - easeInOutCubic(k));
      inner.current.position.y = k * 0.8;
    }

    s.dim += ((dimmed ? 1 : 0) - s.dim) * (1 - Math.exp(-dt * 8));
    bodyMat.color.lerpColors(baseColor, dimColor, s.dim);
    pipMat.opacity = 1;
  });

  return (
    <group ref={group}>
      <group ref={inner}>
        <mesh geometry={body} material={bodyMat} castShadow receiveShadow />
        <mesh geometry={pips} material={pipMat} />
      </group>
    </group>
  );
}

export function Dice({ theme }: { theme: BoardTheme }) {
  const dice = useGame((s) => s.dice);
  const remaining = useGame((s) => s.remaining);
  const phase = useGame((s) => s.phase);
  if (!dice) return null;

  const dimmed = (i: number) => {
    if (phase === 'rolling' || phase === 'opening') return false;
    if (phase === 'done') return true;
    if (phase !== 'move') return false;
    const [a, b] = dice.values;
    if (a === b) return i === 1 ? remaining.length <= 2 : remaining.length === 0;
    return !remaining.includes(dice.values[i]);
  };

  return (
    <group key={dice.id}>
      {dice.values.map((_, i) => (
        <Die key={i} dice={dice} index={i} theme={theme} dimmed={dimmed(i)} />
      ))}
    </group>
  );
}
