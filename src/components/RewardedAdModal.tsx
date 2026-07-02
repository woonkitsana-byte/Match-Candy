import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Volume2, VolumeX, X, Gift, Coins, Sparkles, Trophy, Star } from 'lucide-react';
import { audio } from '../utils/audio';

interface RewardedAdModalProps {
  isOpen: boolean;
  rewardType: 'revive' | 'candies';
  onComplete: () => void;
  onClose: () => void;
}

interface MiniAdCandy {
  id: number;
  x: number;
  y: number;
  color: string;
  emoji: string;
  scale: number;
}

export default function RewardedAdModal({ isOpen, rewardType, onComplete, onClose }: RewardedAdModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [adStarted, setAdStarted] = useState(false);
  const [adMuted, setAdMuted] = useState(false);
  const [points, setPoints] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [candiesList, setCandiesList] = useState<MiniAdCandy[]>([]);

  // Initialize interactive falling candy bubbles for the playable ad
  useEffect(() => {
    if (isOpen && adStarted && !isFinished) {
      const colors = ['#f43f5e', '#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'];
      const emojis = ['🍬', '🍭', '🧁', '🍩', '🍪', '🍫'];
      const interval = setInterval(() => {
        setCandiesList((prev) => {
          if (prev.length > 10) return prev;
          return [
            ...prev,
            {
              id: Date.now() + Math.random(),
              x: 10 + Math.random() * 80, // percentage
              y: -10,
              color: colors[Math.floor(Math.random() * colors.length)],
              emoji: emojis[Math.floor(Math.random() * emojis.length)],
              scale: 0.8 + Math.random() * 0.5,
            },
          ];
        });
      }, 400);

      return () => clearInterval(interval);
    }
  }, [isOpen, adStarted, isFinished]);

  // Handle candy bubble movement
  useEffect(() => {
    if (isOpen && adStarted && !isFinished) {
      const animationFrame = setInterval(() => {
        setCandiesList((prev) =>
          prev
            .map((c) => ({ ...c, y: c.y + 1.5 }))
            .filter((c) => c.y < 110)
        );
      }, 16);

      return () => clearInterval(animationFrame);
    }
  }, [isOpen, adStarted, isFinished]);

  // Countdown timer for reward
  useEffect(() => {
    if (isOpen && adStarted && countdown > 0 && !isFinished) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isFinished) {
      setIsFinished(true);
      audio.playVictory();
    }
  }, [isOpen, adStarted, countdown, isFinished]);

  if (!isOpen) return null;

  const handleStartAd = () => {
    audio.playTap();
    setAdStarted(true);
  };

  const handlePopCandy = (id: number) => {
    if (adMuted) {
      // play silent click/tap
    } else {
      audio.playSuccess();
    }
    setPoints((p) => p + 10);
    setCandiesList((prev) => prev.filter((c) => c.id !== id));
  };

  const handleTryClose = () => {
    audio.playTap();
    if (!isFinished) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmExit = () => {
    audio.playFail();
    setShowExitConfirm(false);
    onClose();
  };

  const handleClaimReward = () => {
    audio.playSuccess();
    onComplete();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans">
        
        {/* Exit Confirmation Dialog */}
        {showExitConfirm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bg-white border border-rose-100 rounded-3xl p-6 max-w-xs text-center shadow-2xl z-50 mx-4"
          >
            <h4 className="text-base font-black text-amber-900 mb-2">ยกเลิกการชมโฆษณา? 🥺</h4>
            <p className="text-xs text-amber-800/80 mb-5 leading-relaxed">
              หากปิดตอนนี้ คุณจะไม่ได้รับสิทธิ์ {rewardType === 'revive' ? 'ชุบชีวิตเล่นด่านเดิมต่อ' : 'รับฟรี 100 เหรียญอมยิ้ม'} นะคะ!
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2 rounded-full bg-amber-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                ดูต่อเพื่อรางวัล
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 py-2 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                ยอมแพ้/ปิดเลย
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="relative bg-gradient-to-b from-purple-950 via-indigo-950 to-slate-950 w-full max-w-sm rounded-3xl overflow-hidden border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col h-[520px]"
        >
          {/* Header Controls */}
          <div className="absolute top-4 inset-x-4 flex justify-between items-center z-30">
            {/* Status Indicator */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-white tracking-wider uppercase">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              <span>โฆษณาสนับสนุนสปอนเซอร์</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sound Toggle */}
              {adStarted && !isFinished && (
                <button
                  onClick={() => setAdMuted(!adMuted)}
                  className="p-1.5 rounded-full bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer border border-white/5"
                >
                  {adMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              )}
              {/* Close Button */}
              <button
                onClick={handleTryClose}
                className="p-1.5 rounded-full bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer border border-white/5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Core Content Viewports */}
          {!adStarted ? (
            /* Ad Entry Screen */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)] pointer-events-none" />
              
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-400/40 text-purple-400 mb-5 animate-pulse">
                <Gift className="w-9 h-9" />
              </div>

              <h3 className="text-lg font-black tracking-tight text-white mb-2">
                {rewardType === 'revive' ? '🎬 ชุบชีวิตด้วยการชมโฆษณา!' : '🎬 ชมโฆษณารับเหรียญหวานฟรี!'}
              </h3>
              <p className="text-xs text-purple-200/70 max-w-xs mx-auto mb-6 leading-relaxed">
                {rewardType === 'revive' 
                  ? 'ชมมินิสปอตสั้น ๆ 5 วินาที เพื่อฟื้นชีพกลับมาสู้ต่อในรอบเดิมได้ทันที โดยคะแนนไม่รีเซ็ต!' 
                  : 'ช่วยสนับสนุนผู้พัฒนาด้วยการชมสปอตสั้น ๆ 5 วินาที แลกรับ 100 เหรียญอมยิ้มทองคำฟรีทันที!'}
              </p>

              <button
                onClick={handleStartAd}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs md:text-sm shadow-[0_4px_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center gap-2 tracking-wider transform hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>รับชมเลยตอนนี้ (5 วินาที)</span>
              </button>

              <span className="text-[10px] text-white/40 mt-8 font-mono">
                *ไม่มีผลเสียต่อข้อมูลของคุณ*
              </span>
            </div>
          ) : !isFinished ? (
            /* Interactive Playable Ad Game Play Sandbox */
            <div className="flex-1 flex flex-col justify-between p-5 text-white relative overflow-hidden select-none">
              
              {/* Playable Ad Stage Game Header */}
              <div className="pt-10 flex justify-between items-center z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">แอปแนะนำน่ารักสุดใจ</span>
                  <h4 className="text-sm font-black text-white flex items-center gap-1">
                    <span>🍭 Sweet Pop Saga</span>
                    <span className="text-[9px] bg-amber-500 px-1 py-0.2 rounded font-extrabold text-black font-mono">AD</span>
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur border border-white/10 px-3 py-1.5 rounded-full font-mono text-xs">
                  <span className="text-amber-400 font-bold">คะแนน:</span>
                  <span className="font-bold text-white">{points}</span>
                </div>
              </div>

              {/* Playable Instructions Banner */}
              <div className="absolute top-24 inset-x-4 bg-white/5 backdrop-blur-sm rounded-xl p-2.5 border border-white/10 text-center z-10 pointer-events-none animate-bounce">
                <p className="text-[10px] text-yellow-300 font-bold flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <span>ลองเล่นดูสิ! จิ้มป๊อปขนมหวานที่ลอยตกมาเพื่อรับคะแนน</span>
                </p>
              </div>

              {/* Falling Candies Sandbox container */}
              <div className="flex-1 relative w-full overflow-hidden my-4">
                <AnimatePresence>
                  {candiesList.map((candy) => (
                    <motion.button
                      key={candy.id}
                      onClick={() => handlePopCandy(candy.id)}
                      style={{
                        left: `${candy.x}%`,
                        top: `${candy.y}%`,
                        backgroundColor: candy.color,
                        transform: `scale(${candy.scale})`,
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: candy.scale }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg ring-2 ring-white/20 cursor-pointer hover:brightness-110 active:scale-90"
                    >
                      {candy.emoji}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {/* Countdown Timer overlay bottom bar */}
              <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-3 z-10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center font-mono font-black text-amber-400 text-sm">
                    {countdown}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/50">โฆษณากำลังรัน</span>
                    <span className="text-[11px] font-bold text-purple-200">อดใจรออีกสักครู่เพื่อรับสิทธิ์...</span>
                  </div>
                </div>
                <div className="text-[10px] text-purple-300 font-black tracking-wider uppercase bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded">
                  {countdown > 0 ? `เหลืออีก ${countdown} วิ` : 'เสร็จสมบูรณ์!'}
                </div>
              </div>
            </div>
          ) : (
            /* Successful Ad Completed screen */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15)_0%,transparent_70%)] pointer-events-none" />
              
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.1, 1] }}
                className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-400/40 text-emerald-400 mb-6 relative"
              >
                <Trophy className="w-10 h-10 text-emerald-400" />
                <div className="absolute -top-1 -right-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-bounce" />
                </div>
              </motion.div>

              <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-3">
                สำเร็จเรียบร้อย!
              </span>

              <h3 className="text-xl font-black text-white mb-2">
                ได้รับสิทธิ์เคลมรางวัลแล้ว! 🎉
              </h3>
              
              {rewardType === 'revive' ? (
                <p className="text-xs text-slate-300 max-w-xs mx-auto mb-6 leading-relaxed">
                  สิทธิ์ชุบชีวิตพร้อมทำงานแล้ว! คุณจะได้ฟื้นหัวใจทั้งหมดกลับมาเต็มสูบ และกลับไปลุยรอบเดิมต่อเพื่อเอาชนะโดยรักษาด่านปัจจุบันไว้!
                </p>
              ) : (
                <p className="text-xs text-slate-300 max-w-xs mx-auto mb-6 leading-relaxed">
                  เหรียญหวานของคุณกำลังพร้อมโอนย้าย! กดปุ่มรับเพื่อรับ <strong className="text-yellow-400 font-bold font-mono">100 🍬</strong> ทันที
                </p>
              )}

              <button
                onClick={handleClaimReward}
                className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs md:text-sm shadow-[0_4px_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 tracking-wide transform hover:scale-102 active:scale-98"
              >
                <span>กดปุ่มเพื่อรับรางวัลสิทธิ์นี้</span>
              </button>
            </div>
          )}

          {/* Elegant Footer Slogan */}
          <div className="py-3.5 bg-black/60 border-t border-white/5 text-center text-[10px] text-white/30 tracking-wider">
            🍭 ขอบคุณที่ร่วมสนับสนุนคาเฟ่ขนมหวานสุดคิวท์ของเรา
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
