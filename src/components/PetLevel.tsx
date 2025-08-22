import { useEffect, useState } from "react";
import { FaUserAstronaut } from "react-icons/fa";

export default function PetLevel({ level, xp = 0 }: { level: number, xp?: number }) {
  // XP bar fills per problem (assuming 5 XP per level)
  const xpPercent = (xp / 5) * 100;
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timeout = setTimeout(() => setAnimate(false), 1200);
    return () => clearTimeout(timeout);
  }, [level]);

  return (
    <div className="w-full max-w-xs mx-auto flex flex-col items-center gap-2">
      <div className={`text-3xl transition-transform ${animate ? 'scale-125 animate-bounce' : ''}`}>
        <FaUserAstronaut />
      </div>
      <div className="text-[#7fd7ff] font-bold text-lg">Level {level}</div>
      <div className="w-full h-3 bg-[#232536]/60 rounded-full overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-[#43cea2] to-[#185a9d] rounded-full transition-all duration-500" style={{width: `${xpPercent}%`}} />
      </div>
      <div className="text-xs text-[#43cea2]">{xp}/5 XP to next level</div>
    </div>
  );
}
