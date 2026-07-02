/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DessertType } from '../types';

interface DessertRendererProps {
  type: DessertType;
  primaryColor: string;
  secondaryColor: string | null;
  isMystery: boolean;
  isRevealed: boolean;
  size?: number; // width and height in px
}

export default function DessertRenderer({
  type,
  primaryColor,
  secondaryColor,
  isMystery,
  isRevealed,
  size = 70,
}: DessertRendererProps) {
  // If it's a mystery and has not been clicked/revealed yet, show the mystery wrapper
  if (isMystery && !isRevealed) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_4px_6px_rgba(245,158,11,0.3)] animate-pulse"
      >
        {/* Mysterious Shiny Golden Wrapper */}
        <circle cx="50" cy="50" r="38" fill="url(#mysteryGoldGrad)" stroke="#f59e0b" strokeWidth="3" />
        <path
          d="M20 50 C 35 30, 65 30, 80 50 C 65 70, 35 70, 20 50 Z"
          fill="#fff"
          fillOpacity="0.15"
        />
        {/* Glowing Question Mark */}
        <text
          x="50"
          y="62"
          fill="#ffffff"
          fontSize="36"
          fontWeight="bold"
          textAnchor="middle"
          className="font-sans"
          style={{ textShadow: '0 0 8px #f59e0b, 0 0 12px #ffffff' }}
        >
          ?
        </text>

        {/* Shimmer/Sparkle star lines */}
        <path d="M50 8 L50 14 M50 86 L50 92 M8 50 L14 50 M86 50 L92 50" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 22 L26 26 M74 74 L78 78 M22 74 L26 70 M74 22 L78 26" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />

        <defs>
          <linearGradient id="mysteryGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Choose the visual representation based on type
  const renderDessertSVG = () => {
    const color2 = secondaryColor || primaryColor; // fallback for dual color

    switch (type) {
      case 'macaron':
        return (
          <>
            {/* Top Shell */}
            <rect x="18" y="22" width="64" height="20" rx="10" fill={primaryColor} stroke="#451a03" strokeWidth="2.5" />
            <path d="M24 38 C28 41, 72 41, 76 38" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
            
            {/* Creamy filling (stretches through the middle) */}
            <rect x="22" y="40" width="56" height="8" rx="4" fill="#ffffff" stroke="#451a03" strokeWidth="2" />
            
            {/* Bottom Shell (Using secondary color if bicolored) */}
            <rect x="18" y="46" width="64" height="20" rx="10" fill={color2} stroke="#451a03" strokeWidth="2.5" />
            <path d="M24 62 C28 65, 72 65, 76 62" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />

            {/* Little Macaron feet details */}
            <path d="M19 41.5 L19 44 M81 41.5 L81 44" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
          </>
        );

      case 'candy':
        return (
          <>
            {/* Candy wrapper ears */}
            <path d="M10 50 L26 35 L26 65 Z" fill={primaryColor} stroke="#451a03" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M90 50 L74 35 L74 65 Z" fill={color2} stroke="#451a03" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="20" cy="50" r="4" fill="#ffffff" fillOpacity="0.4" />
            <circle cx="80" cy="50" r="4" fill="#ffffff" fillOpacity="0.4" />

            {/* Center sweet body */}
            <circle cx="50" cy="50" r="26" fill={primaryColor} stroke="#451a03" strokeWidth="3" />
            
            {/* Swirl / Stripe detail */}
            <path
              d="M34 50 C 42 35, 58 35, 66 50 C 58 65, 42 65, 34 50 Z"
              fill={color2}
              stroke="#451a03"
              strokeWidth="2"
            />
            <path
              d="M42 50 C 46 43, 54 43, 58 50 C 54 57, 46 57, 42 50 Z"
              fill="#ffffff"
            />
          </>
        );

      case 'donut':
        return (
          <>
            {/* Donut Dough */}
            <circle cx="50" cy="50" r="38" fill="#eab308" stroke="#451a03" strokeWidth="3" />
            
            {/* Frosted glaze (Wavy top path) */}
            <path
              d="M50 14 
                 C 68 14, 86 28, 86 50 
                 C 86 64, 76 74, 68 80 
                 C 60 86, 52 76, 50 84 
                 C 48 76, 40 86, 32 80 
                 C 24 74, 14 64, 14 50 
                 C 14 28, 32 14, 50 14 Z"
              fill={primaryColor}
              stroke="#451a03"
              strokeWidth="2.5"
            />
            
            {/* Middle hole */}
            <circle cx="50" cy="50" r="14" fill="#fcf8f2" stroke="#451a03" strokeWidth="3" />
            
            {/* Sprinkles (Small colored dashes) */}
            {secondaryColor ? (
              // Sprinkle color is secondary color
              <>
                <rect x="32" y="28" width="8" height="3" rx="1.5" transform="rotate(25 32 28)" fill={color2} />
                <rect x="60" y="26" width="8" height="3" rx="1.5" transform="rotate(-40 60 26)" fill={color2} />
                <rect x="28" y="55" width="8" height="3" rx="1.5" transform="rotate(60 28 55)" fill={color2} />
                <rect x="68" y="52" width="8" height="3" rx="1.5" transform="rotate(-15 68 52)" fill={color2} />
                <rect x="46" y="22" width="8" height="3" rx="1.5" transform="rotate(5 46 22)" fill="#ffffff" />
              </>
            ) : (
              // Mixed sprinkles
              <>
                <rect x="32" y="28" width="8" height="3" rx="1.5" transform="rotate(25 32 28)" fill="#fbbf24" />
                <rect x="60" y="26" width="8" height="3" rx="1.5" transform="rotate(-40 60 26)" fill="#ef4444" />
                <rect x="28" y="55" width="8" height="3" rx="1.5" transform="rotate(60 28 55)" fill="#10b981" />
                <rect x="68" y="52" width="8" height="3" rx="1.5" transform="rotate(-15 68 52)" fill="#3b82f6" />
                <rect x="46" y="22" width="8" height="3" rx="1.5" transform="rotate(5 46 22)" fill="#ffffff" />
              </>
            )}
          </>
        );

      case 'lookchup':
        // Glossy Lookchup: shaped like a mango/chili, glossy gradient, little stem & leaf
        return (
          <>
            {/* Shadow beneath */}
            <ellipse cx="50" cy="78" rx="20" ry="5" fill="#451a03" fillOpacity="0.1" />

            {/* Lookchup main body (Mango shape/tear drop) */}
            <path
              d="M50 24 
                 C 32 30, 24 50, 28 66 
                 C 32 82, 50 84, 50 84 
                 C 50 84, 68 82, 72 66 
                 C 76 50, 68 30, 50 24 Z"
              fill={primaryColor}
              stroke="#451a03"
              strokeWidth="2.5"
            />
            
            {/* Soft gradient of secondary color (Level 31-60) */}
            {secondaryColor && (
              <path
                d="M50 24 
                   C 42 27, 34 38, 36 50 
                   C 38 62, 50 64, 50 64 Z"
                fill={color2}
                opacity="0.75"
              />
            )}

            {/* STEM & LEAF */}
            <path d="M50 24 Q 46 14, 40 12" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            {/* Green Leaf */}
            <path d="M44 14 C 42 8, 32 8, 34 14 C 36 20, 44 18, 44 14 Z" fill="#22c55e" stroke="#14532d" strokeWidth="1.5" />

            {/* Gelatinous High Gloss shine reflection */}
            <path
              d="M62 42 C 64 50, 60 62, 56 68"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeOpacity="0.5"
            />
            <circle cx="42" cy="36" r="4" fill="#ffffff" fillOpacity="0.6" />
          </>
        );

      case 'khanomtuay':
        // Khanom Tuay: Coconut milk custard in small porcelain cup
        return (
          <>
            {/* Porcelain cup body */}
            <path d="M18 45 L25 78 C27 82, 73 82, 75 78 L82 45 Z" fill="#ffffff" stroke="#451a03" strokeWidth="3" strokeLinejoin="round" />
            {/* Blue lines on traditional cup */}
            <path d="M20 54 Q50 60, 80 54" stroke="#1d4ed8" strokeWidth="2.5" strokeOpacity="0.7" fill="none" />
            <path d="M23 68 Q50 74, 77 68" stroke="#1d4ed8" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />

            {/* Bottom Pandan Custard Layer (Visible at rim if styled) */}
            <ellipse cx="50" cy="45" rx="31" ry="12" fill={secondaryColor || "#15803d"} stroke="#451a03" strokeWidth="2.5" />
            
            {/* Top White Coconut Milk Custard Layer */}
            <ellipse cx="50" cy="40" rx="30" ry="11" fill={primaryColor} stroke="#451a03" strokeWidth="2.5" />
            
            {/* Steam / Shine lines */}
            <path d="M42 36 Q 46 38, 54 38" stroke="#fcf8f2" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
          </>
        );

      case 'thongyip':
        // Thong Yip: Thai Golden Flower Egg Dessert
        return (
          <>
            {/* 5-Petal pinched star-flower body */}
            <path
              d="M50 14
                 C 55 28, 76 20, 78 32
                 C 80 44, 88 56, 74 64
                 C 60 72, 54 86, 42 82
                 C 30 78, 14 74, 22 58
                 C 30 42, 22 26, 36 20
                 C 50 14, 45 0, 50 14 Z"
              fill={primaryColor}
              stroke="#451a03"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Secondary gradient fold marks */}
            <path d="M50 50 L50 20 M50 50 L75 36 M50 50 L64 74 M50 50 L30 68 M50 50 L28 32" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
            
            {/* Center core deep sweet golden pool */}
            <circle cx="50" cy="50" r="10" fill={color2} stroke="#78350f" strokeWidth="1.5" />
            
            {/* Glistening Sugar Syrup reflection */}
            <circle cx="47" cy="47" r="3" fill="#ffffff" fillOpacity="0.7" />
          </>
        );

      case 'mochi':
        // Mochi: Cute round soft dumpling dusted with powder
        return (
          <>
            {/* Flat shadow */}
            <ellipse cx="50" cy="80" rx="28" ry="7" fill="#451a03" fillOpacity="0.12" />

            {/* Mochi squishy body */}
            <path
              d="M18 55 
                 C 18 36, 32 24, 50 24 
                 C 68 24, 82 36, 82 55 
                 C 82 72, 68 76, 50 76 
                 C 32 76, 18 72, 18 55 Z"
              fill={primaryColor}
              stroke="#451a03"
              strokeWidth="3"
            />
            
            {/* Secondary gradient shading (Level 31-60) */}
            {secondaryColor && (
              <path
                d="M50 24 C 68 24, 82 36, 82 55 C 82 68, 68 74, 50 74 Z"
                fill={color2}
                opacity="0.3"
              />
            )}

            {/* Cute sleeping face to represent absolute zen relaxation */}
            <path d="M38 52 Q 41 55, 44 52" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M56 52 Q 59 55, 62 52" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Rosy blush cheeks */}
            <circle cx="34" cy="58" r="4" fill="#f87171" fillOpacity="0.6" />
            <circle cx="66" cy="58" r="4" fill="#f87171" fillOpacity="0.6" />

            {/* Powder speckles */}
            <circle cx="50" cy="34" r="1.5" fill="#ffffff" fillOpacity="0.8" />
            <circle cx="36" cy="40" r="1.5" fill="#ffffff" fillOpacity="0.8" />
            <circle cx="64" cy="38" r="1.5" fill="#ffffff" fillOpacity="0.8" />
          </>
        );

      case 'marshmallow':
        // Marshmallow: pastel stripes wrapped diagonally
        return (
          <>
            {/* Main fluffy log */}
            <rect x="22" y="24" width="56" height="52" rx="14" fill={primaryColor} stroke="#451a03" strokeWidth="3" />
            
            {/* Diagonal Stripes (using secondaryColor / white) */}
            <path
              d="M26 38 L48 24 M22 55 L58 24 M34 76 L74 36 M56 76 L78 52"
              stroke={color2}
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.8"
            />
            
            {/* Highlights and 3D pillowy shading */}
            <path d="M26 28 C 36 28, 64 28, 74 28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
            <path d="M26 72 C 36 72, 64 72, 74 72" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.08" />
          </>
        );

      default:
        // Fallback simple circle candy
        return (
          <circle cx="50" cy="50" r="32" fill={primaryColor} stroke="#451a03" strokeWidth="3" />
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_4px_4px_rgba(69,26,3,0.15)] transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer"
    >
      {renderDessertSVG()}
    </svg>
  );
}
