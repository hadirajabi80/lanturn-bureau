// Short-lived visual effects fired by the director: hit shockwave + sparks, landing ripple, bear-off shimmer.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { fxBus, type FxEvent } from './fx';

const LIFE = { hit: 0.75, land: 0.4, bearoff: 0.7 } as const;

function sparkGeometry(n: number) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  return g;
}

function Fx({ ev, onDone }: { ev: FxEvent; onDone: (id: number) => void }) {
  const ring = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const pts = useRef<THREE.Points>(null!);
  const N = ev.type === 'hit' ? 26 : ev.type === 'bearoff' ? 18 : 0;
  const geo = useMemo(() => sparkGeometry(Math.max(1, N)), [N]);
  const seeds = useMemo(
    () =>
      Array.from({ length: N }, () => {
        const a = Math.random() * Math.PI * 2;
        const sp = 1.6 + Math.random() * 2.4;
        return { vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: 2 + Math.random() * 3.5 };
      }),
    [N],
  );
  const color = ev.type === 'hit' ? '#ffb35c' : '#ffe2a0';

  useFrame(() => {
    const t = (performance.now() - ev.at) / 1000;
    const life = LIFE[ev.type];
    if (t < 0) {
      ring.current.visible = false;
      if (ring2.current) ring2.current.visible = false;
      if (pts.current) pts.current.visible = false;
      return;
    }
    if (t > life) {
      onDone(ev.id);
      return;
    }
    const k = t / life;
    ring.current.visible = true;
    const maxR = ev.type === 'hit' ? 2.4 : ev.type === 'bearoff' ? 1.1 : 0.85;
    ring.current.scale.setScalar(0.4 + (1 - Math.pow(1 - k, 3)) * maxR);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - k) * (ev.type === 'land' ? 0.22 : 0.85);
    if (ring2.current) {
      ring2.current.visible = true;
      ring2.current.scale.setScalar(0.3 + (1 - Math.pow(1 - k, 2)) * maxR * 0.6);
      (ring2.current.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.5;
    }
    if (pts.current && N > 0) {
      pts.current.visible = true;
      const arr = geo.attributes.position.array as Float32Array;
      seeds.forEach((s, i) => {
        arr[i * 3] = s.vx * t;
        arr[i * 3 + 1] = Math.max(0, s.vy * t - 9 * t * t);
        arr[i * 3 + 2] = s.vz * t;
      });
      geo.attributes.position.needsUpdate = true;
      (pts.current.material as THREE.PointsMaterial).opacity = 1 - k;
    }
  });

  return (
    <group position={[ev.pos[0], ev.pos[1] - 0.1, ev.pos[2]]}>
      <mesh ref={ring} rotation-x={-Math.PI / 2} visible={false}>
        <ringGeometry args={[0.46, 0.52, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {ev.type === 'hit' && (
        <mesh ref={ring2} rotation-x={-Math.PI / 2} visible={false}>
          <ringGeometry args={[0.3, 0.5, 64]} />
          <meshBasicMaterial color="#fff1d0" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {N > 0 && (
        <points ref={pts} geometry={geo} visible={false}>
          <pointsMaterial
            color={color}
            size={0.09}
            sizeAttenuation
            transparent
            opacity={1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </points>
      )}
    </group>
  );
}

export function Effects() {
  const [events, setEvents] = useState<FxEvent[]>([]);
  useFrame(() => {
    if (fxBus.events.length) {
      const fresh = fxBus.events.splice(0);
      setEvents((e) => [...e, ...fresh]);
    }
  });
  const done = (id: number) => setEvents((e) => e.filter((x) => x.id !== id));
  return (
    <group>
      {events.map((ev) => (
        <Fx key={ev.id} ev={ev} onDone={done} />
      ))}
    </group>
  );
}
