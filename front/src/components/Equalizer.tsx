import { motion } from "framer-motion";

function Equalizer({ isPlaying }: { isPlaying: boolean }) {
  const bars = Array.from({ length: 40 });

  const getHeightSequence = (index: number) => {
    if (!isPlaying) return 4;
    if (index % 3 === 0) return [12, 28, 16, 32, 14];
    if (index % 3 === 1) return [8, 18, 10, 24, 12];
    return [6, 14, 8, 20, 10];
  };

  return (
    <div className="flex items-end gap-[2px] h-10 px-2 overflow-hidden">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] bg-green-500/80 rounded-full" // rounded-full 적용
          style={{
            // 하단에 아주 연한 녹색 그림자를 주어 입체감 부여
            boxShadow: isPlaying ? "0 1px 4px rgba(34, 197, 94, 0.2)" : "none"
          }}
          initial={{ height: 4 }}
          animate={{ height: getHeightSequence(i) }}
          transition={{
            repeat: isPlaying ? Infinity : 0,
            duration: 0.5 + (i % 4) * 0.1,
            delay: i * 0.04,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default Equalizer;