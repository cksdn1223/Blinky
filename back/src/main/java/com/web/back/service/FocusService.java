package com.web.back.service;

import com.web.back.dto.focus.FocusRequestDto;
import com.web.back.dto.focus.FocusResponseDto;
import com.web.back.entity.FocusLog;
import com.web.back.entity.Pet;
import com.web.back.entity.User;
import com.web.back.repository.FocusLogRepository;
import com.web.back.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class FocusService {
    private final FocusLogRepository focusLogRepository;
    private final UserRepository userRepository;
    private static final int RETENTION_DAYS = 90;


    @Transactional
    public FocusResponseDto finishSession(User user, FocusRequestDto request) {
        User currentUser = userRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("세션을 업데이트하는 중 해당 유저를 찾지 못했습니다."));
        Pet pet = currentUser.getPet();

        double serverCalculateBoredom = pet.getCalculatedBoredom();

        LocalDateTime startAt = request.startAt();
        LocalDateTime endAt = LocalDateTime.now();
        long durationSeconds = Math.max(0, Duration.between(startAt, endAt).getSeconds());

        double finalBoredom = request.petBoredom();
        if (finalBoredom <= 0 && serverCalculateBoredom > 5) {
            finalBoredom = serverCalculateBoredom;
        }

        FocusLog log = FocusLog.builder()
                .user(currentUser)
                .startAt(startAt)
                .endAt(endAt)
                .videoIds(request.videoIds())
                .build();
        focusLogRepository.save(log);

        currentUser.addFocusTime(durationSeconds);
        double nextHappiness = pet.getHappiness() + (durationSeconds / 3600.0);

        pet.changeStatus(nextHappiness, finalBoredom);

        return new FocusResponseDto(user.getTotalFocusSec());
    }

    /**
     * 오래된 집중 세션 로그를 주기적으로 삭제합니다. (매일 새벽 5시에 실행)
     * 데이터가 무한정 쌓이는 것을 방지합니다.
     */
    @Scheduled(cron = "0 0 5 * * ?")
    @Transactional
    public void cleanupOldFocusLogs() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(RETENTION_DAYS);
        focusLogRepository.deleteByEndAtBefore(cutoffDate);
    }
}
