import { useState, type JSX, type ReactNode } from 'react';
import { BUREAU_LIST } from '../../data/bureau';
import type { Accessory, AvatarSpec, Brows, Eyes, FacialHair, HairStyle, Mood, Mouth } from '../../data/types';
import { Avatar } from './Avatar';

/**
 * DEV ONLY — a grid of every enum value so coverage can be eyeballed.
 * Mount it on a dev route, e.g. `<Route path="/dev/avatars" element={<AvatarPreview />} />`.
 */

const HAIR: HairStyle[] = ['short', 'long', 'bun', 'bald', 'curly', 'bob', 'ponytail', 'afro', 'slick', 'mohawk', 'braids', 'buzz', 'wavy', 'pixie'];
const ACCESSORIES: Accessory[] = [
  'none', 'glasses', 'roundGlasses', 'monocle', 'hat', 'beret', 'headphones', 'scarf', 'earring', 'bowtie', 'cap',
  'bandana', 'flower', 'goggles', 'pearls', 'headscarf', 'eyepatch', 'headset', 'tie', 'collar', 'hood',
];
const FACIAL: FacialHair[] = ['none', 'beard', 'mustache', 'stubble', 'goatee', 'bigBeard'];
const EYES: Eyes[] = ['round', 'narrow', 'wide', 'sleepy', 'sharp', 'closed', 'dot'];
const BROWS: Brows[] = ['flat', 'arched', 'angry', 'worried', 'raised', 'thick'];
const MOUTHS: Mouth[] = ['smile', 'smirk', 'frown', 'neutral', 'grin', 'o', 'pout', 'teeth'];
const MOODS: Mood[] = ['neutral', 'happy', 'angry', 'surprised', 'smug', 'sad', 'thinking'];
const SKINS = ['#F6D7BD', '#E8C4A2', '#D9A57F', '#C9956B', '#A86F4C', '#6B3F2A', '#4A2A1C'];

const BASE: AvatarSpec = {
  skin: '#E2B48F',
  hair: 'short',
  hairColor: '#4A3426',
  eyes: 'round',
  brows: 'flat',
  mouth: 'smile',
  accessory: 'none',
  facial: 'none',
  outfit: '#3B4A6B',
  accent: '#FFB347',
};

function Cell({ label, spec, size, mood, speaking }: { label: string; spec: AvatarSpec; size: number; mood?: Mood; speaking?: boolean }) {
  return (
    <figure className="flex flex-col items-center gap-1">
      <Avatar spec={spec} size={size} mood={mood} speaking={speaking} />
      <figcaption className="max-w-[9rem] truncate text-center text-xs text-print-muted">{label}</figcaption>
    </figure>
  );
}

function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h3 className="mb-3 border-b-2 border-print-ink pb-1 font-display text-lg font-extrabold text-print-ink">{title}</h3>
      <div className="flex flex-wrap gap-4">{children}</div>
    </section>
  );
}

export function AvatarPreview(): JSX.Element {
  const [size, setSize] = useState(96);
  const [speaking, setSpeaking] = useState(false);
  const [mood, setMood] = useState<Mood>('neutral');

  return (
    <div className="min-h-dvh bg-print-paper p-6 text-print-ink">
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <h2 className="font-display text-2xl">Avatar preview</h2>
        <label className="flex items-center gap-2 text-sm">
          size
          <input type="range" min={40} max={200} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          <span className="w-8 font-mono">{size}</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={speaking} onChange={(e) => setSpeaking(e.target.checked)} /> speaking
        </label>
        <label className="flex items-center gap-2 text-sm">
          mood
          <select className="rounded-md bg-print-card px-2 py-1 shadow-[inset_0_0_0_1.5px_#141414]" value={mood} onChange={(e) => setMood(e.target.value as Mood)}>
            {MOODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </header>

      <Row title="Bureau cast @ 48 / 96 / 160">
        {BUREAU_LIST.map((c) => (
          <div key={c.id} className="flex items-end gap-2">
            <Avatar spec={c.avatar} size={48} mood={mood} />
            <Avatar spec={c.avatar} size={96} mood={mood} speaking={speaking} />
            <Cell label={c.name} spec={c.avatar} size={160} mood={mood} speaking={speaking} />
          </div>
        ))}
      </Row>

      <Row title="Moods (cast)">
        {BUREAU_LIST.map((c) => (
          <div key={c.id} className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <Cell key={m} label={`${c.id}:${m}`} spec={c.avatar} size={72} mood={m} />
            ))}
          </div>
        ))}
      </Row>

      <Row title="Hair">
        {HAIR.map((h) => (
          <Cell key={h} label={h} spec={{ ...BASE, hair: h }} size={size} mood={mood} speaking={speaking} />
        ))}
      </Row>
      <Row title="Accessories">
        {ACCESSORIES.map((a) => (
          <Cell key={a} label={a} spec={{ ...BASE, accessory: a, hair: a === 'hat' || a === 'cap' ? 'long' : BASE.hair }} size={size} mood={mood} speaking={speaking} />
        ))}
      </Row>
      <Row title="Facial hair">
        {FACIAL.map((f) => (
          <Cell key={f} label={f} spec={{ ...BASE, facial: f, mouth: 'neutral' }} size={size} mood={mood} speaking={speaking} />
        ))}
      </Row>
      <Row title="Eyes">
        {EYES.map((e) => (
          <Cell key={e} label={e} spec={{ ...BASE, eyes: e }} size={size} />
        ))}
      </Row>
      <Row title="Brows">
        {BROWS.map((b) => (
          <Cell key={b} label={b} spec={{ ...BASE, brows: b }} size={size} />
        ))}
      </Row>
      <Row title="Mouths">
        {MOUTHS.map((m) => (
          <Cell key={m} label={m} spec={{ ...BASE, mouth: m }} size={size} speaking={speaking} />
        ))}
      </Row>
      <Row title="Age (young / adult / old) × skin">
        {SKINS.map((s, i) =>
          (['young', 'adult', 'old'] as const).map((age) => (
            <Cell
              key={`${s}-${age}`}
              label={`${age} ${s}`}
              spec={{ ...BASE, skin: s, age, hair: HAIR[(i * 3 + age.length) % HAIR.length], facial: age === 'old' ? 'beard' : 'none' }}
              size={size}
              mood={mood}
            />
          )),
        )}
      </Row>
      <Row title="Cats">
        {(['collar', 'bowtie', 'hat', 'glasses', 'monocle', 'flower', 'scarf', 'headphones'] as Accessory[]).map((a, i) => (
          <Cell
            key={a}
            label={`cat + ${a}`}
            spec={{
              kind: 'cat',
              skin: ['#F0E6D8', '#FFFFFF', '#E9D3B0', '#F2E8DC'][i % 4],
              hairColor: ['#8D7B68', '#2A2626', '#D98A3D', '#9AA0A8'][i % 4],
              hair: 'short',
              eyes: EYES[i % EYES.length],
              brows: 'flat',
              mouth: MOUTHS[i % MOUTHS.length],
              accessory: a,
              facial: 'none',
              outfit: ['#C8323C', '#2EC4B6', '#7C5CFF', '#D4A857'][i % 4],
              accent: ['#FFB347', '#2EC4B6', '#B9A3D6', '#C8323C'][i % 4],
            }}
            size={size}
            mood={mood}
            speaking={speaking}
          />
        ))}
      </Row>
    </div>
  );
}

export default AvatarPreview;
