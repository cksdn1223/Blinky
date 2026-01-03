import { useState, useEffect, useCallback, useRef } from 'react';
import { PetStatus } from '../types';
import { useUserStore } from '../store/useAuthStore';

export const useBlinkyLogic = () => {
  const { userStats } = useUserStore();
  const [status, setStatus] = useState('sleep'); // 기본 상태는 수면
  const [stats, setStats] = useState<PetStatus>({
    happiness: 0,
    boredom: 0
  });

  useEffect(() => {
    if (userStats) {
      setStats({
        happiness: userStats.petHappiness,
        boredom: userStats.petBoredom
      });
    }
  }, [userStats]);

  // 연속 상호작용 횟수 관리 (3번 넘으면 pounce)
  const interactionCountRef = useRef(0);
  // 특정 행동을 강제 유지하는 타이머 (상호작용 시 3초 유지 등)
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. 수치 자동 증가 (10초마다)
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        ...prev,
        boredom: Math.min(prev.boredom + 0.28, 100)
      }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // 2. 자아(AI) 및 상태 결정 로직
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
        if (status !== 'sleep') setStatus('sleep');
      }
    }, 5000);

    return () => clearInterval(decisionTimer);
  }, [stats, status]);

  // 3. 상호작용 로직 (핵심)     
  const interact = useCallback(() => {
    if (actionTimeoutRef.current) return;
    // pounce 애니메이션 중에도 클릭 방지
    if (status === 'pounce') return;

    interactionCountRef.current += 1;

    // 3번 연속 클릭 시 pounce 발생
    if (interactionCountRef.current >= 3) {
      setStatus('pounce');
      interactionCountRef.current = 0; // 카운트 초기화
      return;
      // pounce는 애니메이션이 끝날 때(onAnimationEnd) idle/sleep으로 돌아가므로 
      // 별도 타이머를 설정하지 않거나 길게 잡습니다.
    } else {
      // groom: 2, alert: 3, walk: 4, run: 5, creep: 7, pounce: 9,
      const actions = ['groom', 'alert', 'creep', 'walk', 'run', 'jump'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setStatus(randomAction);

      // 3초간 유지 후 다시 자아 로직에 맡김
      actionTimeoutRef.current = setTimeout(() => {
        actionTimeoutRef.current = null;
        setStatus('idle');
      }, 3000);
    }

    // 경험치 및 심심함 해소
    setStats(prev => ({
      ...prev,
      boredom: Math.max(prev.boredom - 30, 0),
      happiness: Math.max(prev.happiness + 1, 0),
    }));
  }, [status]);

  return { status, stats, interact, setStatus };
};