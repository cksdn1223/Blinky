package com.web.back.entity;

import com.web.back.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String nickname;

    @Column(name = "total_focus_sec", nullable = false, columnDefinition = "bigint default 0")
    private Long totalFocusSec;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER; // 기본값 USER

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 펫과 1대1 관계
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Pet pet;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<FocusLog> focusLog = new ArrayList<>();

    @OneToMany(mappedBy = "follower", cascade = CascadeType.ALL)
    private final List<Friend> followingList = new ArrayList<>();

    @OneToMany(mappedBy = "following", cascade = CascadeType.ALL)
    private final List<Friend> followerList = new ArrayList<>();

    @Builder
    public User(String email, String nickname, UserRole role) {
        this.email = email;
        this.nickname = nickname;
        this.role = (role != null) ? role : UserRole.USER;
        this.totalFocusSec = 0L;
    }

    // 편의 메서드
    public void setPet(Pet pet) {
        this.pet = pet;
        // Pet 엔티티가 아직 이 유저를 모르고 있다면 설정해줌
        if (pet.getUser() != this) {
            pet.setUser(this);
        }
    }

    public void createDefaultPet(String randomNickname) {
        Pet defaultPet = Pet.builder()
                .name(randomNickname) // 초기 이름은 유저 닉네임과 동일하게 설정
                .build();
        this.setPet(defaultPet);
    }

    public void addFocusTime(long seconds) {
        if (seconds > 0) {
            this.totalFocusSec += seconds;
        }
    }


    public void follow(User targetUser) {
        Friend friend = Friend.builder()
                .follower(this)    // 나
                .following(targetUser) // 대상
                .status("ACTIVE")
                .build();

        this.followingList.add(friend);
        targetUser.getFollowerList().add(friend);
    }

    public List<User> getFollowings() {
        return followingList.stream()
                .map(Friend::getFollowing)
                .collect(Collectors.toList());
    }

    public List<User> getFollowers() {
        return followerList.stream()
                .map(Friend::getFollower)
                .collect(Collectors.toList());
    }

    public void updatePetStatus(double happiness, double boredom) {
        this.pet.changeStatus(happiness, boredom);
    }

    // UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return email; // 사용자 식별자로 email을 사용
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // 계정 만료 여부
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // 계정 잠김 여부
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 자격 증명 만료 여부
    }

    @Override
    public boolean isEnabled() {
        return true; // 계정 활성화 여부
    }
}
