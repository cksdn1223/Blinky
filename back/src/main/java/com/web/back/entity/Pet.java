package com.web.back.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private Long happiness = 0L;

    @Column(nullable = false)
    private int boredom = 0;
}
