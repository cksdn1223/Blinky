import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuthStore, useUserStore } from '../store/store';
import { interactPet } from '../api/api';

export const useBlinkyLogic = () => {
  const { userStats, updatePetStats } = useUserStore();
  const { token } = useAuthStore();

  const [status, setStatus] = useState('sleep'); // 기본 상태는 수면

  const stats = useMemo(() => {
    return {
      happiness: userStats?.petHappiness || 0,
      boredom: userStats?.petBoredom || 0,
    }
  }, [userStats]);

  // 심심함 증가 로직 (스토어 액션 호출)
  useEffect(() => {
    if (!token) return;
    const timer = setInterval(() => {
      // 스토어에 직접 업데이트 요청
      updatePetStats(stats.happiness, Math.min(stats.boredom + 1, 100));
    }, 38000);
    return () => clearInterval(timer);
  }, [token, stats.happiness, stats.boredom, updatePetStats]);


  // 연속 상호작용 횟수 관리 (3번 넘으면 pounce)
  const interactionCountRef = useRef(0);
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 상태 결정 로직
  useEffect(() => {
    // 상호작용 중이거나 특수 동작 중일 때는 자아 로직이 개입하지 않음
    if (actionTimeoutRef.current || ['pounce'].includes(status)) return;

    const decisionTimer = setInterval(() => {
      const { boredom } = stats;
      const rand = Math.random();

      if (boredom >= 100) {
        if (rand < 0.33) setStatus('alert');
        else if (rand < 0.66) setStatus('creep');
        else setStatus('run');
      }
      else if (boredom > 50) {
        if (rand < 0.6) setStatus('walk');
        else setStatus('groom');

        setTimeout(() => {
          if (Math.random() < 0.4) setStatus('idle');
        }, 3000);
      }

      else {
        if (rand < 0.15) {
          // 15% 걷기
          setStatus('walk');
          setTimeout(() => setStatus('idle'), 2500);
        }
        else if (rand < 0.6) {
          // 45% 가만히 있기
          if (status !== 'idle') setStatus('idle');
        }
        else {
          // 40% 잠자기
          if (status !== 'sleep') setStatus('sleep');
        }
      }
    }, 5000);

    return () => clearInterval(decisionTimer);
  }, [stats, status]);

  // 상호작용 로직   
  const interact = useCallback(async () => {
    if (actionTimeoutRef.current || status === 'pounce') return;

    interactionCountRef.current += 1;

    // 공통 수치 업데이트 함수 (스토어 연동)
    const handleStatsUpdate = async () => {
      // 로컬에서 즉시 반영 (Optimistic Update 효과)
      const nextBoredom = Math.max(stats.boredom - 30, 0);
      const nextHappiness = stats.happiness + 1;
      updatePetStats(nextHappiness, nextBoredom);

      if (token) {
        try {
          const data = await interactPet();
          if (data) {
            // 서버 데이터로 최종 동기화
            updatePetStats(data.happiness, data.boredom);
          }
        } catch (e) {
          console.error("상호작용 반영 실패", e);
        }
      }
    };

    // 특수 동작 결정
    if (stats.boredom <= 30 || interactionCountRef.current >= 3) {
      setStatus('pounce');
      interactionCountRef.current = 0;
      await handleStatsUpdate();
    } else {
      const actions = ['groom', 'alert', 'creep', 'walk', 'run', 'jump'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setStatus(randomAction);

      actionTimeoutRef.current = setTimeout(() => {
        actionTimeoutRef.current = null;
        setStatus('idle');
      }, 3000);

      await handleStatsUpdate();
    }
  }, [status, token, stats, updatePetStats]);

  return { status, stats, interact, setStatus };
};