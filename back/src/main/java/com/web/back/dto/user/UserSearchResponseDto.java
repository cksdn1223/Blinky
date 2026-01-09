package com.web.back.dto.user;

public record UserSearchResponseDto(
        String nickname,
        String email,
        boolean isFollowing,
        boolean isFollower,
        String petName,
        double petHappiness,
        double petBoredom
) {
}
