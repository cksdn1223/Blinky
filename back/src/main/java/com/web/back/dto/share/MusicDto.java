package com.web.back.dto.share;

public record MusicDto(
    String videoId,
    boolean playing,
    long progressMs,
    String ownerEmail
) {
}
