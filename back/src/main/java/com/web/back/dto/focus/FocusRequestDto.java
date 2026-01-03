package com.web.back.dto.focus;

import java.time.LocalDateTime;
import java.util.List;

public record FocusRequestDto(
        LocalDateTime startAt,
        List<String> videoIds,
        int petHappiness,
        int petBoredom
) {
}
