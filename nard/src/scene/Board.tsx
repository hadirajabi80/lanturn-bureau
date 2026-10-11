import { useMemo } from 'react';
import * as THREE from 'three';
import { themeTextures } from '../textures/generate';
import type { BoardTheme } from '../textures/themes';
import {
  BAR_W, FIELD_L, FIELD_R, FRAME_W, HALF_D, HW, OUTER_D, OUTER_L, OUTER_R, RIM_H, TRAY_FLOOR, TRAY_L, TRAY_R,
} from './layout';

const BASE = 0.45; // frame depth below the field surface
const BEVEL = 0.07;

function roundedRect(x0: number, y0: number, x1: number, y1: number, r: number, path: THREE.Shape | THREE.Path) {
  path.moveTo(x0 + r, y0);
  path.lineTo(x1 - r, y0);
  path.quadraticCurveTo(x1, y0, x1, y0 + r);
  path.lineTo(x1, y1 - r);
  path.quadraticCurveTo(x1, y1, x1 - r, y1);
  path.lineTo(x0 + r, y1);
  path.quadraticCurveTo(x0, y1, x0, y1 - r);
  path.lineTo(x0, y0 + r);
  path.quadraticCurveTo(x0, y0, x0 + r, y0);
  return path;
}

function useFrameGeometry() {
  return useMemo(() => {
    const shape = roundedRect(OUTER_L, -OUTER_D, OUTER_R, OUTER_D, 0.42, new THREE.Shape()) as THREE.Shape;
    const hole = (x0: number, x1: number) => {
      const p = new THREE.Path();
      roundedRect(x0 - BEVEL, -HALF_D - BEVEL, x1 + BEVEL, HALF_D + BEVEL, 0.05, p);
      shape.holes.push(p);
    };
    hole(FIELD_L, -BAR_W / 2);
    hole(BAR_W / 2, FIELD_R);
    hole(TRAY_L, TRAY_R);
    const depth = RIM_H + BASE - BEVEL * 2;
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 4,
      curveSegments: 10,
    });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, -BASE + BEVEL, 0);
    // UVs: scale shape coordinates into texture space so grain runs along x
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 9, uv.getY(i) / 4.5);
    uv.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);
}

function Band({ x, z, len, w, rot, tex }: { x: number; z: number; len: number; w: number; rot: number; tex: THREE.Texture }) {
  const map = useMemo(() => {
    const t = tex.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(len / w, 1);
    t.needsUpdate = true;
    return t;
  }, [tex, len, w]);
  return (
    <mesh position={[x, RIM_H + 0.004, z]} rotation={[-Math.PI / 2, 0, rot]} receiveShadow>
      <planeGeometry args={[len, w]} />
      <meshPhysicalMaterial map={map} roughness={0.38} metalness={0.05} clearcoat={0.8} clearcoatRoughness={0.18} />
    </mesh>
  );
}

export function Board({ theme }: { theme: BoardTheme }) {
  const tex = useMemo(() => themeTextures(theme), [theme]);
  const frameGeo = useFrameGeometry();

  const woodMat = useMemo(() => {
    const map = tex.wood.map;
    return new THREE.MeshPhysicalMaterial({
      map,
      bumpMap: tex.wood.bump,
      bumpScale: 1.2,
      roughness: 0.5,
      clearcoat: 0.75,
      clearcoatRoughness: 0.22,
    });
  }, [tex]);

  const fieldMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: tex.field,
        roughness: theme.field.kind === 'felt' ? 0.95 : 0.62,
        sheen: theme.field.kind === 'felt' ? 0.6 : 0.2,
        sheenColor: new THREE.Color(theme.field.base).multiplyScalar(1.6),
        sheenRoughness: 0.6,
      }),
    [tex, theme],
  );

  const bandW = 0.36;
  const totalW = OUTER_R - OUTER_L;
  const cx = (OUTER_L + OUTER_R) / 2;
  const sideZ = HALF_D + FRAME_W / 2;
  const sideXL = OUTER_L + FRAME_W / 2;
  const sideXR = OUTER_R - FRAME_W / 2;

  return (
    <group>
      {/* table */}
      <mesh rotation-x={-Math.PI / 2} position={[cx, -BASE - 0.002, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial map={tex.table} roughness={0.95} />
      </mesh>

      {/* frame (one beveled piece; the bar is part of it) */}
      <mesh geometry={frameGeo} material={woodMat} castShadow receiveShadow />

      {/* playing fields */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (BAR_W / 2 + HW / 2), 0, 0]} rotation-x={-Math.PI / 2} material={fieldMat} receiveShadow>
          <planeGeometry args={[HW + BEVEL * 2, HALF_D * 2 + BEVEL * 2]} />
        </mesh>
      ))}

      {/* off tray floor */}
      <mesh position={[(TRAY_L + TRAY_R) / 2, TRAY_FLOOR, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[TRAY_R - TRAY_L + BEVEL * 2, HALF_D * 2 + BEVEL * 2]} />
        <meshPhysicalMaterial map={tex.tray} roughness={0.7} />
      </mesh>

      {/* khatam inlay bands on the frame */}
      <Band x={cx} z={sideZ} len={totalW - 0.9} w={bandW} rot={0} tex={tex.khatam} />
      <Band x={cx} z={-sideZ} len={totalW - 0.9} w={bandW} rot={Math.PI} tex={tex.khatam} />
      <Band x={sideXL} z={0} len={HALF_D * 2 - 0.1} w={bandW} rot={Math.PI / 2} tex={tex.khatam} />
      <Band x={sideXR} z={0} len={HALF_D * 2 - 0.1} w={bandW} rot={-Math.PI / 2} tex={tex.khatam} />
      {/* along the bar, interrupted by the rosette */}
      <Band x={0} z={(HALF_D + 0.95) / 2} len={HALF_D - 0.95 - 0.1} w={0.22} rot={Math.PI / 2} tex={tex.khatam} />
      <Band x={0} z={-(HALF_D + 0.95) / 2} len={HALF_D - 0.95 - 0.1} w={0.22} rot={-Math.PI / 2} tex={tex.khatam} />

      {/* rosette medallion at the center of the bar */}
      <mesh position={[0, RIM_H + 0.006, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.6, 64]} />
        <meshPhysicalMaterial map={tex.rosette} transparent roughness={0.32} metalness={0.15} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>

      {/* brass corner caps */}
      {[
        [OUTER_L, -OUTER_D, 0],
        [OUTER_R, -OUTER_D, -Math.PI / 2],
        [OUTER_R, OUTER_D, Math.PI],
        [OUTER_L, OUTER_D, Math.PI / 2],
      ].map(([x, z, r], i) => (
        <CornerCap key={i} x={x} z={z} rot={r} color={theme.khatam.brass} />
      ))}
    </group>
  );
}

function CornerCap({ x, z, rot, color }: { x: number; z: number; rot: number; color: string }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const L = 0.95;
    const t = 0.16;
    s.moveTo(0.1, 0);
    s.lineTo(L, 0);
    s.lineTo(L, t);
    s.lineTo(t, t);
    s.lineTo(t, L);
    s.lineTo(0, L);
    s.lineTo(0, 0.1);
    s.quadraticCurveTo(0, 0, 0.1, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 });
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  // The shape's +x / +y run along the two frame edges meeting at the corner.
  return (
    <group position={[x, RIM_H + 0.035, z]} rotation-y={rot}>
      <mesh geometry={geo} position={[0.02, 0, 0.02]} castShadow>
        <meshPhysicalMaterial color={color} metalness={1} roughness={0.28} clearcoat={0.4} />
      </mesh>
    </group>
  );
}
