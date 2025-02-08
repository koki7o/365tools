"use client"

import React, { useState } from 'react';
import { Heart, Share2, MessageCircle, Sparkles } from 'lucide-react';

const AnimatedCardStack = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const cards = [
    {
      title: "Cosmic Explorer",
      description: "Journey through the stars and discover new worlds",
      color: "bg-purple-500",
      icon: Sparkles
    },
    {
      title: "Ocean Dreams",
      description: "Dive deep into the mysteries of the sea",
      color: "bg-blue-500",
      icon: Share2
    },
    {
      title: "Forest Whispers",
      description: "Listen to the ancient stories of the woodland",
      color: "bg-green-500",
      icon: MessageCircle
    },
    {
      title: "Desert Mirage",
      description: "Experience the magic of endless horizons",
      color: "bg-orange-500",
      icon: Heart
    }
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative w-full max-w-3xl h-96">
        {cards.map((card, index) => {
          const isHovered = hoveredIndex === index;
          const Icon = card.icon;
          
          // Calculate offset based on position relative to active card
          const offset = ((index - activeIndex + cards.length) % cards.length);
          
          return (
            <div
              key={index}
              className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-2xl transition-all duration-500 ease-in-out cursor-pointer"
              style={{
                transform: `translate(-50%, ${offset * 32}px) scale(${1 - offset * 0.05})`,
                opacity: 1 - offset * 0.15,
                zIndex: cards.length - offset
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setActiveIndex(index)}
            >
              <div className={`relative overflow-hidden rounded-lg shadow-xl ${card.color} p-6 h-48
                transition-all duration-500 ease-in-out
                ${isHovered ? 'brightness-110 scale-105 -rotate-1' : 'brightness-100 scale-100 rotate-0'}`}>
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 
                  transform -skew-x-12 translate-x-full transition-transform duration-1000
                  hover:translate-x-[-200%]" />
                
                <div className="relative z-10">
                  <Icon className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-white opacity-90">{card.description}</p>
                </div>

                <div className={`absolute bottom-4 right-4 transform transition-all duration-500
                  ${isHovered ? 'scale-125 rotate-12' : 'scale-100 rotate-0'}`}>
                  <Icon className="w-6 h-6 text-white opacity-75" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedCardStack;