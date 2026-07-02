/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface BackgroundThemeProps {
  themeId: string;
}

export default function BackgroundTheme({ themeId }: BackgroundThemeProps) {
  // We can render rich visual backdrops based on selected customization
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {themeId === 'cozy_cafe' && (
        // Cozy Minimalist Cafe: Warm browns, window light rays, hanging plants visual hint
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbf8f3] via-[#f5ede3] to-[#eaddcd]">
          {/* Subtle light rays from upper-left */}
          <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-gradient-to-tr from-transparent via-white/10 to-white/20 blur-3xl transform rotate-12 -translate-x-1/4 -translate-y-1/4" />
          
          {/* Hanging planter representation / Boho aesthetic circles */}
          <div className="absolute top-8 left-12 w-20 h-20 border border-amber-900/10 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 border border-dashed border-amber-900/10 rounded-full" />
          </div>
          <div className="absolute top-12 right-24 w-40 h-40 bg-orange-100/30 rounded-full blur-2xl" />
          
          {/* Modern arch detail */}
          <div className="absolute bottom-0 right-10 w-96 h-[32rem] bg-[#edd9c0]/30 rounded-t-full border-t border-x border-amber-900/5" />
          <div className="absolute bottom-0 left-20 w-64 h-[24rem] bg-[#edd9c0]/20 rounded-t-full border-t border-x border-amber-900/5" />
          
          {/* Cafe shelf lines */}
          <div className="absolute top-[25%] left-0 right-0 h-[2px] bg-amber-900/5" />
          <div className="absolute top-[45%] left-0 right-0 h-[2px] bg-amber-900/5" />
        </div>
      )}

      {themeId === 'cosmic_space' && (
        // Cosmic Starry Cafe: Deep cosmic purples, dark skies, and glowing stars
        <div className="absolute inset-0 bg-[#0c0a1c]">
          {/* Twinkling star indicators */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${(i * 17) % 95}%`,
                left: `${(i * 23) % 95}%`,
                opacity: 0.2 + ((i % 5) * 0.15),
              }}
              animate={{
                opacity: [0.1, 0.8, 0.1],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2 + (i % 4),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
          
          {/* Cosmic nebula glows */}
          <div className="absolute -top-10 -right-10 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[30rem] h-[30rem] bg-indigo-900/30 rounded-full blur-3xl" />
          <div className="absolute top-[40%] right-[15%] w-72 h-72 bg-pink-900/10 rounded-full blur-3xl" />
          
          {/* Soft cybergrid */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px)', 
              backgroundSize: '24px 24px' 
            }} 
          />
        </div>
      )}

      {themeId === 'sakura_garden' && (
        // Sakura Blossom Garden: Soft dreamy pinks, peaceful cherry blossom atmosphere
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff0f3] via-[#ffe3e8] to-[#ffd0d6]">
          {/* Arching Japanese door visual silhouette hint */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[42rem] h-[36rem] border-t-2 border-x border-pink-700/5 rounded-t-[10rem] bg-white/20 blur-[1px]" />
          
          {/* Soft sun glow */}
          <div className="absolute top-10 left-1/4 w-48 h-48 bg-rose-200/40 rounded-full blur-3xl" />
          
          {/* Floating Sakura Petals */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-2 bg-rose-300 rounded-full opacity-60"
              style={{
                top: `${-10 + (i * 12)}%`,
                left: `${10 + (i * 15)}%`,
                transform: 'rotate(15deg)',
              }}
              animate={{
                y: ['0vh', '110vh'],
                x: ['0vw', `${(i % 2 === 0 ? 8 : -8)}vw`],
                rotate: [0, 360],
              }}
              transition={{
                duration: 12 + (i * 3),
                repeat: Infinity,
                ease: 'linear',
                delay: i * 1.5,
              }}
            />
          ))}
        </div>
      )}

      {themeId === 'retro_arcade' && (
        // Neon Arcade: 80s Cyberpunk grid, neon accents, gaming mood
        <div className="absolute inset-0 bg-[#080510]">
          {/* Perspective grid lines */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-cyan-950/20 to-transparent border-t border-cyan-500/10" />
          
          {/* Retro grids */}
          <div 
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #d946ef 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          {/* Synthwave Glowing Sun */}
          <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-gradient-to-t from-pink-500/20 via-rose-500/5 to-transparent rounded-full blur-3xl" />
          
          {/* Ambient Cyber Lightbars */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          <div className="absolute top-[40%] left-0 w-[4px] h-32 bg-cyan-500/10 blur-[1px]" />
          <div className="absolute top-[30%] right-0 w-[4px] h-32 bg-pink-500/10 blur-[1px]" />
        </div>
      )}
    </div>
  );
}
