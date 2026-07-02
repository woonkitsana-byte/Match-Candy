/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Trophy,
  ArrowRight,
  Heart,
  Volume2,
  VolumeX,
  Share2,
  RotateCcw,
  Play,
  Flame,
  Award,
  ChevronLeft,
  X,
  Gift
} from 'lucide-react';
import { DessertItem, LevelConfig, PlateConfig, UserProgress, DessertType } from '../types';
import DessertRenderer from './DessertRenderer';
import { audio } from '../utils/audio';
import RewardedAdModal from './RewardedAdModal';

interface GameAreaProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onBack: () => void;
  plateStyleBorder: string;
  plateStyleBg: string;
}

// Generate configuration for a given level (Endless procedural generation!)
const getLevelConfig = (lvl: number): LevelConfig => {
  const themes: Array<'macaron_cafe' | 'candy_factory' | 'thai_festival' | 'buffet_wonderland'> = [
    'macaron_cafe', 'candy_factory', 'thai_festival', 'buffet_wonderland'
  ];
  const themeNames = ['คาเฟ่มาการอง', 'โรงงานลูกกวาด', 'เทศกาลขนมไทย', 'แดนมหัศจรรย์บุฟเฟต์'];
  
  const themeIndex = (lvl - 1) % 4;
  const theme = themes[themeIndex];
  const themeName = themeNames[themeIndex];
  
  // Dynamic descriptive difficulties
  let difficulty = 'Easy';
  if (lvl > 100) difficulty = '🌌 Legend Master 🌌';
  else if (lvl > 70) difficulty = '🏆 Grandmaster';
  else if (lvl > 45) difficulty = '👑 Culinary Master';
  else if (lvl > 25) difficulty = '✨ Expert Matcher';
  else if (lvl > 12) difficulty = '⚡ Hard';
  else if (lvl > 5) difficulty = '🍰 Medium';

  // Base palette configurations
  const macaronColors = ['#ef4444', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#10b981'];
  const candyColors = ['#fbcfe8', '#fda4af', '#e9d5ff', '#bfdbfe', '#fca5a5', '#fed7aa'];
  const thaiColors = ['#fbbf24', '#10b981', '#fcf8f2', '#fb7185', '#a7f3d0', '#fef08a'];
  const buffetColors = ['#059669', '#d97706', '#dc2626', '#2563eb', '#8b5cf6', '#db2777'];
  
  let baseColors = macaronColors;
  if (theme === 'candy_factory') baseColors = candyColors;
  else if (theme === 'thai_festival') baseColors = thaiColors;
  else if (theme === 'buffet_wonderland') baseColors = buffetColors;

  // Number of plate choices scales by level
  // lvl 1-4: 3 colors | lvl 5-11: 4 colors | lvl 12-40: 5 colors | lvl 41+: 6 colors!
  const colorCount = lvl < 5 ? 3 : (lvl < 12 ? 4 : (lvl < 41 ? 5 : 6));
  const colors = baseColors.slice(0, colorCount);

  // Speed multiplier scales up smoothly but keeps challenging!
  // At level 1: 1.0x, Level 30: 1.7x, Level 100: 2.3x
  const speedMultiplier = 1.0 + Math.min(1.5, Math.log2(lvl) * 0.22);

  // Spawning speed interval (gets much more intense and rapid!)
  // Max speed spawning is 900ms for a heavy arcade rush!
  const spawnIntervalMs = Math.max(900, 3100 - (lvl * 60));

  // Goal requirement
  const targetCount = 10 + Math.min(35, Math.floor(lvl * 0.5));

  // Game rules
  // Dual color logic applies to alternate levels or past certain thresholds
  const isDualColor = lvl > 6 && (lvl % 2 === 0 || lvl > 20);
  const isMystery = lvl > 12 && (lvl % 3 === 0 || lvl > 35);

  return {
    levelNumber: lvl,
    theme,
    themeName,
    difficulty,
    colors,
    speedMultiplier,
    spawnIntervalMs,
    targetCount,
    isDualColor,
    isMystery,
  };
};

const DESSERT_POOL: DessertType[] = [
  'macaron',
  'lookchup',
  'donut',
  'candy',
  'khanomtuay',
  'thongyip',
  'mochi',
  'marshmallow',
];

const VICTORY_QUOTES = [
  'เก่งเกินต้าน! สายตาเฉียบคมเหมือนมดเจอน้ำตาล 🐜✨',
  'หวานเจี๊ยบ! ผ่านด่านแบบสมบูรณ์แบบ',
  'แยกสีเป๊ะขนาดนี้... ไปเป็นเชฟร้านขนมไหมคะ?',
  'ความน่ารักของคุณเตะตา จนขนมหวานยังต้องยอมแพ้ 👑',
  'สุดยอดคอมโบ! หัวใจพองโตเลยล่ะสิ 💖',
];

const FAIL_QUOTES = [
  'เกือบแล้วอีกนิดเดียว! พักกินขนมจริง ๆ สักชิ้นแล้วมาลุยต่อไหม? 🥯',
  'สีมันลวงตา หรือใจเธอแอบลอยไปหาใครอยู่หรือเปล่านะ? 😉',
  'ไม่เป็นไรนะ เติมพลังชีวิตแล้วกลับมาจับคู่กันใหม่! 💖',
  'ขนมตกพื้นไม่เป็นไร... เริ่มต้นใหม่ด่านนี้ยังไหวอยู่! สู้ ๆ ✌️',
];

export default function GameArea({
  progress,
  onUpdateProgress,
  onBack,
  plateStyleBorder,
  plateStyleBg,
}: GameAreaProps) {
  const levelConfig = getLevelConfig(progress.currentLevel);

  // Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [desserts, setDesserts] = useState<DessertItem[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [selectedDessertId, setSelectedDessertId] = useState<string | null>(null);
  
  // Game Status
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [earnedCandies, setEarnedCandies] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const [hasRevived, setHasRevived] = useState(false);
  const [isAdOpen, setIsAdOpen] = useState(false);

  // UI Effects
  const [muted, setMuted] = useState(audio.getMuteState());
  const [quoteBubble, setQuoteBubble] = useState<{ text: string; isPositive: boolean } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // References
  const gameLoopRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<any>(null);
  const quoteTimerRef = useRef<any>(null);

  // Prepare Plates based on colors
  const plates: PlateConfig[] = levelConfig.colors.map((color, index) => {
    let name = 'สีหวาน';
    if (color === '#ef4444') name = 'สตรอว์เบอร์รีแดง';
    else if (color === '#f59e0b') name = 'เลมอนเหลือง';
    else if (color === '#3b82f6') name = 'ฟ้าน้ำทะเล';
    else if (color === '#fbcfe8') name = 'ชมพูพาสเทล';
    else if (color === '#fda4af') name = 'โอรสแซลมอน';
    else if (color === '#e9d5ff') name = 'ม่วงลาเวนเดอร์';
    else if (color === '#bfdbfe') name = 'ฟ้าปุยเมฆ';
    else if (color === '#fbbf24') name = 'ทองหยิบทอง';
    else if (color === '#10b981') name = 'สังขยาใบเตย';
    else if (color === '#fcf8f2') name = 'ขาวมะพร้าวกะทิ';
    else if (color === '#fb7185') name = 'ชมพูนมเย็น';
    else if (color === '#059669') name = 'มรกตเขียว';
    else if (color === '#d97706') name = 'ส้มชาไทย';
    else if (color === '#dc2626') name = 'แดงทับทิม';
    else if (color === '#2563eb') name = 'น้ำเงินไพลิน';

    return {
      index,
      color,
      name,
      colorClass: '',
    };
  });

  // Start the BGM and ensure audio context triggers
  useEffect(() => {
    audio.startBgm();
    return () => {
      audio.stopBgm();
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
    };
  }, []);

  const toggleMuted = () => {
    const isMutedNow = audio.toggleMute();
    setMuted(isMutedNow);
  };

  const showQuote = (text: string, isPositive: boolean) => {
    if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
    setQuoteBubble({ text, isPositive });
    quoteTimerRef.current = setTimeout(() => {
      setQuoteBubble(null);
    }, 2800);
  };

  // Main Spawn logic
  const spawnDessert = () => {
    if (!isPlaying || isGameOver || isVictory) return;

    // Pick random dessert type compatible with theme
    let type: DessertType = 'macaron';
    if (levelConfig.theme === 'macaron_cafe') {
      type = 'macaron';
    } else if (levelConfig.theme === 'candy_factory') {
      type = Math.random() > 0.5 ? 'candy' : 'donut';
    } else if (levelConfig.theme === 'thai_festival') {
      const options: DessertType[] = ['lookchup', 'khanomtuay', 'thongyip'];
      type = options[Math.floor(Math.random() * options.length)];
    } else {
      type = DESSERT_POOL[Math.floor(Math.random() * DESSERT_POOL.length)];
    }

    // Pick primary color from plate colors
    const colorIndex = Math.floor(Math.random() * levelConfig.colors.length);
    const primaryColor = levelConfig.colors[colorIndex];

    // Bicolor handling
    let secondaryColor: string | null = null;
    if (levelConfig.isDualColor) {
      // Choose a secondary color that differs from primary
      const otherColors = levelConfig.colors.filter((c) => c !== primaryColor);
      secondaryColor = otherColors[Math.floor(Math.random() * otherColors.length)] || '#ffffff';
    }

    const newDessert: DessertItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      primaryColor,
      secondaryColor,
      isMystery: levelConfig.isMystery,
      isRevealed: false,
      positionX: -10, // start slightly off-screen left
      speed: (0.12 + Math.random() * 0.08) * levelConfig.speedMultiplier,
      active: true,
    };

    setDesserts((prev) => [...prev, newDessert]);
  };

  // Start Level
  const startLevel = () => {
    audio.playTap();
    setDesserts([]);
    setMatchedCount(0);
    setMissedCount(0);
    setCombo(0);
    setMaxCombo(0);
    setSelectedDessertId(null);
    setIsGameOver(false);
    setIsVictory(false);
    setHasRevived(false);
    setIsPlaying(true);
    showQuote('มาเริ่มปั้นความน่ารักใส่ถ้วยกันเถอะ! 🥰', true);
  };

  const handleAdReviveComplete = () => {
    setMissedCount(0);
    setIsGameOver(false);
    setHasRevived(true);
    setIsAdOpen(false);
    setIsPlaying(true);
    audio.playSuccess();
    showQuote('💖 ชุบชีวิตสำเร็จ! สู้ต่อนะเชฟคนเก่ง 🧁✨', true);
  };

  // Fever mode triggers when combo reaches 5 or more!
  const isFever = combo >= 5;
  const currentSpawnInterval = isFever ? Math.max(650, levelConfig.spawnIntervalMs * 0.7) : levelConfig.spawnIntervalMs;

  // Spawn Trigger loop
  useEffect(() => {
    if (isPlaying && !isGameOver && !isVictory) {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = setInterval(spawnDessert, currentSpawnInterval);
    } else {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    }
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [isPlaying, isGameOver, isVictory, progress.currentLevel, currentSpawnInterval]);

  // Main conveyor belt motion animation loop
  useEffect(() => {
    const updatePhysics = () => {
      if (isPlaying && !isGameOver && !isVictory) {
        setDesserts((prev) => {
          let updated = prev.map((item) => {
            if (!item.active) return item;
            const nextX = item.positionX + item.speed;

            // If falls off-screen right
            if (nextX > 105) {
              handleMiss();
              return { ...item, active: false, positionX: nextX };
            }
            return { ...item, positionX: nextX };
          });

          // Clear out completely inactive items to keep state tight
          return updated.filter((item) => item.positionX < 110 && item.active);
        });
      }
      gameLoopRef.current = requestAnimationFrame(updatePhysics);
    };

    gameLoopRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, isGameOver, isVictory]);

  const handleMiss = () => {
    audio.playFail();
    setCombo(0);
    setMissedCount((prev) => {
      const nextMisses = prev + 1;
      // If misses exceed 5, it triggers soft failure
      if (nextMisses >= 6) {
        triggerGameOver();
      }
      return nextMisses;
    });
    const randomQuote = FAIL_QUOTES[Math.floor(Math.random() * FAIL_QUOTES.length)];
    showQuote(randomQuote, false);
  };

  const triggerGameOver = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    audio.playFail();
  };

  const checkVictory = (currentMatches: number) => {
    if (currentMatches >= levelConfig.targetCount) {
      setIsPlaying(false);
      setIsVictory(true);
      audio.playVictory();

      // Star calculation
      let stars = 1;
      const accuracy = currentMatches / (currentMatches + missedCount);
      if (accuracy >= 0.90) stars = 3;
      else if (accuracy >= 0.70) stars = 2;

      setEarnedStars(stars);

      // Candy prize: 10 per star + combo bonus
      const candyPrize = stars * 15 + Math.floor(maxCombo * 2);
      setEarnedCandies(candyPrize);

      // Unlock current dessert type in Bakery Collection
      let newlyUnlockedDessert: DessertType = 'macaron';
      if (levelConfig.theme === 'macaron_cafe') newlyUnlockedDessert = 'macaron';
      else if (levelConfig.theme === 'candy_factory') newlyUnlockedDessert = 'candy';
      else if (levelConfig.theme === 'thai_festival') newlyUnlockedDessert = 'lookchup';
      else newlyUnlockedDessert = DESSERT_POOL[Math.floor(Math.random() * DESSERT_POOL.length)];

      onUpdateProgress((prev) => {
        const nextStars = { ...prev.stars };
        nextStars[progress.currentLevel] = Math.max(nextStars[progress.currentLevel] || 0, stars);

        const updatedDesserts = prev.unlockedDesserts.includes(newlyUnlockedDessert)
          ? prev.unlockedDesserts
          : [...prev.unlockedDesserts, newlyUnlockedDessert];

        return {
          ...prev,
          highestLevel: Math.max(prev.highestLevel, progress.currentLevel + 1),
          stars: nextStars,
          candies: prev.candies + candyPrize,
          unlockedDesserts: updatedDesserts,
        };
      });
    }
  };

  // Match interaction logic
  const matchDessertWithPlate = (dessert: DessertItem, plateColor: string) => {
    if (!isPlaying) return;

    // Check color matching
    // In dual color levels, it matches if the target plate color is equal to either primary or secondary color!
    const isMatched =
      dessert.primaryColor === plateColor ||
      (dessert.secondaryColor && dessert.secondaryColor === plateColor);

    if (isMatched) {
      // Success match!
      audio.playSuccess();
      setDesserts((prev) => prev.filter((d) => d.id !== dessert.id));
      setSelectedDessertId(null);

      setMatchedCount((prev) => {
        const nextMatches = prev + 1;
        checkVictory(nextMatches);
        return nextMatches;
      });

      setCombo((prev) => {
        const nextCombo = prev + 1;
        setMaxCombo((m) => Math.max(m, nextCombo));
        return nextCombo;
      });

      const randomQuote = VICTORY_QUOTES[Math.floor(Math.random() * VICTORY_QUOTES.length)];
      showQuote(randomQuote, true);
    } else {
      // Bad match!
      audio.playFail();
      setCombo(0);
      setSelectedDessertId(null);
      setMissedCount((prev) => {
        const nextMisses = prev + 1;
        if (nextMisses >= 6) {
          triggerGameOver();
        }
        return nextMisses;
      });
      showQuote('อุ๊ย! ผิดสไตล์จานแล้วล่ะ ค่อย ๆ เลือกใหม่นะ 🍧', false);
    }
  };

  // Interaction 1: Tap to Match when inside the Match Box (Active Box is around X-pos: 42% to 58%)
  const handleRhythmTapPlate = (plateColor: string) => {
    audio.playTap();
    if (!isPlaying) return;

    // Find the dessert closest to the Match Box center (50%)
    const activeDesserts = desserts.filter(
      (d) => d.active && (!d.isMystery || d.isRevealed) && d.positionX >= 35 && d.positionX <= 65
    );

    if (activeDesserts.length > 0) {
      // Sort by distance to absolute center (50%) to hit the target accurately
      activeDesserts.sort((a, b) => Math.abs(a.positionX - 50) - Math.abs(b.positionX - 50));
      matchDessertWithPlate(activeDesserts[0], plateColor);
    } else {
      // Tapped but no dessert was in matching slot
      showQuote('ใจร้อนไปนิด! รอให้ขนมมาตรงช่องสีชมพูกลางสายพานก่อนนะ 🍰', false);
    }
  };

  // Interaction 2: Click dessert to select, then click Plate to route
  const handleDessertClick = (dessert: DessertItem) => {
    audio.playTap();
    if (!isPlaying) return;

    if (dessert.isMystery && !dessert.isRevealed) {
      // It's a mystery box! Clicking it reveals the actual color!
      audio.playReveal();
      setDesserts((prev) =>
        prev.map((d) => (d.id === dessert.id ? { ...d, isRevealed: true } : d))
      );
      showQuote('วิ้ง! ขนมปริศนาเปิดเผยตัวตนแล้ว ปรับสีให้เป๊ะเลย 🪄', true);
      return;
    }

    if (selectedDessertId === dessert.id) {
      setSelectedDessertId(null);
    } else {
      setSelectedDessertId(dessert.id);
    }
  };

  const handlePlateClick = (plateColor: string) => {
    if (!isPlaying) return;

    if (selectedDessertId) {
      const selected = desserts.find((d) => d.id === selectedDessertId);
      if (selected) {
        matchDessertWithPlate(selected, plateColor);
      }
    } else {
      // Fallback: Trigger standard rhythm tap check
      handleRhythmTapPlate(plateColor);
    }
  };

  const nextLevel = () => {
    audio.playTap();
    onUpdateProgress((prev) => ({
      ...prev,
      currentLevel: prev.currentLevel + 1,
    }));
    setIsVictory(false);
    setIsPlaying(false);
    setDesserts([]);
    setMatchedCount(0);
    setMissedCount(0);
    setCombo(0);
    setMaxCombo(0);
  };

  const shareGame = () => {
    audio.playTap();
    setShowShareModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full max-w-4xl mx-auto bg-white/70 backdrop-blur-md rounded-3xl border border-amber-900/10 shadow-2xl p-4 md:p-6 z-10"
    >
      {/* Game Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-amber-900/10 pb-4 mb-4 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audio.playTap();
              onBack();
            }}
            className="p-2 rounded-full hover:bg-amber-100 transition-colors text-amber-900"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full uppercase">
              {levelConfig.difficulty}
            </span>
            <h1 className="text-lg md:text-xl font-bold text-amber-900 font-sans mt-0.5">
              ด่าน {progress.currentLevel}: {levelConfig.themeName}
            </h1>
          </div>
        </div>

        {/* Target Progress Bar / Stat indicators */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {/* Matches Goal */}
          <div className="bg-amber-100/60 border border-amber-200/50 px-3 py-1 rounded-full text-xs font-semibold text-amber-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>จับคู่สำเร็จ: {matchedCount} / {levelConfig.targetCount}</span>
          </div>

          {/* Misses Indicator (6 lives max) */}
          <div className="bg-rose-50 border border-rose-100 px-3 py-1 rounded-full text-xs font-semibold text-rose-800 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="font-mono">พลาด: {missedCount} / 5</span>
          </div>

          {/* Combo Indicator */}
          {combo > 0 && (
            <motion.div
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
              className="bg-yellow-100 border border-yellow-300 px-3 py-1 rounded-full text-xs font-bold text-yellow-900 flex items-center gap-1"
            >
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-400" />
              <span>{combo} COMBO!</span>
            </motion.div>
          )}

          {/* Audio volume toggle */}
          <button
            onClick={toggleMuted}
            className="p-2 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/40 text-amber-900 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Caption Encouragement Bubble (Moved above the Main Playable Zone to avoid covering the matching slot) */}
      <motion.div 
        animate={{ height: quoteBubble ? 'auto' : 0, marginBottom: quoteBubble ? 16 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative overflow-hidden flex items-center justify-center"
      >
        <AnimatePresence>
          {quoteBubble && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`px-5 py-2 rounded-full border shadow-md font-semibold text-xs md:text-sm text-center ${
                quoteBubble.isPositive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              {quoteBubble.text}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Playable Zone */}
      <div className="bg-amber-50/30 border border-amber-900/5 rounded-2xl p-4 md:p-6 mb-4 min-h-[300px] flex flex-col justify-between relative overflow-hidden">

        {/* Level Banner / Onboarding if not started */}
        {!isPlaying && !isGameOver && !isVictory && (
          <div className="absolute inset-0 bg-[#e67e22]/5 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6 z-20">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl border border-amber-900/10 p-6 shadow-xl max-w-md"
            >
              <h2 className="text-xl font-extrabold text-amber-900 mb-2">
                🧁 พร้อมเปิดสายพานความหวานหรือยัง?
              </h2>
              <div className="text-xs text-amber-800/80 space-y-2 mb-6 leading-relaxed">
                <p>
                  • ขนมจะเลื่อนผ่านสายพานจากซ้ายไปขวา
                </p>
                <p>
                  • <span className="font-bold text-amber-900">วิธีที่ 1 (Rhythm Tap):</span> กดปุ่มจานสีด้านล่างให้ตรงกับขนมเมื่อขนมเลื่อนเข้าช่อง <span className="text-pink-500 font-bold">"สีชมพูจุดศูนย์กลาง"</span>
                </p>
                <p>
                  • <span className="font-bold text-amber-900">วิธีที่ 2 (Click and Send):</span> จิ้มที่ขนมชิ้นไหนก็ได้บนสายพาน แล้วจิ้มจานสีด้านล่างเพื่อเสิร์ฟทันที!
                </p>
                {levelConfig.isMystery && (
                  <p className="text-yellow-700 font-semibold bg-yellow-50 p-1.5 rounded border border-yellow-200 mt-1">
                    🌟 ด่านนี้มี "ขนมปริศนา (?)" ต้องจิ้มขนมเพื่อลอกห่อฟอยล์แกะสีออกมาก่อนนะ!
                  </p>
                )}
                {levelConfig.isDualColor && (
                  <p className="text-amber-700 font-semibold bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                    🎨 ด่านขนมไทยมีสองสีในชิ้นเดียว! เสิร์ฟจานสีที่ตรงกับสีใดสีหนึ่งของขนมได้เลย
                  </p>
                )}
              </div>
              <button
                onClick={startLevel}
                className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>เปิดร้านคาเฟ่ ลุยเลย!</span>
              </button>
            </motion.div>
          </div>
        )}

        {/* 1. Conveyor Belt Container (Zone ขนมหลากสี) with Fever styling */}
        <div className={`relative w-full h-32 border-y rounded-xl flex items-center overflow-hidden transition-all duration-300 ${
          isFever 
            ? 'bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 border-orange-400 ring-4 ring-orange-400/30 shadow-lg' 
            : 'bg-amber-100/40 border-amber-900/10'
        }`}>
          
          {/* Conveyor Background lines to simulate motion */}
          <div 
            className="absolute inset-0 opacity-[0.06]" 
            style={{ 
              backgroundImage: 'repeating-linear-gradient(45deg, #451a03 0px, #451a03 10px, transparent 10px, transparent 20px)',
              backgroundSize: '100% 100%'
            }} 
          />

          {/* Fever Overlay glow */}
          {isFever && (
            <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-r from-orange-500/10 via-yellow-400/15 to-orange-500/10 animate-pulse pointer-events-none z-0" />
          )}

          {/* Active Highlight matching rhythm box (Center of conveyor) */}
          {isPlaying && (
            <div className={`absolute left-[42%] right-[42%] top-1 bottom-1 border-2 border-dashed rounded-2xl flex items-center justify-center z-10 transition-colors ${
              isFever ? 'border-orange-500 bg-orange-100/30' : 'border-pink-400 bg-pink-100/15'
            }`}>
              <div className={`text-[10px] font-black uppercase animate-pulse flex flex-col items-center ${
                isFever ? 'text-orange-600' : 'text-pink-500'
              }`}>
                <span>{isFever ? '🔥 FEVER 🔥' : 'ช่องจับคู่'}</span>
              </div>
            </div>
          )}

          {/* Sliding Desserts */}
          <AnimatePresence>
            {desserts.map((dessert) => {
              const isSelected = selectedDessertId === dessert.id;
              return (
                <motion.div
                  key={dessert.id}
                  className="absolute cursor-pointer flex flex-col items-center justify-center"
                  style={{
                    left: `${dessert.positionX}%`,
                    top: '15px',
                  }}
                  animate={isSelected ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                  onClick={() => handleDessertClick(dessert)}
                >
                  <div className={`relative rounded-full p-0.5 ${isSelected ? 'ring-4 ring-pink-400 ring-offset-2' : ''}`}>
                    <DessertRenderer
                      type={dessert.type}
                      primaryColor={dessert.primaryColor}
                      secondaryColor={dessert.secondaryColor}
                      isMystery={dessert.isMystery}
                      isRevealed={dessert.isRevealed}
                      size={60}
                    />

                    {/* Show selected pointer glow */}
                    {isSelected && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] bg-pink-500 text-white font-bold px-1.5 py-0.5 rounded">
                        เลือกอยู่
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty conveyor sign */}
          {isPlaying && desserts.length === 0 && (
            <div className="w-full text-center text-xs text-amber-800/40 font-medium animate-pulse">
              ขนมแสนอร่อยกำลังทยอยเข้าแถวมา... 🧁
            </div>
          )}
        </div>

        {/* Conveyor Belt roller stands decoration */}
        <div className="flex justify-between px-6 -mt-3.5 relative z-10">
          <div className="w-3 h-3 bg-amber-900/20 rounded-full" />
          <div className="w-3 h-3 bg-amber-900/20 rounded-full" />
          <div className="w-3 h-3 bg-amber-900/20 rounded-full" />
          <div className="w-3 h-3 bg-amber-900/20 rounded-full" />
        </div>

        {/* 2. Color Plates Matching Area (Zone จานสี/ถ้วยรับสี) */}
        <div className="mt-8">
          <p className="text-[11px] text-center text-amber-800/60 font-semibold mb-3">
            {selectedDessertId 
              ? '💡 จิ้มเลือกจานสีด้านล่างนี้เพื่อเสิร์ฟขนมที่เลือกทันที!'
              : '💡 กดจานสีด้านล่างให้จังหวะตรงกับสีของขนมในช่อง "สีชมพูตรงกลาง" ได้เลย!'}
          </p>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 justify-center items-center">
            {plates.map((plate) => {
              return (
                <button
                  key={plate.index}
                  onClick={() => handlePlateClick(plate.color)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center hover:scale-103 active:scale-97 group ${plateStyleBorder} ${plateStyleBg}`}
                >
                  {/* Visual colored circle inside plate */}
                  <div className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: plate.color }}
                  >
                    {/* Concentric rings to make it look like a plate/cup rim */}
                    <div className="w-10 h-10 rounded-full border border-dashed border-white/40 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-white/20" />
                    </div>
                  </div>

                  {/* Color name and label */}
                  <span className="text-xs font-bold text-amber-900/80 mt-2 text-center truncate w-full group-hover:text-amber-950">
                    {plate.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overlays: Victory or Game Over */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl flex items-center justify-center z-40 p-4 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm border border-amber-900/10 shadow-2xl flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-4 animate-bounce">
                <X className="w-10 h-10" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-amber-900">
                โอ๊ะโอ๋! ขนมเริ่มล้นเตาแล้ว 🍰
              </h2>
              <p className="text-xs text-amber-800/80 mt-2 mb-4 leading-relaxed">
                "ไม่เป็นไรนะ เติมพลังใจ พักดัดแปลงสายตาสักครู่ แล้วกลับมาลุยกับขนมแสนอร่อยใหม่!"
              </p>

              {!hasRevived && (
                <button
                  onClick={() => {
                    audio.playTap();
                    setIsAdOpen(true);
                  }}
                  className="w-full mb-3.5 py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:brightness-105 text-white font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs animate-pulse ring-4 ring-purple-400/20"
                >
                  <Heart className="w-4 h-4 fill-white animate-bounce" />
                  <span>ดูโฆษณา ชุบชีวิตฟรีทันที! ❤️ (ได้ 1 ครั้ง/รอบ)</span>
                </button>
              )}
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    audio.playTap();
                    onBack();
                  }}
                  className="flex-1 py-2.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium transition-colors cursor-pointer text-xs"
                >
                  กลับเมนูหลัก
                </button>
                <button
                  onClick={startLevel}
                  className="flex-1 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ลองใหม่อีกครั้ง</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isVictory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl flex items-center justify-center z-40 p-4 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md border border-amber-900/10 shadow-2xl flex flex-col items-center relative overflow-hidden"
            >
              {/* Sparkle background elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 rounded-full blur-2xl opacity-50" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-100 rounded-full blur-2xl opacity-50" />

              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-4 animate-bounce">
                <Trophy className="w-10 h-10 fill-yellow-500/20" />
              </div>
              
              <h2 className="text-xl md:text-2xl font-black text-amber-900">
                ยินดีด้วยผ่านด่านเรียบร้อย! 🎉
              </h2>
              
              <p className="text-xs text-emerald-800/80 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 font-medium mt-2">
                "หวานเจี๊ยบ! ผ่านด่านแบบสมบูรณ์แบบ แววเชฟระดับทองอร่ามจับตา"
              </p>

              {/* Stars Display */}
              <div className="flex gap-2 my-5">
                {[1, 2, 3].map((s) => (
                  <motion.div
                    key={s}
                    initial={{ scale: 0 }}
                    animate={{ scale: s <= earnedStars ? [0, 1.3, 1] : 0.8 }}
                    transition={{ delay: s * 0.15, duration: 0.3 }}
                  >
                    <Award
                      className={`w-10 h-10 ${
                        s <= earnedStars
                          ? 'text-yellow-500 fill-yellow-400'
                          : 'text-gray-200'
                      }`}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Prizes Summary */}
              <div className="grid grid-cols-2 gap-4 w-full bg-amber-50/50 p-4 rounded-2xl border border-amber-900/5 mb-6">
                <div>
                  <span className="text-[10px] text-amber-800/60 block font-semibold">
                    รางวัลขนมหวานทองคำ
                  </span>
                  <span className="text-lg font-black text-amber-950 font-mono">
                    +{earnedCandies} 🍬
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-800/60 block font-semibold">
                    คอมโบสูงสุด
                  </span>
                  <span className="text-lg font-black text-amber-950 font-mono">
                    {maxCombo} ชิ้น 🔥
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={shareGame}
                  className="flex-1 py-2.5 rounded-full border-2 border-amber-200 hover:bg-amber-50 text-amber-900 font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>แชร์ความฟินลงโซเชียล</span>
                </button>
                <button
                  onClick={nextLevel}
                  className="flex-1 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <span>ด่านถัดไป</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Social Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-amber-900/10 shadow-2xl relative"
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center">
                <Share2 className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-amber-900">
                  แชร์ความหวานอวดเพื่อน ๆ 🧁
                </h3>
                <p className="text-xs text-amber-800/70 mt-1 mb-4">
                  ก็อปปี้แคปชันเก๋ ๆ โดนใจ แล้วโพสต์อวดความเป๊ะของคุณได้เลย!
                </p>
                
                {/* Randomly generated cute captions from the caption book */}
                <div className="bg-amber-50/70 border border-amber-200/50 rounded-2xl p-4 text-left text-xs md:text-sm text-amber-950 font-medium italic space-y-2.5 mb-5 relative">
                  <p>
                    "ฉันเพิ่งผ่านด่าน {progress.currentLevel}: {levelConfig.themeName} ({levelConfig.difficulty}) มาได้! ด้วยคะแนนคอมโบโหด {maxCombo} ชิ้นซ้อน ใครแน่จริงมาแข่งแยกขนมกับฉันได้เลย! 🍭"
                  </p>
                  <p className="text-[11px] text-amber-800/60 font-sans border-t border-amber-900/5 pt-2">
                    #SweetMatch #เกมจับคู่สีขนมหวานสุดผ่อนคลาย #มาปั้นความหวานกัน
                  </p>
                </div>

                <button
                  onClick={() => {
                    audio.playTap();
                    const textToCopy = `ฉันเพิ่งผ่านด่าน ${progress.currentLevel}: ${levelConfig.themeName} (${levelConfig.difficulty}) มาได้! ด้วยคะแนนคอมโบโหด ${maxCombo} ชิ้นซ้อน ใครแน่จริงมาแข่งแยกขนมกับฉันได้เลย! 🍭 เล่นได้เลยที่ Sweet Match!`;
                    navigator.clipboard.writeText(textToCopy);
                    showQuote('คัดลอกแคปชันแชร์ไปยังคลิปบอร์ดแล้ว! 📋✨', true);
                    setShowShareModal(false);
                  }}
                  className="w-full py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-sm text-xs cursor-pointer"
                >
                  คัดลอกแคปชันแชร์ลงโซเชียล
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rewarded Ad modal component for Revival */}
      <RewardedAdModal
        isOpen={isAdOpen}
        rewardType="revive"
        onComplete={handleAdReviveComplete}
        onClose={() => setIsAdOpen(false)}
      />
    </motion.div>
  );
}
