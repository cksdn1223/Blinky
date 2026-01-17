import { AnimatePresence, motion } from "framer-motion";
import { X, Check, User, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { propTypes } from "../types";

const MAX_NAME_SIZE = 10;

function SettingPanel({
  userName,
  handleUserNickname,
  petName,
  handlePetNickname,
  setIsSettingsOpen,
  isSettingsOpen
}: propTypes) {
  const [tempUserName, setTempUserName] = useState(userName);
  const [tempPetName, setTempPetName] = useState(petName);
  const nameRegex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|_]*$/;

  useEffect(() => {
    if (isSettingsOpen) {
      setTempUserName(userName || "");
      setTempPetName(petName || "");
    }
  }, [isSettingsOpen, userName, petName]);

  const closePanel = () => {
    setTempUserName(userName);
    setTempPetName(petName);
    setIsSettingsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 top-0 w-[350px] bg-[#1a1c1e]/95 backdrop-contrast-150 border border-white/10 rounded-[1rem] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] origin-top-right"
          >
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                <span className="text-white font-mono font-black text-[11px] uppercase tracking-[0.3em] opacity-70">Settings</span>
              </div>
              <button
                onClick={closePanel}
                className="p-1.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-10">
              {/* 유저 프로필 이름 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2 text-green-500/80">
                    <User size={12} />
                    <label className="font-black text-[10px] uppercase tracking-widest">User Nickname</label>
                  </div>
                  <span className={`text-[9px] font-mono ${tempUserName.length >= MAX_NAME_SIZE ? 'text-red-500' : 'text-white/30'}`}>
                    {tempUserName.length}/{MAX_NAME_SIZE}
                  </span>
                </div>

                <div className="relative flex items-center gap-3 group">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={tempUserName}
                      onChange={(e) => {
                        if (nameRegex.test(e.target.value) && e.target.value.length <= MAX_NAME_SIZE) {
                          setTempUserName(e.target.value);
                        }
                      }}
                      placeholder="유저 이름 입력"
                      className="w-full bg-transparent border-b border-white/10 py-1.5 text-xl font-bold text-white outline-none focus:border-green-500/50 transition-all placeholder:text-white/5"
                    />
                  </div>
                  <button
                    disabled={tempUserName.length === 0 || tempUserName === userName}
                    onClick={() => handleUserNickname(tempUserName)}
                    className="p-2 bg-white/5 text-green-500 rounded-lg transition-all enabled:hover:bg-green-500 enabled:hover:text-black disabled:opacity-10"
                  >
                    <Check size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* 펫 이름 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-2 text-green-500/80">
                    <Heart size={12} />
                    <label className="font-black text-[10px] uppercase tracking-widest">Pet Name</label>
                  </div>
                  <span className={`text-[9px] font-mono ${tempPetName.length >= MAX_NAME_SIZE ? 'text-red-500' : 'text-white/30'}`}>
                    {tempPetName.length}/{MAX_NAME_SIZE}
                  </span>
                </div>

                <div className="relative flex items-center gap-3 group">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={tempPetName}
                      onChange={(e) => {
                        if (nameRegex.test(e.target.value) && e.target.value.length <= MAX_NAME_SIZE) {
                          setTempPetName(e.target.value);
                        }
                      }}
                      placeholder="펫 이름 입력"
                      className="w-full bg-transparent border-b border-white/10 py-1.5 text-xl font-bold text-white outline-none focus:border-green-500/50 transition-all placeholder:text-white/5"
                    />
                  </div>
                  <button
                    disabled={tempPetName.length === 0 || tempPetName === petName}
                    onClick={() => handlePetNickname(tempPetName)}
                    className="p-2 bg-white/5 text-green-500 rounded-lg transition-all enabled:hover:bg-green-500 enabled:hover:text-black disabled:opacity-10"
                  >
                    <Check size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-1 pt-4 text-center">
              <p className="text-[12px] text-white/20 font-mono tracking-tighter">
                이름을 입력하고 체크 버튼을 눌러 확정하세요
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SettingPanel;