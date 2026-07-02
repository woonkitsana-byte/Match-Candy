/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Trophy,
  BookOpen,
  Store,
  Play,
  Volume2,
  VolumeX,
  Compass,
  Award,
  ChevronLeft,
  Flame,
  Coffee,
  Candy,
  HelpCircle,
  Coins,
  Gift
} from 'lucide-react';
import { UserProgress, DessertType } from './types';
import BackgroundTheme from './components/BackgroundTheme';
import BakeryCollection from './components/BakeryCollection';
import CustomizeShop, { SHOP_THEMES, PLATE_STYLES } from './components/CustomizeShop';
import GameArea from './components/GameArea';
import DessertRenderer from './components/DessertRenderer';
import { audio } from './utils/audio';
import RewardedAdModal from './components/RewardedAdModal';

const STORAGE_KEY = 'sweet_match_user_progress_v2';

const WELCOME_QUOTES = [
  'ชีวิตมันขม... แวะมาเติมความนมเนยในเกมเราก่อนนะ 🧁',
  'วันนี้เหนื่อยไหม? มาแยกสีขนมให้ใจฟูกันเถอะ ✨',
  'ความรักก็เหมือนขนมหวาน... ต้องเลือกให้ถูกคู่ถึงจะฟิน 💖',
  'สวัสดีต้อนรับสู่ดินแดนที่ไม่มีแคลอรี มีแต่ความน่ารักสุดหัวใจ! 🍭',
  'ชาร์จพลังบวกสไตล์มูจิ แยกสีขนมเพลิน ๆ ผ่อนคลายสมองกัน ☕',
];

const INITIAL_PROGRESS: UserProgress = {
  currentLevel: 1,
  highestLevel: 1,
  stars: {},
  candies: 45, // start with a small bonus so they can play around
  unlockedThemes: ['cozy_cafe'],
  unlockedPlates: ['ceramic'],
  activeThemeId: 'cozy_cafe',
  activePlateId: 'ceramic',
  unlockedDesserts: ['macaron'], // start with macaron unlocked in book
};

export default function App() {
  // Navigation View: 'home' | 'game' | 'level_select' | 'collection' | 'shop'
  const [view, setView] = useState<'home' | 'game' | 'level_select' | 'collection' | 'shop'>('home');
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [welcomeQuote, setWelcomeQuote] = useState('');
  const [muted, setMuted] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [levelPage, setLevelPage] = useState(0);
  const [isAdOpen, setIsAdOpen] = useState(false);

  const handleAdRewardComplete = () => {
    updateProgress((prev) => ({
      ...prev,
      candies: prev.candies + 100,
    }));
    setIsAdOpen(false);
    audio.playSuccess();
  };

  // Sync levelPage to the page containing highest level
  useEffect(() => {
    if (progress.highestLevel) {
      setLevelPage(Math.floor((progress.highestLevel - 1) / 30));
    }
  }, [progress.highestLevel]);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.currentLevel === 'number') {
          setProgress(parsed);
        }
      }
    } catch (e) {
      console.warn('LocalStorage load error, using initial defaults', e);
    }
    // Set a random cute welcoming quote on load
    setWelcomeQuote(WELCOME_QUOTES[Math.floor(Math.random() * WELCOME_QUOTES.length)]);
  }, []);

  // Save progress on state changes
  const updateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('LocalStorage save error', e);
      }
      return next;
    });
  };

  const startBgmAndEnterGame = () => {
    audio.playTap();
    audio.startBgm();
    setView('game');
  };

  const handleMuteToggle = () => {
    const isMuted = audio.toggleMute();
    setMuted(isMuted);
  };

  // Get current active theme details
  const activeTheme = SHOP_THEMES.find((t) => t.id === progress.activeThemeId) || SHOP_THEMES[0];
  const activePlate = PLATE_STYLES.find((p) => p.id === progress.activePlateId) || PLATE_STYLES[0];

  return (
    <div className={`relative min-h-screen w-full font-sans transition-colors duration-500 overflow-x-hidden flex flex-col justify-between ${activeTheme.textColor}`}>
      {/* 1. Global Animated Background Backdrops */}
      <BackgroundTheme themeId={progress.activeThemeId} />

      {/* Floating Header Area (Coin counter / Mute helper) */}
      <header className="relative w-full max-w-5xl mx-auto px-4 pt-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-sm">
          <Coffee className="w-4 h-4 text-amber-700" />
          <span className="text-xs font-semibold tracking-tight">คาเฟ่ขนมหวานสุดคิวท์</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Candy Coin Display */}
          <div className="flex items-center gap-1.5 bg-white/75 backdrop-blur-md border border-yellow-200 px-3.5 py-1.5 rounded-full shadow-sm">
            <Coins className="w-4 h-4 text-yellow-500 fill-yellow-400" />
            <span className="font-mono font-black text-sm text-amber-950">
              {progress.candies}
            </span>
          </div>

          {/* Sound Control */}
          <button
            onClick={handleMuteToggle}
            className="p-2.5 rounded-full bg-white/70 hover:bg-white/90 border border-white/20 shadow-sm text-amber-950 transition-all cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Main Center Routing Canvas */}
      <main className="flex-1 w-full flex items-center justify-center px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* MAIN HOME DASHBOARD */}
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl text-center flex flex-col items-center gap-8"
            >
              {/* Sweet Title Hero Block */}
              <div className="space-y-4">
                <motion.div
                  initial={{ rotate: -5, scale: 0.9 }}
                  animate={{ rotate: [0, 2, -2, 0], scale: 1 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-pink-500 to-yellow-500 text-white font-extrabold px-4 py-1.5 rounded-full shadow-lg text-xs tracking-wider uppercase"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-white animate-spin-slow" />
                  <span>CASUAL RELAXATION GAME</span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-sans tracking-tight leading-none">
                  <span className="bg-gradient-to-b from-amber-800 to-amber-950 bg-clip-text text-transparent">Sweet Match</span>
                  <br />
                  <span className="text-amber-800/80 font-medium text-2xl md:text-3xl mt-1 block">เกมจับคู่สีขนมหวานสุดคิ้วท์</span>
                </h1>

                {/* Rolled encouragement caption box */}
                <div className="bg-white/80 backdrop-blur-sm border border-amber-900/10 rounded-2xl py-3 px-5 max-w-lg mx-auto shadow-sm">
                  <p className="text-xs md:text-sm italic font-medium leading-relaxed">
                    "{welcomeQuote}"
                  </p>
                </div>
              </div>

              {/* Decorative Animated Floating Pastry Row */}
              <div className="flex gap-6 justify-center items-center h-20">
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                  <DessertRenderer type="macaron" primaryColor="#ff85a1" secondaryColor={null} isMystery={false} isRevealed={true} size={48} />
                </motion.div>
                <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
                  <DessertRenderer type="lookchup" primaryColor="#f59e0b" secondaryColor={null} isMystery={false} isRevealed={true} size={48} />
                </motion.div>
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
                  <DessertRenderer type="donut" primaryColor="#ec4899" secondaryColor={null} isMystery={false} isRevealed={true} size={48} />
                </motion.div>
                <motion.div animate={{ y: [4, -4, 4] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}>
                  <DessertRenderer type="mochi" primaryColor="#86efac" secondaryColor={null} isMystery={false} isRevealed={true} size={48} />
                </motion.div>
              </div>

              {/* Dashboard Action Hub */}
              <div className="w-full max-w-sm flex flex-col gap-3.5">
                {/* Play Button */}
                <button
                  onClick={startBgmAndEnterGame}
                  className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>เริ่มปั้นขนม (ด่าน {progress.currentLevel})</span>
                </button>

                {/* Level select and Recipes/Decorate buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      audio.playTap();
                      setView('level_select');
                    }}
                    className="py-3 px-4 rounded-full bg-white/90 hover:bg-white border border-amber-900/10 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                  >
                    <Compass className="w-4 h-4 text-amber-600" />
                    <span>เลือกด่านเล่น</span>
                  </button>

                  <button
                    onClick={() => {
                      audio.playTap();
                      setView('collection');
                    }}
                    className="py-3 px-4 rounded-full bg-white/90 hover:bg-white border border-amber-900/10 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                  >
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>สมุดสะสมสูตร</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    audio.playTap();
                    setView('shop');
                  }}
                  className="w-full py-3.5 px-4 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                >
                  <Store className="w-4 h-4 text-amber-700" />
                  <span>ปรับแต่งธีมร้านคาเฟ่ ☕</span>
                </button>

                {/* Watch Ad for free candies */}
                <button
                  onClick={() => {
                    audio.playTap();
                    setIsAdOpen(true);
                  }}
                  className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 hover:brightness-105 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 animate-pulse"
                >
                  <Gift className="w-4 h-4 fill-white text-yellow-300 animate-bounce" />
                  <span>ดูโฆษณารับ 100 อมยิ้มฟรี! 🍬</span>
                </button>

                {/* How to Play Help button */}
                <button
                  onClick={() => {
                    audio.playTap();
                    setShowHowToPlay(true);
                  }}
                  className="text-xs text-amber-800/60 hover:text-amber-900 underline font-semibold flex items-center justify-center gap-1 cursor-pointer mt-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>แนะนำกติกาการแยกสีขนม</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ACTIVE LEVEL SELECT SCREEN */}
          {view === 'level_select' && (
            <motion.div
              key="level_select"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl border border-amber-900/10 shadow-2xl p-6 md:p-8"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-amber-900/10 pb-5 mb-6">
                <button
                  onClick={() => {
                    audio.playTap();
                    setView('home');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>กลับ</span>
                </button>
                <h2 className="text-xl md:text-2xl font-extrabold text-amber-900 flex items-center gap-2">
                  <Compass className="w-6 h-6 text-amber-600 animate-spin-slow" />
                  <span>เลือกด่านเพื่อลิ้มรสชาติขนม</span>
                </h2>
                <div className="w-12" /> {/* alignment spacer */}
              </div>

              {/* Levels Grid layout */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 border-b border-amber-900/5 pb-3 mb-4">
                <p className="text-xs text-amber-800/70 font-medium text-center sm:text-left">
                  💡 ด่านจะเพิ่มความท้าทายและความเร็วเรื่อย ๆ เล่นได้ยาวนานไม่มีที่สิ้นสุด! ⭐
                </p>
                <div className="flex items-center gap-1.5 bg-amber-100/60 px-3 py-1 rounded-full text-[11px] font-bold text-amber-900 font-mono">
                  <span>หน้า {levelPage + 1} / ด่าน {levelPage * 30 + 1} - {levelPage * 30 + 30}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                {Array.from({ length: 30 }).map((_, i) => {
                  const lvlNum = levelPage * 30 + i + 1;
                  const isUnlocked = lvlNum <= progress.highestLevel;
                  const earnedStars = progress.stars[lvlNum] || 0;

                  // Dynamic indicator emojis depending on infinite formula theme cycle
                  const themeIndex = (lvlNum - 1) % 4;
                  const themeEmoji = themeIndex === 0 ? '🧁' : themeIndex === 1 ? '🍬' : themeIndex === 2 ? '🥥' : '🎁';

                  return (
                    <button
                      key={lvlNum}
                      onClick={() => {
                        if (isUnlocked) {
                          audio.playTap();
                          updateProgress((prev) => ({ ...prev, currentLevel: lvlNum }));
                          setView('game');
                        } else {
                          audio.playFail();
                        }
                      }}
                      className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-between min-h-[85px] relative ${
                        isUnlocked
                          ? 'bg-amber-50/50 hover:bg-amber-100 border-amber-200/60 cursor-pointer shadow-sm hover:scale-103'
                          : 'bg-gray-100 border-gray-200/40 opacity-50 cursor-not-allowed'
                      }`}
                      disabled={!isUnlocked}
                    >
                      {/* Level Number */}
                      <span className="text-xs font-mono font-black text-amber-900">
                        {lvlNum}
                      </span>

                      {/* Level Theme Icon / Visual indicator */}
                      <span className="text-xs text-amber-800/60 font-semibold block mt-0.5">
                        {themeEmoji}
                      </span>

                      {/* Stars indicator under Level number */}
                      <div className="flex gap-0.5 mt-1 justify-center">
                        {[1, 2, 3].map((s) => (
                          <Award
                             key={s}
                             className={`w-3 h-3 ${
                               s <= earnedStars ? 'text-yellow-500 fill-yellow-400' : 'text-gray-300'
                             }`}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Endless Pagination Row */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-amber-900/10">
                <button
                  onClick={() => {
                    audio.playTap();
                    setLevelPage((p) => Math.max(0, p - 1));
                  }}
                  disabled={levelPage === 0}
                  className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                    levelPage > 0
                      ? 'bg-white hover:bg-amber-50 text-amber-900 border-amber-200 cursor-pointer'
                      : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                  }`}
                >
                  ◀️ หน้าก่อนหน้า
                </button>

                <span className="text-xs font-bold text-amber-900/60 font-sans">
                  หน้า {levelPage + 1}
                </span>

                <button
                  onClick={() => {
                    audio.playTap();
                    setLevelPage((p) => p + 1);
                  }}
                  disabled={progress.highestLevel < (levelPage * 30 + 1)}
                  className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                    progress.highestLevel >= (levelPage * 30 + 1)
                      ? 'bg-white hover:bg-amber-50 text-amber-900 border-amber-200 cursor-pointer'
                      : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                  }`}
                >
                  หน้าถัดไป ▶️
                </button>
              </div>
            </motion.div>
          )}

          {/* PLAYGROUND GAME AREA */}
          {view === 'game' && (
            <GameArea
              progress={progress}
              onUpdateProgress={updateProgress}
              onBack={() => setView('home')}
              plateStyleBorder={activePlate.borderClass}
              plateStyleBg={activePlate.bgClass}
            />
          )}

          {/* BAKERY COLLECTION BOOK */}
          {view === 'collection' && (
            <BakeryCollection
              unlockedDesserts={progress.unlockedDesserts}
              onBack={() => setView('home')}
            />
          )}

          {/* CUSTOMIZE CAFE SHOP */}
          {view === 'shop' && (
            <CustomizeShop
              progress={progress}
              onUpdateProgress={updateProgress}
              onBack={() => setView('home')}
            />
          )}
        </AnimatePresence>
      </main>

      {/* 3. Global Footer (Caption Credits and Silent branding layout) */}
      <footer className="relative py-4 text-center text-[10px] text-amber-900/40 font-semibold z-10">
        © Sweet Match. Crafted with love.
      </footer>

      {/* How to Play Onboarding Overlay */}
      <AnimatePresence>
        {showHowToPlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-center"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-amber-900/10 shadow-2xl relative text-left"
            >
              <h2 className="text-xl font-extrabold text-amber-900 mb-4 flex items-center gap-2">
                <Coffee className="w-6 h-6 text-amber-600" />
                <span>วิธีการทำคะแนนระดับเชฟทอง 🧁</span>
              </h2>

              <div className="text-xs md:text-sm text-amber-950 space-y-3.5 leading-relaxed">
                <div>
                  <h3 className="font-bold text-amber-900">1. โหมดจังหวะ Rhythm Match (แนะนำสำหรับสายขี้เกียจลาก):</h3>
                  <p className="text-amber-800/80 mt-1">
                    เมื่อคุณเห็นขนมบนสายพานเคลื่อนมาตรงกับช่องสีชมพูกลางสายพานเป๊ะ ให้กดที่ปุ่ม "จานสี" ด้านล่างที่มีสีตรงกันทันที ขนมจะตกใส่จานเก็บแต้มอย่างฟิน!
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-amber-900">2. โหมดคลิกและเสิร์ฟ Click & Send (เร็วที่สุด):</h3>
                  <p className="text-amber-800/80 mt-1">
                    หากขี้เกียจจับจังหวะ สามารถใช้วิธีลัดได้ง่าย ๆ ด้วยการจิ้มตัวขนมบนสายพานโดยตรง จากนั้นกดปุ่มจานสีที่ต้องการ ตัวขนมจะโบยบินลงจานทันทีจ้า!
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-amber-900">3. สังเกตดักจับความท้าทายตามช่วงด่าน:</h3>
                  <p className="text-amber-800/80 mt-1">
                    • <b>ด่าน 1-10 (Easy):</b> ขนมเดี่ยว สีหลักสดใส มีเวลาคุ้นมือเพลิน ๆ <br />
                    • <b>ด่าน 11-30 (Medium):</b> ระวังสีพาสเทลคู่แฝด สังเกตเฉดความอ่อนเข้มดี ๆ นะ <br />
                    • <b>ด่าน 31-60 (Hard):</b> ขนมไทยโบราณสองเฉดสี เสิร์ฟคู่กับจานใดจานหนึ่งที่สีตรงกันได้เลย <br />
                    • <b>ด่าน 61+ (Wonderland):</b> เจอกับขนมห่อปริศนา (?) ต้องจิ้มตัวขนมก่อนเพื่อลอกห่อพอยล์ดูสีด้านในก่อนจะกดเสิร์ฟจ้า!
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-amber-900">4. ปลดล็อกร้านคาเฟ่ในฝัน:</h3>
                  <p className="text-amber-800/80 mt-1">
                    สะสมเหรียญลูกกวาดทองคำจากการเล่นผ่านด่าน นำมาสลับซื้อพื้นหลังมูจิ พื้นหลังอวกาศ หรือถาดลายเซรามิก/คริสตัลสุดหรูได้ที่หน้าร้านตกแต่ง!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all text-xs cursor-pointer shadow-sm text-center"
              >
                เข้าใจแล้วจ้า เริ่มเกมกันเลย!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rewarded Ad for 100 Candies */}
      <RewardedAdModal
        isOpen={isAdOpen}
        rewardType="candies"
        onComplete={handleAdRewardComplete}
        onClose={() => setIsAdOpen(false)}
      />
    </div>
  );
}
