'use client';

import { Canvas } from '@react-three/fiber';
import React from 'react';
import { Model } from './Model';
import { FaGlobe, FaMeteor } from "react-icons/fa";

export default function PetDisplay() {
  return (
    <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center bg-gradient-to-b from-[#232526] to-[#0f2027] rounded-2xl shadow-2xl border-2 border-[#3a3f5a] relative overflow-hidden">
      <div className="absolute left-8 top-8 animate-spin-slow text-4xl opacity-40 select-none">
        <FaGlobe />
      </div>
      <div className="absolute right-8 bottom-8 animate-bounce-slowest text-3xl opacity-30 select-none">
        <FaMeteor />
      </div>
      <Canvas camera={{ position: [0, 0.2, 2.2], fov: 50 }} className="rounded-2xl">
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 7]} intensity={1} />
        <Model />
      </Canvas>
      <div className="absolute bottom-2 right-4 text-xs text-[#aeefff] opacity-60 select-none font-mono">3D Pet (Space)</div>
    </div>
  );
}
