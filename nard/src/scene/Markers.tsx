import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OFF, ownAt, type Player } from '../engine/rules';
import { useGame } from '../store/game';
import { CH, checkerRest, HALF_D, POINT_LEN, PW, pointSide, pointX, R, TRAY_L, TRAY_R } from './layout';

const GOLD = new THREE.Color('#ffd27a');

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 256, 0, 0);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.7, 'rgba(255,255,255,0.25)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c);
  return t;
}

function triangleGeometry() {
  // base at y=0, tip at y=POINT_LEN; uv.y follows the length for the gradient
  const s = new THREE.Shape();
  const hw = PW / 2 - 0.02;
  s.moveTo(-hw, 0);
  s.lineTo(0, POINT_LEN);
  s.lineTo(hw, 0);
  s.closePath();
  const g = new THREE.ShapeGeometry(s);
  const pos = g.attributes.position;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5, pos.getY(i) / POINT_LEN);
  return g;
}

function Marker({ to, owner, count, index }: { to: number; owner: Player; count: number; index: number }) {
  const ring = useRef<THREE.Mesh>(null!);
  const ghost = useRef<THREE.Mesh>(null!);
  const tri = useRef<THREE.Mesh>(null!);
  const triGeo = useMemo(triangleGeometry, []);
  const tex = useMemo(glowTexture, []);
  const born = useRef(-1);

  const spot = useMemo(() => checkerRest(owner, to, count), [owner, to, count]);
  const isOff = to === OFF;

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (born.current < 0) born.current = now;
    const appear = Math.min(1, (now - born.current - index * 0.04) / 0.22);
    const k = Math.max(0, appear);
    const pulse = 0.5 + 0.5 * Math.sin(now * 5 + index);
    if (ring.current) {
      ring.current.scale.setScalar((0.7 + 0.3 * k) * (1 + pulse * 0.08));
      (ring.current.material as THREE.MeshBasicMaterial).opacity = k * (0.65 + pulse * 0.35);
    }
    if (ghost.current) (ghost.current.material as THREE.MeshBasicMaterial).opacity = k * 0.16;
    if (tri.current) (tri.current.material as THREE.MeshBasicMaterial).opacity = k * (0.22 + pulse * 0.14);
  });

  if (isOff) {
    const z = owner === 0 ? HALF_D / 2 : -HALF_D / 2;
    return (
      <group>
        <mesh ref={tri} position={[(TRAY_L + TRAY_R) / 2, 0.13, z]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[TRAY_R - TRAY_L, HALF_D - 0.2]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh ref={ring} position={[spot.pos[0], 0.14, spot.pos[2]]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[R * 0.55, R * 0.72, 48]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    );
  }

  const side = to < 24 ? pointSide(to) : 1;
  return (
    <group>
      {to < 24 && (
        <mesh
          ref={tri}
          geometry={triGeo}
          position={[pointX(to), 0.006, side * HALF_D]}
          rotation={[-Math.PI / 2, 0, side > 0 ? 0 : Math.PI]}
        >
          <meshBasicMaterial
            color={GOLD}
            alphaMap={tex}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
      <mesh ref={ring} position={[spot.pos[0], spot.pos[1] - CH / 2 + 0.012, spot.pos[2]]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[R * 0.78, R * 0.98, 64]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ghost} position={[spot.pos[0], spot.pos[1] - CH / 2 + 0.014, spot.pos[2]]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[R * 0.78, 48]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Markers() {
  const dests = useGame((s) => s.dests);
  const pos = useGame((s) => s.pos);
  const turn = useGame((s) => s.turn);
  const busy = useGame((s) => s.busy);
  if (busy) return null;
  return (
    <group>
      {dests.map((d, i) => {
        const count = d.to === OFF ? pos.off[turn] : ownAt(pos, turn, d.to);
        return <Marker key={`${d.to}`} to={d.to} owner={turn} count={count} index={i} />;
      })}
    </group>
  );
}

