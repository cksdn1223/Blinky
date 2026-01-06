package com.web.back.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import static java.time.Duration.between;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Pet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 펫과 1대1 관계
    @OneToOne
    @JoinColumn(name = "user_id")
    @Setter
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private double happiness;

    @Column(nullable = false)
    private double boredom;

    private LocalDateTime lastUpdated;

    @Builder
    public Pet(User user, String name) {
        this.user = user;
        this.name = name;
        this.happiness = 0;
        this.boredom = 0;
    }

    private static final double BOREDOM_INCREASE_RATE = 0.028;

    // 헬퍼 메서드

    public void changeNickname(String nickname) {
        this.name = nickname;
    }

    // 상태 업데이트 시 시간을 갱신하는 메서드
    public void changeStatus(double happiness, double boredom) {
        this.happiness = happiness;
        this.boredom = boredom;
        this.lastUpdated = LocalDateTime.now(); // 업데이트 시점 기록
    }


    // 현재 심심함을 계산하여 반환하는 로직
    public double getCalculatedBoredom() {
        if (this.lastUpdated == null) return this.boredom;

        long secondsPassed = between(this.lastUpdated, LocalDateTime.now()).getSeconds();
        double addedBoredom = secondsPassed * BOREDOM_INCREASE_RATE;

        // 최대치 100 제한
        return Math.min(this.boredom + addedBoredom, 100);
    }


}
