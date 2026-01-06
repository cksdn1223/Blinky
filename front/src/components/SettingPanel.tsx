import { AnimatePresence, motion } from "framer-motion";
import { X, Check } from "lucide-react";

const PETNAME_SIZE = 10;

type propTypes = {
  setTempName: React.Dispatch<React.SetStateAction<string>>;
  handlePetNickname: (nickname: string) => Promise<void>;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSettingsOpen: boolean;
  petName: string;
  tempName: string;
}

function SettingPanel({ setTempName, setIsSettingsOpen, handlePetNickname, isSettingsOpen, petName, tempName }: propTypes) {

  return (
    <>
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            // 시작: 기준점보다 오른쪽(x: 100), 위쪽(y: -100)에서 작게 시작
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.35 }}
            // 도착: 원래 위치(0, 0)
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            // 퇴장: 기준점보다 왼쪽(x: -100), 아래쪽(y: 100)으로 사라짐
            exit={{ opacity: 0, x: 0, y: 0, scale: 0.35 }}
            className="absolute right-0 top-0 w-[350px] bg-[#1a1c1e] border border-white/10 rounded-[1.4rem] p-6 shadow-[20px_20px_60px_rgba(0,0,0,0.5)] z-[100] origin-top-right"
          >
            {/* 상단 헤더 섹션 */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-white font-mono font-black text-[10px] uppercase tracking-widest opacity-50">Setting</span>
              </div>
              <button
                onClick={() => {
                  setTempName(petName); // 취소 시 원래 이름으로 복구
                  setIsSettingsOpen(false);
                }}
                className="text-white/20 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-green-500 font-black text-[10px] uppercase tracking-[0.2em] ml-1">
                  이름 변경
                </label>
                <span className={`text-[10px] font-mono ${tempName.length >= PETNAME_SIZE ? 'text-red-500' : 'text-white/40'}`}>
                  {tempName.length}/{PETNAME_SIZE}
                </span>
              </div>

              <div className="relative flex items-end gap-3 group">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tempName} // 실제 이름이 아닌 임시 이름 연결
                    onChange={(e) => {
                      const value = e.target.value;
                      const regex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|_]*$/;
                      if (regex.test(value) && value.length <= PETNAME_SIZE) {
                        setTempName(value); // 임시 상태만 변경
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tempName.length > 0) {
                        handlePetNickname(tempName);
                      }
                    }}
                    placeholder="공백없이 입력"
                    className="w-full bg-transparent border-b-2 border-white/10 py-2 text-2xl font-bold text-white outline-none focus:border-green-500 transition-all placeholder:text-white/5"
                    autoFocus
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] bg-green-500 w-0 group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>

                <button
                  disabled={tempName.length === 0}
                  onClick={() => {
                    handlePetNickname(tempName);
                  }}
                  className="mb-1 p-2.5 bg-green-500 text-[#1a1c1e] rounded-xl transition-all flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]
                            enabled:hover:bg-green-400 enabled:hover:scale-105 enabled:active:scale-95
                            disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Check size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SettingPanel;