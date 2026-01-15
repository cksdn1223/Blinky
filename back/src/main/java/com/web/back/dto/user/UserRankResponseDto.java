package com.web.back.dto.user;

import java.util.List;

public record UserRankResponseDto(
        List<UserRankDto> top10,
        UserRankDto myRank
) {
    public record UserRankDto(
        int rank,
        String nickname,
        long totalFocusSec
    ) {}
}
