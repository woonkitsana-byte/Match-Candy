/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Store, ChevronLeft, Sparkles, Coins, Check, Lock } from 'lucide-react';
import { UserProgress, ShopTheme, PlateStyle } from '../types';
import { audio } from '../utils/audio';

interface CustomizeShopProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onBack: () => void;
}

export const SHOP_THEMES: ShopTheme[] = [
  {
    id: 'cozy_cafe',
    name: 'คาเฟ่ละมุนอุ่นอิง (Cozy Cafe)',
    description: 'ธีมร้านขนมสุดอบอุ่นสไตล์มูจิ โทนสีไม้ธรรมชาติ แสงแดดส่องรำไรผ่านม่านโปร่ง ผ่อนคลายหัวใจสูงสุด 🌿',
    price: 0,
    bgGradient: 'from-[#fbf8f3] via-[#f5ede3] to-[#eaddcd]',
    cardBg: 'bg-amber-50/80',
    textColor: 'text-amber-900',
    accentColor: '#b45309',
  },
  {
    id: 'cosmic_space',
    name: 'คาเฟ่อวกาศล่องลอย (Cosmic Cafe)',
    description: 'ร้านกาแฟห้วงจักรวาลสีน้ำเงินเข้มลึก ล้อมรอบด้วยดวงดาวระยิบระยับและเนบิวลาสีม่วงสุดตระการตา ✨',
    price: 100,
    bgGradient: 'from-[#0f172a] via-[#1e1b4b] to-[#0c0a1c]',
    cardBg: 'bg-indigo-950/80',
    textColor: 'text-indigo-100',
    accentColor: '#6366f1',
  },
  {
    id: 'sakura_garden',
    name: 'สวนซากุระพริ้วไหว (Sakura Garden)',
    description: 'ดื่มด่ำกับบรรยากาศสวนญี่ปุ่นใต้ร่มเงาไม้สีชมพูละมุนตา พร้อมกลีบดอกไม้ร่วงหล่นแสนโรแมนติก 🌸',
    price: 200,
    bgGradient: 'from-[#fff0f3] via-[#ffe3e8] to-[#ffd0d6]',
    cardBg: 'bg-rose-50/80',
    textColor: 'text-rose-900',
    accentColor: '#f43f5e',
  },
  {
    id: 'retro_arcade',
    name: 'ย้อนวัยเรโทรอาเขต (Neon Retro)',
    description: 'จัดจ้านมีสไตล์กับธีมห้องเกมนีออนสไตล์ 80s ลายเส้นตะแกรงเรืองแสงและดวงอาทิตย์สังเคราะห์สุดซ่าส์ 👾',
    price: 300,
    bgGradient: 'from-[#080510] via-[#12072b] to-[#05030a]',
    cardBg: 'bg-fuchsia-950/80',
    textColor: 'text-fuchsia-100',
    accentColor: '#d946ef',
  },
];

export const PLATE_STYLES: PlateStyle[] = [
  {
    id: 'ceramic',
    name: 'ถ้วยเซรามิกพอร์ซเลนดั้งเดิม',
    description: 'ถ้วยเซรามิกสีขาวขอบวาดลวดลายสีกรมท่าคลาสสิก ให้ความรู้สึกสงบนิ่ง',
    price: 0,
    borderClass: 'border-blue-700/60 shadow-sm',
    bgClass: 'bg-white',
  },
  {
    id: 'wooden',
    name: 'จานไม้มินิมอลเนื้อดี',
    description: 'ทำจากเนื้อไม้เมเปิ้ลแท้ขัดนุ่ม ผิวสัมผัสออร์แกนิกหอมกลิ่นป่าสน',
    price: 70,
    borderClass: 'border-amber-800/40 shadow-sm',
    bgClass: 'bg-amber-100/90',
  },
  {
    id: 'crystal',
    name: 'ถาดคริสตัลเจียระไนหรูหรา',
    description: 'แก้วเจียระไนโปร่งใส สะท้อนแสงเป็นประกายรุ้งฟริ้งฟรุ้งฟริ้ง',
    price: 150,
    borderClass: 'border-cyan-200/80 shadow-md',
    bgClass: 'bg-cyan-50/50 backdrop-blur-sm',
  },
  {
    id: 'golden',
    name: 'ถาดทองคำโบราณจักรพรรดิ',
    description: 'ถาดโลหะชุบทองคำแท้เปล่งออร่า ขอบแกะสลักสวยงาม เพิ่มโชคลาภ',
    price: 250,
    borderClass: 'border-yellow-500/80 shadow-lg shadow-yellow-500/10',
    bgClass: 'bg-gradient-to-r from-yellow-100 to-yellow-200',
  },
];

export default function CustomizeShop({ progress, onUpdateProgress, onBack }: CustomizeShopProps) {
  
  const buyOrSelectTheme = (theme: ShopTheme) => {
    audio.playTap();
    const isUnlocked = progress.unlockedThemes.includes(theme.id);

    if (isUnlocked) {
      // Just select
      onUpdateProgress((prev) => ({
        ...prev,
        activeThemeId: theme.id,
      }));
    } else {
      // Try to buy
      if (progress.candies >= theme.price) {
        onUpdateProgress((prev) => ({
          ...prev,
          candies: prev.candies - theme.price,
          unlockedThemes: [...prev.unlockedThemes, theme.id],
          activeThemeId: theme.id,
        }));
        audio.playReveal(); // success chime variation
      } else {
        audio.playFail(); // error buzz
      }
    }
  };

  const buyOrSelectPlate = (plate: PlateStyle) => {
    audio.playTap();
    const isUnlocked = progress.unlockedPlates.includes(plate.id);

    if (isUnlocked) {
      // Just select
      onUpdateProgress((prev) => ({
        ...prev,
        activePlateId: plate.id,
      }));
    } else {
      // Try to buy
      if (progress.candies >= plate.price) {
        onUpdateProgress((prev) => ({
          ...prev,
          candies: prev.candies - plate.price,
          unlockedPlates: [...prev.unlockedPlates, plate.id],
          activePlateId: plate.id,
        }));
        audio.playReveal();
      } else {
        audio.playFail();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full max-w-5xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl border border-amber-900/10 shadow-2xl p-6 md:p-8 z-10"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-amber-900/10 pb-6 mb-6 gap-4">
        <button
          onClick={() => {
            audio.playTap();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium transition-colors cursor-pointer text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>กลับหน้าแรก</span>
        </button>

        <div className="flex items-center gap-3">
          <Store className="w-8 h-8 text-amber-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-amber-900 font-sans tracking-tight">
            ตกแต่งร้านคาเฟ่ขนมหวาน ☕
          </h1>
        </div>

        {/* Currency Box */}
        <div className="flex items-center gap-2 bg-amber-50 border border-yellow-200 px-4 py-1.5 rounded-full shadow-sm">
          <Coins className="w-5 h-5 text-yellow-500 fill-yellow-400" />
          <span className="text-amber-900 font-mono text-base font-bold">
            {progress.candies}
          </span>
          <span className="text-xs text-amber-700/80 font-medium">ลูกกวาดทอง</span>
        </div>
      </div>

      <div className="space-y-10">
        {/* Section 1: Background Themes */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
            <h2 className="text-lg md:text-xl font-bold text-amber-900">
              1. สไตล์บรรยากาศพื้นหลังร้าน (Cafe Background)
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SHOP_THEMES.map((theme) => {
              const isUnlocked = progress.unlockedThemes.includes(theme.id);
              const isActive = progress.activeThemeId === theme.id;
              const canAfford = progress.candies >= theme.price;

              return (
                <div
                  key={theme.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-[160px] relative ${
                    isActive
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400'
                      : 'border-amber-200/50 bg-white hover:border-amber-300'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-amber-900 text-base flex items-center gap-1.5">
                        {theme.name}
                      </h3>
                      {isActive && (
                        <span className="text-xs font-semibold bg-amber-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> ใช้งานอยู่
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-800/80 mt-2 leading-relaxed">
                      {theme.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-amber-900/5 pt-3">
                    <span className="text-xs font-mono text-amber-600">
                      {isUnlocked ? 'ปลดล็อกเรียบร้อย' : `ราคา: ${theme.price} ลูกกวาด`}
                    </span>

                    <button
                      onClick={() => buyOrSelectTheme(theme)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        isActive
                          ? 'bg-amber-200 text-amber-800 cursor-default'
                          : isUnlocked
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                          : canAfford
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm flex items-center gap-1'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed flex items-center gap-1'
                      }`}
                      disabled={isActive || (!isUnlocked && !canAfford)}
                    >
                      {!isUnlocked && <Lock className="w-3 h-3" />}
                      {isActive ? 'ใช้งานอยู่' : isUnlocked ? 'เลือกใช้งาน' : `ซื้อด้วย ${theme.price}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Plate Styles */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
            <h2 className="text-lg md:text-xl font-bold text-amber-900">
              2. ถ้วยและจานรองรับขนม (Plate & Cup Style)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PLATE_STYLES.map((plate) => {
              const isUnlocked = progress.unlockedPlates.includes(plate.id);
              const isActive = progress.activePlateId === plate.id;
              const canAfford = progress.candies >= plate.price;

              return (
                <div
                  key={plate.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-[160px] relative ${
                    isActive
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400'
                      : 'border-amber-200/50 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Tiny representation of the plate style */}
                    <div className={`w-14 h-14 rounded-full border-2 ${plate.borderClass} ${plate.bgClass} flex items-center justify-center shrink-0`}>
                      <div className="w-10 h-10 rounded-full border border-dashed border-amber-900/10 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-amber-400/20" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-1">
                        <h3 className="font-bold text-amber-900 text-sm">
                          {plate.name}
                        </h3>
                        {isActive && (
                          <span className="text-[10px] font-semibold bg-amber-500 text-white px-2 py-0.5 rounded-full shrink-0">
                            ใช้งานอยู่
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-800/80 mt-1.5 leading-normal">
                        {plate.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-amber-900/5 pt-3">
                    <span className="text-xs font-mono text-amber-600">
                      {isUnlocked ? 'ปลดล็อกเรียบร้อย' : `ราคา: ${plate.price} ลูกกวาด`}
                    </span>

                    <button
                      onClick={() => buyOrSelectPlate(plate)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        isActive
                          ? 'bg-amber-200 text-amber-800 cursor-default'
                          : isUnlocked
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                          : canAfford
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm flex items-center gap-1'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed flex items-center gap-1'
                      }`}
                      disabled={isActive || (!isUnlocked && !canAfford)}
                    >
                      {!isUnlocked && <Lock className="w-3 h-3" />}
                      {isActive ? 'ใช้งานอยู่' : isUnlocked ? 'เลือกใช้งาน' : `ซื้อด้วย ${plate.price}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
