package com.web.back.dto.user;

import com.web.back.entity.User;
import com.web.back.enums.UserRole;

import java.time.LocalDateTime;

public record UserResponseDto(
        String email,
        String nickname,
        Long totalFocusTime,
        UserRole role,
        LocalDateTime createdAt,
        String petNickname,
        double petHappiness,
        double petBoredom
) {
    public static UserResponseDto from(User user) {
        return new UserResponseDto(
                user.getEmail(),
                user.getNickname(),
                user.getTotalFocusSec(),
                user.getRole(),
                user.getCreatedAt(),
                user.getPet().getName(),
                user.getPet().getHappiness(),
                user.getPet().getCalculatedBoredom()
        );
    }
}
