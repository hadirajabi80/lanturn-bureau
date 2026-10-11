// Physically simulated dice throws.
//
// The result of a roll is decided first by a fair RNG. The throw is then simulated in a private
// Rapier world (walls, bar, floor and the checkers on the board as obstacles) and recorded frame
// by frame. Once the dice come to rest we know which body axis points up; the visible die mesh is
// rotated by one of the 24 cube symmetries so that face shows the drawn number. The result is a
// real physical tumble that always lands on the correct, fairly-drawn value.
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import type { Player } from '../engine/rules';
import {
  BAR_W, CH, DIE, diceHalf, FIELD_L, FIELD_R, HALF_D, R, RIM_H, type Vec3,
} from '../scene/layout';

let initPromise: Promise<void> | null = null;
export const initPhysics = () => (initPromise ??= RAPIER.init());

export const FACE_NORMALS: Record<number, THREE.Vector3> = {
  1: new THREE.Vector3(0, 1, 0),
  6: new THREE.Vector3(0, -1, 0),
  2: new THREE.Vector3(1, 0, 0),
  5: new THREE.Vector3(-1, 0, 0),
  3: new THREE.Vector3(0, 0, 1),
  4: new THREE.Vector3(0, 0, -1),
};

const STEP = 1 / 120;
const GRAVITY = 72;
const MAX_STEPS = 120 * 5;

export interface DieSpec {
  value: number;
  half: Player; // which half of the board it must land in (0 = right, 1 = left)
  from: Player; // which edge it is thrown from (0 = near/bottom, 1 = far/top)
}

export interface Impact {
  t: number;
  strength: number; // 0..1
  die: number;
}

export interface ThrowRecording {
  frames: number;
  dt: number;
  pos: Float32Array[]; // per die, frames * 3
  quat: Float32Array[]; // per die, frames * 4 (body orientation)
  remap: THREE.Quaternion[]; // per die: mesh = body * remap
  impacts: Impact[];
  duration: number; // seconds until settled
}

interface RunResult {
  rec: ThrowRecording;
  ok: boolean;
  score: number;
}

function runOnce(dice: DieSpec[], obstacles: Vec3[], rand: () => number): RunResult {
  const world = new RAPIER.World({ x: 0, y: -GRAVITY, z: 0 });
  world.timestep = STEP;

  const fixed = (hx: number, hy: number, hz: number, x: number, y: number, z: number, restitution = 0.32) => {
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(hx, hy, hz).setTranslation(x, y, z).setFriction(0.55).setRestitution(restitution),
    );
  };
  // floor
  fixed(30, 1, 30, 0, -1, 0, 0.28);
  // outer walls (rim plus tall invisible extension)
  const WALL_H = 6;
  fixed(1, WALL_H, HALF_D + 2, FIELD_L - 1, WALL_H, 0, 0.4);
  fixed(1, WALL_H, HALF_D + 2, FIELD_R + 1, WALL_H, 0, 0.4);
  fixed(20, WALL_H, 1, 0, WALL_H, -HALF_D - 1, 0.4);
  fixed(20, WALL_H, 1, 0, WALL_H, HALF_D + 1, 0.4);
  // the bar: a real raised block
  fixed(BAR_W / 2, RIM_H / 2, HALF_D, 0, RIM_H / 2, 0, 0.35);
  // checkers
  for (const o of obstacles) {
    world.createCollider(
      RAPIER.ColliderDesc.cylinder(CH / 2, R).setTranslation(o[0], o[1], o[2]).setFriction(0.5).setRestitution(0.25),
    );
  }

  const half = DIE / 2;
  const round = 0.085;
  const bodies: RAPIER.RigidBody[] = [];
  const n = dice.length;
  dice.forEach((d, i) => {
    const h = diceHalf(d.half);
    const dirZ = d.from === 0 ? -1 : 1;
    const spread = n === 2 && dice[0].half === dice[1].half ? (i === 0 ? -0.55 : 0.55) : 0;
    const x = h.cx + spread + (rand() - 0.5) * 2.2;
    const z = -dirZ * (HALF_D - 0.9 - rand() * 0.6);
    const y = 1.6 + rand() * 0.8 + i * 0.15;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * 6.28, rand() * 6.28, rand() * 6.28));
    const speed = 7.5 + rand() * 3.5;
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(x, y, z)
        .setRotation({ x: q.x, y: q.y, z: q.z, w: q.w })
        .setLinvel((h.cx - x) * (0.6 + rand() * 0.8) + (rand() - 0.5) * 2.5, -1 - rand() * 2, dirZ * speed)
        .setAngvel({ x: (rand() - 0.5) * 50, y: (rand() - 0.5) * 30, z: (rand() - 0.5) * 50 })
        .setLinearDamping(0.12)
        .setAngularDamping(0.35)
        .setCcdEnabled(true)
        .setCanSleep(true),
    );
    world.createCollider(
      RAPIER.ColliderDesc.roundCuboid(half - round, half - round, half - round, round)
        .setDensity(1.2)
        .setFriction(0.42)
        .setRestitution(0.38),
      body,
    );
    bodies.push(body);
  });

  const posArr = dice.map(() => new Float32Array(MAX_STEPS * 3));
  const quatArr = dice.map(() => new Float32Array(MAX_STEPS * 4));
  const prevV = dice.map(() => new THREE.Vector3());
  const lastImpact = dice.map(() => -1);
  const impacts: Impact[] = [];
  let calm = 0;
  let frames = 0;

  for (let s = 0; s < MAX_STEPS; s++) {
    world.step();
    let moving = false;
    bodies.forEach((b, i) => {
      const t = b.translation();
      const r = b.rotation();
      posArr[i].set([t.x, t.y, t.z], s * 3);
      quatArr[i].set([r.x, r.y, r.z, r.w], s * 4);
      const v = b.linvel();
      const w = b.angvel();
      const cur = new THREE.Vector3(v.x, v.y, v.z);
      if (s > 0) {
        const expected = prevV[i].clone().add(new THREE.Vector3(0, -GRAVITY * STEP, 0));
        const dv = cur.distanceTo(expected);
        const time = s * STEP;
        if (dv > 1.6 && time - lastImpact[i] > 0.045) {
          impacts.push({ t: time, strength: Math.min(1, dv / 14), die: i });
          lastImpact[i] = time;
        }
      }
      prevV[i].copy(cur);
      const speed = Math.hypot(v.x, v.y, v.z) + Math.hypot(w.x, w.y, w.z) * 0.3;
      if (!b.isSleeping() && speed > 0.04) moving = true;
    });
    frames = s + 1;
    calm = moving ? 0 : calm + 1;
    if (calm > 18) break;
  }

  // Validate final resting state.
  let ok = calm > 18;
  let score = 0;
  const up = new THREE.Vector3(0, 1, 0);
  const remap: THREE.Quaternion[] = [];
  const finals: THREE.Vector3[] = [];
  bodies.forEach((b, i) => {
    const r = b.rotation();
    const t = b.translation();
    const q = new THREE.Quaternion(r.x, r.y, r.z, r.w);
    const inv = q.clone().invert();
    const localUp = up.clone().applyQuaternion(inv);
    // nearest axis
    const ax = Math.abs(localUp.x);
    const ay = Math.abs(localUp.y);
    const az = Math.abs(localUp.z);
    const m = Math.max(ax, ay, az);
    const axis =
      m === ax ? new THREE.Vector3(Math.sign(localUp.x), 0, 0)
      : m === ay ? new THREE.Vector3(0, Math.sign(localUp.y), 0)
      : new THREE.Vector3(0, 0, Math.sign(localUp.z));
    if (m < 0.996) ok = false; // cocked
    const h = diceHalf(dice[i].half);
    if (t.x < h.xMin + half * 0.9 || t.x > h.xMax - half * 0.9) ok = false;
    if (Math.abs(t.z) > HALF_D - half * 0.9) ok = false;
    if (t.y > half + CH * 2.2) ok = false; // perched high on a stack or another die
    score += t.y; // prefer dice resting on the felt
    finals.push(new THREE.Vector3(t.x, t.y, t.z));
    remap.push(new THREE.Quaternion().setFromUnitVectors(FACE_NORMALS[dice[i].value], axis));
  });
  if (finals.length === 2 && finals[0].distanceTo(finals[1]) < DIE * 0.9) ok = false;

  world.free();
  return {
    ok,
    score,
    rec: {
      frames,
      dt: STEP,
      pos: posArr.map((a) => a.slice(0, frames * 3)),
      quat: quatArr.map((a) => a.slice(0, frames * 4)),
      remap,
      impacts,
      duration: frames * STEP,
    },
  };
}

/** Simulates throws until one lands cleanly. Cheap: a single attempt takes a few milliseconds. */
export function simulateThrow(dice: DieSpec[], obstacles: Vec3[]): ThrowRecording {
  const seedRand = () => Math.random();
  let best: RunResult | null = null;
  for (let attempt = 0; attempt < 40; attempt++) {
    const res = runOnce(dice, obstacles, seedRand);
    if (res.ok) {
      if (!best || !best.ok || res.score < best.score - 0.05) best = res;
      // Prefer dice on the felt, but any clean landing is fine after a few tries.
      if (res.score <= dice.length * (DIE / 2 + 0.02) || attempt > 6) return res.rec;
    } else if (!best) {
      best = res;
    }
  }
  return best!.rec;
}

/** Interpolated body transform at time t (seconds) for die i. */
export function sampleThrow(rec: ThrowRecording, i: number, t: number, outPos: THREE.Vector3, outQuat: THREE.Quaternion) {
  const f = Math.min(rec.frames - 1, Math.max(0, t / rec.dt));
  const a = Math.floor(f);
  const b = Math.min(rec.frames - 1, a + 1);
  const k = f - a;
  const P = rec.pos[i];
  const Q = rec.quat[i];
  outPos.set(
    P[a * 3] + (P[b * 3] - P[a * 3]) * k,
    P[a * 3 + 1] + (P[b * 3 + 1] - P[a * 3 + 1]) * k,
    P[a * 3 + 2] + (P[b * 3 + 2] - P[a * 3 + 2]) * k,
  );
  const qa = new THREE.Quaternion(Q[a * 4], Q[a * 4 + 1], Q[a * 4 + 2], Q[a * 4 + 3]);
  const qb = new THREE.Quaternion(Q[b * 4], Q[b * 4 + 1], Q[b * 4 + 2], Q[b * 4 + 3]);
  outQuat.copy(qa).slerp(qb, k);
}
