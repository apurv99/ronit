import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { settingsService } from '../lib/services';

interface NewsTickerProps {
  news: string[];
}

export default function NewsTicker({ news }: NewsTickerProps) {
  const [speed, setSpeed] = useState(30);

  useEffect(() => {
    settingsService.get().then(data => {
      if (data?.tickerSpeed) {
        setSpeed(data.tickerSpeed);
      }
    });
  }, []);

  if (!news.length) return null;

  return (
    <div className="bg-black text-white h-10 flex items-center overflow-hidden font-sans text-sm">
      <div className="bg-[#E11D24] h-full px-4 flex items-center gap-2 font-bold uppercase italic shrink-0 z-10">
        <Zap size={16} fill="white" />
        Breaking
      </div>
      <div className="flex-1 overflow-hidden relative">
        <motion.div 
          className="flex whitespace-nowrap gap-12 items-center"
          animate={{ x: [0, -1000] }}
          transition={{ 
            duration: speed, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {news.map((item, i) => (
            <span key={i} className="hover:text-[#E11D24] cursor-pointer transition-colors">
              {item}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {news.map((item, i) => (
            <span key={`dup-${i}`} className="hover:text-[#E11D24] cursor-pointer transition-colors">
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
