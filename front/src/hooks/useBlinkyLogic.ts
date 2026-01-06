import { useState, useEffect, useCallback, useRef } from 'react';
import { PetStatus } from '../types';
import { useAuthStore, useUserStore } from '../store/store';
import { interactPet } from '../api/api';

export const useBlinkyLogic = () => {
  const { userStats } = useUserStore();
  const { token } = useAuthStore();
  const [status, setStatus] = useState('sleep'); // 기본 상태는 수면
  const [stats, setStats] = useState<PetStatus>({
    happiness: 0,
    boredom: 0
  });

  useEffect(() => {
    if (userStats) {
      setStats({
        // Number() 변환 시 undefined나 null이면 0이 될 수 있으므로 기본값 처리
        happiness: Number(userStats.petHappiness || 0),
        boredom: Number(userStats.petBoredom || 0)
      });
    }
  }, [userStats]);

  useEffect(() => {
    if (!token) return;

    const timer = setInterval(() => {
      setStats(prev => ({
        ...prev,
        boredom: Math.min(prev.boredom + 1, 100)
      }));
    }, 38000);

    return () => clearInterval(timer);
  }, [token]);

  // 연속 상호작용 횟수 관리 (3번 넘으면 pounce)
  const interactionCountRef = useRef(0);
  // 특정 행동을 강제 유지하는 타이머 (상호작용 시 3초 유지 등)
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 자아(AI) 및 상태 결정 로직
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

  // 3. 상호작용 로직 (핵심)     
  const interact = useCallback(async () => {
    if (actionTimeoutRef.current || status === 'pounce') return;

    interactionCountRef.current += 1;

    // 3번 연속 클릭했거나 심심함 수치가 30 이하일 때
    if (interactionCountRef.current >= 3 || stats.boredom <= 30) {
      setStatus('pounce');
      interactionCountRef.current = 0; // 카운트 초기화
      handleStatsUpdate();
      return;
    } else {
      const actions = ['groom', 'alert', 'creep', 'walk', 'run', 'jump'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setStatus(randomAction);

      actionTimeoutRef.current = setTimeout(() => {
        actionTimeoutRef.current = null;
        setStatus('idle');
      }, 3000);
    }

    // 공통 수치 업데이트 함수
    async function handleStatsUpdate() {
      setStats(prev => ({
        ...prev,
        boredom: Math.max(prev.boredom - 30, 0),
        happiness: Math.max(prev.happiness + 1, 0),
      }));

      if (token) {
        try {
          const data = await interactPet();
          if (data) {
            setStats({
              happiness: data.happiness,
              boredom: data.boredom
            });
          }
        } catch (e) { /* 에러 처리 */ }
      }
    }

    handleStatsUpdate();
  }, [status, token, stats.boredom]);

  return { status, stats, interact, setStatus };
};