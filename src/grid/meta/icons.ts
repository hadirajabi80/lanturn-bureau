/** lucide-react icon maps for achievements, scenarios and districts (named imports only). */
import {
  Anchor, Award, Building2, Cake, CalendarCheck, Castle, Coffee, Copy, Crosshair, Crown, Drama, FerrisWheel, FlameKindling,
  Flame, FlaskConical, Footprints, Gavel, Gem, Globe, GraduationCap, Hotel, KeyRound, Landmark, Layers, Leaf, Lock, LockKeyhole, Map,
  MapPinOff, Medal,
  Moon, PencilOff, Pin, Ruler, Shield, Skull, Sparkles, Star, Swords, Telescope, Timer, TrainFront, Trophy, UserX, Users,
  Zap, type LucideIcon,
} from 'lucide-react';
import type { Variant } from '../types';
import type { AchievementIconName, DistrictIconName } from './types';

const DISTRICT_ICONS: Record<DistrictIconName, LucideIcon> = {
  Castle, Anchor, Hotel, Landmark, Zap, GraduationCap, TrainFront, Telescope, Cake, Gem, FerrisWheel,
};

export const ACHIEVEMENT_ICONS: Record<AchievementIconName, LucideIcon> = {
  ...DISTRICT_ICONS, // includes Zap and Gem
  Pin, Sparkles, Drama, Users, Copy, Lock, FlaskConical, Crosshair, Crown, Moon, PencilOff, Shield, Timer,
  Building2, Flame, FlameKindling, Coffee, Ruler, Globe, Award, Medal, Trophy, CalendarCheck, Leaf, Layers, Map,
  Star, Footprints, Gavel, KeyRound, LockKeyhole, MapPinOff, Skull,
};

export const VARIANT_ICONS: Record<Variant, LucideIcon> = {
  classic: Skull, accomplice: Users, lockedRoom: Lock, poison: FlaskConical, sniper: Crosshair, liar: Drama,
  double: Copy, liarDouble: Swords, accompliceLiar: UserX,
};

/** Icon for a District.icon name; unknown names fall back to a generic building. */
export const districtIcon = (name: string): LucideIcon => (DISTRICT_ICONS as Record<string, LucideIcon>)[name] ?? Building2;
