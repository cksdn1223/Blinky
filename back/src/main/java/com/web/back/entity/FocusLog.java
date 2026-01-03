package com.web.back.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FocusLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime startAt;

    @Column(nullable = false)
    private LocalDateTime endAt;

    @ElementCollection
    @CollectionTable(name = "focus_log_videos", joinColumns = @JoinColumn(name = "focus_log_id"))
    @Column(name = "video_id")
    private List<String> videoIds = new ArrayList<>();

    @Builder
    public FocusLog(User user, LocalDateTime startAt, LocalDateTime endAt, List<String> videoIds) {
        this.user = user;
        this.startAt = startAt;
        this.endAt = endAt;
        this.videoIds = (videoIds != null) ? videoIds : new ArrayList<>();
    }

}
