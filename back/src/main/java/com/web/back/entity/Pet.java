package com.web.back.entity;

import jakarta.persistence.*;
import lombok.*;

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
    private int happiness;

    @Column(nullable = false)
    private int boredom;

    @Builder
    public Pet(User user, String name) {
        this.user = user;
        this.name = name;
        this.happiness = 0;
        this.boredom = 0;
    }

    // 편의 메서드
    public void changeStatus(int happiness, int boredom) {
        this.happiness = happiness;
        this.boredom = boredom;
    }
}
