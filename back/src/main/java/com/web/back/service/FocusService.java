package com.web.back.service;

import com.web.back.dto.focus.FocusRequestDto;
import com.web.back.dto.focus.FocusResponseDto;
import com.web.back.entity.FocusLog;
import com.web.back.entity.User;
import com.web.back.repository.FocusLogRepository;
import com.web.back.repository.UserRepository;
import jakarta.transaction.Transactional;
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


    public FocusResponseDto finishSession(User user, FocusRequestDto request) {
        LocalDateTime startAt = request.startAt();
        LocalDateTime endAt = LocalDateTime.now();

        FocusLog log = FocusLog.builder()
                .user(user)
                .startAt(startAt)
                .endAt(endAt)
                .videoIds(request.videoIds())
                .build();
        focusLogRepository.save(log);

        long durationSeconds = Duration.between(startAt, endAt).getSeconds();
        if (durationSeconds < 0) durationSeconds = 0;

        user.addFocusTime(durationSeconds);
        user.updatePetStatus(request.petHappiness(), request.petBoredom());
        userRepository.save(user);
        return new FocusResponseDto(user.getTotalFocusSec());
    }
}
