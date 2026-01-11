package com.web.back.dto.share;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class MusicDto {
    private String videoId;
    private boolean playing;
    private long progressMs;
    private String ownerEmail;
}
