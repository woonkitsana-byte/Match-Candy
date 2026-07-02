/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DessertType =
  | 'macaron'
  | 'candy'
  | 'donut'
  | 'lookchup'
  | 'khanomtuay'
  | 'thongyip'
  | 'mochi'
  | 'marshmallow';

export interface DessertItem {
  id: string;
  type: DessertType;
  primaryColor: string; // hex
  secondaryColor: string | null; // hex for dual-color (Levels 31-60)
  isMystery: boolean; // mystery dessert wrapper (Levels 61+)
  isRevealed: boolean; // has been clicked/tapped to reveal its real color
  positionX: number; // 0 to 100 on conveyor belt
  speed: number;
  active: boolean;
}

export interface PlateConfig {
  index: number;
  color: string; // hex
  name: string; // Thai name e.g. "สีแดงสตรอว์เบอร์รี"
  colorClass: string; // tailwind color indicator
}

export type LevelTheme = 'macaron_cafe' | 'candy_factory' | 'thai_festival' | 'buffet_wonderland';

export interface LevelConfig {
  levelNumber: number;
  theme: LevelTheme;
  themeName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Wonderland';
  colors: string[]; // hex codes of colors on plates
  speedMultiplier: number;
  spawnIntervalMs: number;
  targetCount: number; // number of matches needed to win
  isDualColor: boolean;
  isMystery: boolean;
}

export interface UserProgress {
  currentLevel: number;
  highestLevel: number;
  stars: Record<number, number>; // levelNumber -> stars (1-3)
  candies: number; // Golden candies earned
  unlockedThemes: string[];
  unlockedPlates: string[];
  activeThemeId: string;
  activePlateId: string;
  unlockedDesserts: DessertType[];
}

export interface ShopTheme {
  id: string;
  name: string;
  description: string;
  price: number;
  bgGradient: string;
  cardBg: string;
  textColor: string;
  accentColor: string;
}

export interface PlateStyle {
  id: string;
  name: string;
  description: string;
  price: number;
  borderClass: string;
  bgClass: string;
}

export interface CaptionConfig {
  text: string;
  type: 'welcome' | 'victory' | 'failed' | 'share';
}
