"use client"

import React, { useState, useEffect } from 'react';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

const AvatarSVG = () => (
  <svg viewBox="0 0 200 200" className="w-12 h-12">
    <circle cx="100" cy="70" r="50" fill="#6366f1"/>
    <circle cx="100" cy="180" r="90" fill="#6366f1"/>
  </svg>
);

const ProjectSVG = () => (
  <svg viewBox="0 0 400 200" className="w-full rounded-lg">
    <rect width="400" height="200" fill="#2a2a2c" rx="8"/>
    <circle cx="30" cy="30" r="8" fill="#ff5f57"/>
    <circle cx="54" cy="30" r="8" fill="#febc2e"/>
    <circle cx="78" cy="30" r="8" fill="#28c840"/>
    <rect x="20" y="60" width="360" height="120" fill="#3a3a3c" rx="4"/>
    <rect x="40" y="80" width="150" height="10" fill="#6366f1" rx="2"/>
    <rect x="40" y="100" width="320" height="6" fill="#4a4a4c" rx="2"/>
    <rect x="40" y="116" width="280" height="6" fill="#4a4a4c" rx="2"/>
    <rect x="40" y="132" width="300" height="6" fill="#4a4a4c" rx="2"/>
  </svg>
);

const ContactSVG = () => (
  <svg viewBox="0 0 200 200" className="absolute bottom-0 right-0 w-32 h-32">
    <circle cx="100" cy="100" r="80" fill="#fff" fillOpacity="0.1"/>
    <circle cx="100" cy="85" r="35" fill="#fff" fillOpacity="0.2"/>
    <circle cx="100" cy="140" r="50" fill="#fff" fillOpacity="0.2"/>
  </svg>
);

const PortfolioPage = () => {
  const [visibleCards, setVisibleCards] = useState(Array(6).fill(false));

  useEffect(() => {
    const delays = [0, 150, 300, 450, 600, 750];
    
    delays.forEach((delay, index) => {
      setTimeout(() => {
        setVisibleCards(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      }, delay);
    });
  }, []);

  const cardAnimationClasses = (index) => `
    transition-opacity duration-1000 ease-in
    ${visibleCards[index] ? 'opacity-100' : 'opacity-0'}
  `;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-8">
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <span className="font-semibold">devfounder</span>
          <span className="text-gray-500">Front-end</span>
        </div>
        <div className="flex gap-6 text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Present</a>
          <a href="#" className="hover:text-white transition-colors">Skills</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Intro Card */}
        <div className={`bg-[#1a1a1c] rounded-3xl p-8 relative overflow-hidden ${cardAnimationClasses(0)}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-yellow-400 overflow-hidden">
              <AvatarSVG />
            </div>
            <div>
              <h2 className="font-semibold">Hi, I'm Kyle.</h2>
              <p className="text-sm text-gray-400">Front-end developer</p>
            </div>
          </div>
          <div className="flex gap-4 mb-8">
            <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            <Github className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Passionate to pursue<br />the technology.
          </h1>
          <p className="text-gray-400">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          </p>
        </div>

        {/* Avatar Card */}
        <div className={`bg-yellow-400 rounded-3xl p-8 relative overflow-hidden ${cardAnimationClasses(1)}`}>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2 text-gray-900">Tech Stack</h3>
            <p className="text-gray-800 mb-4">Full Stack Development</p>
            <div className="flex gap-3 mb-4">
              <span className="bg-white/40 px-3 py-1 rounded-full text-sm font-medium text-gray-900">React</span>
              <span className="bg-white/40 px-3 py-1 rounded-full text-sm font-medium text-gray-900">Node.js</span>
              <span className="bg-white/40 px-3 py-1 rounded-full text-sm font-medium text-gray-900">TypeScript</span>
            </div>
          </div>
          <div className="flex w-100 justify-end">
            <img className="w-32 h-32 object-cover" src="./avatar.png" alt="pic"/>
          </div>
        </div>

        {/* Current Work Card */}
        <div className={`bg-[#6366f1] rounded-3xl p-8 text-white relative overflow-hidden ${cardAnimationClasses(2)}`}>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Currently I'm<br />working at<br />Placeholder</h2>
            <p className="text-white/80">Lorem Ipsum is simply dummy text of<br />the printing and typesetting industry.</p>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute top-8 right-8 w-16 h-16 bg-white/10 rounded-full" />
        </div>

        {/* Project Card */}
        <div className={`bg-[#1a1a1c] rounded-3xl p-8 relative overflow-hidden ${cardAnimationClasses(3)}`}>
          <h3 className="text-lg font-semibold mb-2">thedevfounder.com</h3>
          <p className="text-gray-400 mb-4">Smart rank-tracker for everyone.</p>
          <ProjectSVG />
        </div>

        {/* Learning Card */}
        <div className={`bg-[#1a1a1c] rounded-3xl p-8 relative overflow-hidden ${cardAnimationClasses(4)}`}>
          <p className="text-sm text-gray-400 mb-4">I constantly try to improve myself</p>
          <h2 className="text-2xl font-bold mb-4">Currently, I am<br />learning GoLang.</h2>
          <p className="text-gray-400">
            Lorem Ipsum is simply dummy<br />
            Lorem Ipsum is simply dummy<br />
            Lorem Ipsum is simply dummy<br />
            Lorem Ipsum is simply dummy<br />
            Lorem Ipsum is simply dummy
          </p>
          <div className="absolute top-1/2 right-8 transform -translate-y-1/2 flex flex-col gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">TS</div>
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">JS</div>
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <Github className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div className={`bg-[#ff5733] rounded-3xl p-8 text-white relative overflow-hidden ${cardAnimationClasses(5)}`}>
          <h2 className="text-2xl font-bold mb-4">Contact me</h2>
          <p className="mb-4">Make a contact via<br />email or twitter<br />DMs.</p>
          <div className="flex gap-4">
            <Mail className="w-6 h-6" />
            <Twitter className="w-6 h-6" />
          </div>
          <ContactSVG />
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto text-center mt-12 text-gray-400">
        <p>Made by devfounder ❤️ ©2025</p>
        <p>See ya!</p>
      </div>
    </div>
  );
};

export default PortfolioPage;