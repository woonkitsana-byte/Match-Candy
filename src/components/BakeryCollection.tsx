/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChevronLeft, Lock, Award, BookCheck } from 'lucide-react';
import { DessertType } from '../types';
import DessertRenderer from './DessertRenderer';
import { audio } from '../utils/audio';

interface BakeryCollectionProps {
  unlockedDesserts: DessertType[];
  onBack: () => void;
}

interface CollectionItemDetail {
  type: DessertType;
  name: string;
  engName: string;
  trivia: string;
  tagline: string;
  difficultyToMake: string;
  ingredients: string[];
  colorHint: string;
}

const COLLECTION_DATA: Record<DessertType, CollectionItemDetail> = {
  macaron: {
    type: 'macaron',
    name: 'มาการอง',
    engName: 'Macaron',
    tagline: 'หวานจนมดตัดพ้อ แต่ถ้าทานคู่กับชาเข้ม ๆ คือสวรรค์ชั้นเจ็ด 🧁',
    trivia: 'ขนมฝรั่งเศสชื่ออิตาเลียนที่ทำจากไข่ขาว น้ำตาล และอัลมอนด์บด มีเสน่ห์ตรงขา (Pied) หรือรอยหยักของฝาขนม และความกรอบนอกนุ่มใน!',
    difficultyToMake: '⭐⭐⭐⭐⭐ (ปราบเซียน)',
    ingredients: ['อัลมอนด์ป่น', 'น้ำตาลไอซิ่ง', 'ไข่ขาว (Meringue)', 'ครีมชีส / ช็อกโกแลตกานาช'],
    colorHint: 'สีชมพูราสเบอร์รี / สีพาสเทลหวานหยด',
  },
  lookchup: {
    type: 'lookchup',
    name: 'ลูกชุบ',
    engName: 'Lookchup',
    tagline: 'ขนมไทยหัวใจโปรตุเกส ปั้นเป็นผลไม้จิ๋ว เงาวับจับใจ 🥭',
    trivia: 'ดัดแปลงมาจากขนม "มาร์ซิปัน" (Marzipan) ของโปรตุเกสในสมัยอยุธยา โดยท้าวทองกีบม้า แต่เปลี่ยนจากเมล็ดอัลมอนด์มาใช้ถั่วเขียวบดของไทยแทน ทำให้ได้เนื้อเนียนหอมมันกลมกล่อม',
    difficultyToMake: '⭐⭐⭐⭐ (ต้องอาศัยฝีมือประณีต)',
    ingredients: ['ถั่วเขียวซีกเลาะเปลือกกวน', 'กะทิสด', 'น้ำตาลทราย', 'ผงวุ้นเจลาตินชุบเงา'],
    colorHint: 'แดงส้มมะม่วงเขียวใบไม้ คัลเลอร์ฟูลสะดุดตา',
  },
  donut: {
    type: 'donut',
    name: 'โดนัทเคลือบน้ำตาล',
    engName: 'Sugar Glazed Donut',
    tagline: 'ขนมที่มีรูตรงกลาง... เพราะคนทำอยากให้มีที่ว่างสำหรับความรัก 🍩',
    trivia: 'มีประวัติยาวนานตั้งแต่ศตวรรษที่ 19 ว่ากันว่าที่ต้องเจาะรูตรงกลางเพื่อให้แป้งด้านในสุกพร้อม ๆ กับด้านนอก ไม่อย่างนั้นข้างในจะดิบเหนียว',
    difficultyToMake: '⭐⭐⭐ (ทำกินเองที่บ้านสบาย ๆ)',
    ingredients: ['แป้งสาลีอเนกประสงค์', 'ยีสต์แห้ง', 'นมสดอุ่น', 'เนยจืด', 'ไอซิ่งเกลซพาสเทล'],
    colorHint: 'สีชมพูสตรอว์เบอร์รี / ช็อกโกแลตเข้มข้น',
  },
  candy: {
    type: 'candy',
    name: 'ลูกกวาดหวานฉ่ำ',
    engName: 'Sweet Hard Candy',
    tagline: 'สีสันสดใสชวนเคี้ยว แต่อมไว้จะฟินและปลอดภัยต่อฟันมากกว่านะ! 🍭',
    trivia: 'ลูกกวาดแบบแข็งโบราณทำจากน้ำตาลเคี่ยวจนเดือดจัดแล้วเทลงบนแท่นหินอ่อนเพื่อปั้นดัดรูปทรง ความสุขวัยเด็กที่ละลายช้า ๆ ในปาก',
    difficultyToMake: '⭐⭐ (ระวังน้ำตาลลวกมือก็พอ)',
    ingredients: ['น้ำตาลทรายขาว', 'แบะแซ (Glucose Syrup)', 'แต่งกลิ่นผลไม้ธรรมชาติ', 'สีผสมอาหารพาสเทล'],
    colorHint: 'ชมพูบาร์บี้ / ฟ้าเทอร์คอยส์ระยิบระยับ',
  },
  khanomtuay: {
    type: 'khanomtuay',
    name: 'ขนมถ้วยตะไล',
    engName: 'Khanom Tuay',
    tagline: 'ชั้นล่างหวานใบเตย ชั้นบนเค็มมันกะทิ เติมเต็มกันลงตัวสุด ๆ 🥥',
    trivia: 'ขนมไทยโบราณที่สะท้อนถึงวิถีพอเพียง ใช้กะทิใบเตยแป้งข้าวเจ้าและหยอดลงในถ้วยดินเผาเล็ก ๆ (ถ้วยตะไล) นึ่งจนสุก กลิ่นหอมฟุ้งจากซึ้งนึ่ง',
    difficultyToMake: '⭐⭐⭐ (นึ่งร้อน ๆ ฟินมาก)',
    ingredients: ['แป้งข้าวเจ้า', 'แป้งท้าวเหนียว', 'น้ำคั้นใบเตยเข้มข้น', 'หางกะทิ + หัวกะทิโรยหน้า'],
    colorHint: 'ขาวเนียนด้านบน / เขียวพาสเทลใบเตยด้านล่าง',
  },
  thongyip: {
    type: 'thongyip',
    name: 'ทองหยิบ',
    engName: 'Thong Yip',
    tagline: 'หยิบจับอะไรก็เป็นเงินเป็นทอง แต่ระวังหยิบเข้าปากบ่อย ๆ จะกลายเป็นเบาหวาน 🌟',
    trivia: 'หนึ่งในขนมตระกูลทองที่ทำจากไข่แดงล้วน นำมาตีจนฟูฟ่องแล้วหยอดในน้ำเชื่อมเดือด จากนั้นใช้ศิลปะเฉพาะตัว "จับจีบ" ให้เป็นรูปดอกไม้ลงในถ้วยแก้วจิ๋ว',
    difficultyToMake: '⭐⭐⭐⭐ (ต้องใจเย็นและมือเบาสุด ๆ)',
    ingredients: ['ไข่แดงของไข่เป็ด (ให้สีส้มทอง)', 'น้ำตาลทรายขาวเคี่ยวเค็มน้ำเชื่อม', 'น้ำลอยดอกมะลิหอมระรื่น'],
    colorHint: 'สีเหลืองส้มทองอร่ามเปล่งประกาย',
  },
  mochi: {
    type: 'mochi',
    name: 'โมจิแก้มยืด',
    engName: 'Squishy Mochi',
    tagline: 'แป้งยืดนุ่มเหนียวสู้ฟัน นุ่มหนึบหนับประหนึ่งเคี้ยวปุยเมฆ ☁️',
    trivia: 'ขนมมงคลเฉลิมฉลองของชาวญี่ปุ่นดั้งเดิม ทำจากการต้มข้าวเหนียวพันธุ์นุ่มแล้วระดมแรงกันใช้ค้อนไม้เคาะตำจนแป้งเนียนนุ่มจนยืดได้ยาวเหยียด',
    difficultyToMake: '⭐⭐⭐ (ต้องนวดแป้งตอนร้อน ๆ)',
    ingredients: ['แป้งข้าวเหนียวญี่ปุ่น', 'ผงแป้งมันคั่วสุกแป้งนวล', 'ไส้ถั่วแดงกวน / ครีมสดผลไม้'],
    colorHint: 'เขียวชาเขียวมัทฉะ / ขาวนวลละมุนตา',
  },
  marshmallow: {
    type: 'marshmallow',
    name: 'มาร์ชแมลโลว์นุ่มฟู',
    engName: 'Fluffy Marshmallow',
    tagline: 'บีบก็เด้ง ดึงก็ยืด ย่างไฟร้อน ๆ ไส้จะเยิ้มฟินสลบไปเลย! ⛺',
    trivia: 'ดั้งเดิมผลิตจากรากของพืชสมุนไพรชื่อ "Marsh Mallow" ที่ขึ้นตามหนองน้ำ ปัจจุบันพัฒนามาใช้เจลาตินตีผสมกับไซรัปน้ำตาลจนฟูละเอียดเบาเหมือนสำลี',
    difficultyToMake: '⭐⭐⭐ (ต้องตีส่วนผสมให้ฟูนุ่มเป๊ะ)',
    ingredients: ['เจลาตินผง', 'ไซรัปข้าวโพด', 'น้ำตาลไอซิ่งโรยเคลือบกันเหนียว', 'กลิ่นวานิลลา'],
    colorHint: 'แถบริ้วสีชมพูหวานไขว้สลับขาวปุยเมฆ',
  }
};

export default function BakeryCollection({ unlockedDesserts, onBack }: BakeryCollectionProps) {
  const [selectedType, setSelectedType] = useState<DessertType | null>('macaron');

  const keys = Object.keys(COLLECTION_DATA) as DessertType[];
  const unlockedCount = keys.filter(k => unlockedDesserts.includes(k)).length;
  const currentItem = selectedType ? COLLECTION_DATA[selectedType] : null;
  const isSelectedUnlocked = selectedType ? unlockedDesserts.includes(selectedType) : false;

  const handleSelect = (type: DessertType) => {
    audio.playTap();
    setSelectedType(type);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full max-w-5xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl border border-amber-900/10 shadow-2xl p-6 md:p-8 z-10"
    >
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-amber-900/10 pb-6 mb-6 gap-4">
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
          <BookOpen className="w-8 h-8 text-amber-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-amber-900 font-sans tracking-tight">
            สมุดสะสมสูตรขนมหวาน 📖
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/50 px-4 py-1.5 rounded-full">
          <Award className="w-5 h-5 text-amber-600 animate-bounce" />
          <span className="text-amber-800 font-mono text-sm font-semibold">
            ปลดล็อกแล้ว: {unlockedCount} / {keys.length} ชิ้น
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 min-h-[460px]">
        {/* Left Side: Dessert Grid list (12-cols spans 5 on md) */}
        <div className="md:col-span-5 flex flex-col">
          <p className="text-xs text-amber-800/60 font-mono mb-3 uppercase tracking-wider flex items-center gap-1">
            <BookCheck className="w-3.5 h-3.5" /> รายชื่อเมนูขนมหวานยอดฮิต
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
            {keys.map((type) => {
              const isUnlocked = unlockedDesserts.includes(type);
              const isSelected = selectedType === type;
              const item = COLLECTION_DATA[type];

              return (
                <button
                  key={type}
                  onClick={() => handleSelect(type)}
                  className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100 border-amber-400 shadow-md scale-102'
                      : isUnlocked
                      ? 'bg-amber-50/50 hover:bg-amber-50 border-amber-200/60 hover:border-amber-300'
                      : 'bg-gray-100/60 border-gray-200/50 grayscale opacity-80'
                  }`}
                >
                  {/* Dessert Miniature Icon */}
                  <div className="w-16 h-16 flex items-center justify-center relative">
                    <DessertRenderer
                      type={type}
                      primaryColor={
                        type === 'macaron' ? '#ff85a1' :
                        type === 'lookchup' ? '#f59e0b' :
                        type === 'donut' ? '#ec4899' :
                        type === 'candy' ? '#a855f7' :
                        type === 'khanomtuay' ? '#fcf8f2' :
                        type === 'thongyip' ? '#fbbf24' :
                        type === 'mochi' ? '#86efac' :
                        '#fb7185' // marshmallow
                      }
                      secondaryColor={
                        type === 'khanomtuay' ? '#15803d' :
                        type === 'thongyip' ? '#d97706' :
                        null
                      }
                      isMystery={false}
                      isRevealed={true}
                      size={54}
                    />
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200/60 rounded-full blur-[0.5px]">
                        <Lock className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Caption Name */}
                  <span className={`text-xs mt-2 font-medium text-center truncate w-full ${
                    isSelected ? 'text-amber-900 font-semibold' : 'text-amber-800'
                  }`}>
                    {isUnlocked ? item.name : 'ยังไม่ปลดล็อก'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Item View Card (12-cols spans 7 on md) */}
        <div className="md:col-span-7 flex flex-col justify-between bg-amber-50/40 rounded-2xl border border-amber-950/5 p-6 relative">
          {currentItem && isSelectedUnlocked ? (
            <motion.div
              key={currentItem.type}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col h-full justify-between gap-5"
            >
              {/* Top Row: visual art & names */}
              <div className="flex items-start gap-4">
                <div className="p-4 bg-white rounded-3xl border border-amber-100 shadow-sm flex items-center justify-center shrink-0">
                  <DessertRenderer
                    type={currentItem.type}
                    primaryColor={
                      currentItem.type === 'macaron' ? '#ff85a1' :
                      currentItem.type === 'lookchup' ? '#f59e0b' :
                      currentItem.type === 'donut' ? '#ec4899' :
                      currentItem.type === 'candy' ? '#a855f7' :
                      currentItem.type === 'khanomtuay' ? '#fcf8f2' :
                      currentItem.type === 'thongyip' ? '#fbbf24' :
                      currentItem.type === 'mochi' ? '#86efac' :
                      '#fb7185'
                    }
                    secondaryColor={
                      currentItem.type === 'khanomtuay' ? '#15803d' :
                      currentItem.type === 'thongyip' ? '#d97706' :
                      null
                    }
                    isMystery={false}
                    isRevealed={true}
                    size={80}
                  />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-amber-900 font-sans">
                    {currentItem.name}
                  </h2>
                  <p className="text-xs text-amber-600 font-mono uppercase tracking-wider mt-0.5">
                    {currentItem.engName}
                  </p>
                  <p className="text-xs bg-amber-100 text-amber-900 font-medium px-2.5 py-1 rounded-full inline-block mt-2">
                    ความยากในการปั้น: {currentItem.difficultyToMake}
                  </p>
                </div>
              </div>

              {/* Tagline Box */}
              <div className="bg-amber-100/50 border-l-4 border-amber-500 p-3 rounded-r-xl">
                <p className="text-amber-900 italic font-medium text-sm">
                  "{currentItem.tagline}"
                </p>
              </div>

              {/* Trivia Block */}
              <div>
                <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1.5 font-sans">
                  💡 เกร็ดความรู้ขนมหวานแสนอบอุ่น:
                </h3>
                <p className="text-amber-900/80 text-sm leading-relaxed text-justify">
                  {currentItem.trivia}
                </p>
              </div>

              {/* Ingredients and Palette */}
              <div className="grid grid-cols-2 gap-4 border-t border-amber-900/10 pt-4">
                <div>
                  <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1.5 font-sans">
                    ส่วนผสมหลัก:
                  </h3>
                  <ul className="list-disc list-inside text-xs text-amber-900/80 space-y-1">
                    {currentItem.ingredients.map((ing, index) => (
                      <li key={index}>{ing}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1.5 font-sans">
                    โทนสีแนะนำ:
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-amber-900/20" style={{
                      backgroundColor:
                        currentItem.type === 'macaron' ? '#ff85a1' :
                        currentItem.type === 'lookchup' ? '#eab308' :
                        currentItem.type === 'donut' ? '#ec4899' :
                        currentItem.type === 'candy' ? '#a855f7' :
                        currentItem.type === 'khanomtuay' ? '#15803d' :
                        currentItem.type === 'thongyip' ? '#fbbf24' :
                        currentItem.type === 'mochi' ? '#10b981' :
                        '#fb7185'
                    }} />
                    <span className="text-xs text-amber-900/80 font-sans">
                      {currentItem.colorHint}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-amber-800/40 p-10 gap-4">
              <Lock className="w-16 h-16 stroke-1 animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-amber-900/60 font-sans">
                  สูตรขนมชิ้นนี้ยังไม่ได้ปลดล็อก 🔒
                </h3>
                <p className="text-xs text-amber-800/60 mt-1 max-w-xs mx-auto">
                  เล่นผ่านด่านต่อเพื่อปลดล็อกรสชาติและเกร็ดตำนานขนมจานนี้มาเก็บสะสมกันเถอะ!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
