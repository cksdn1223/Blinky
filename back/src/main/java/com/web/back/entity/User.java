package com.web.back.entity;

import com.web.back.enums.FriendStatus;
import com.web.back.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;
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

    @OneToMany(mappedBy = "follower", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<Friend> followingList = new ArrayList<>();

    @OneToMany(mappedBy = "following", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<Friend> followerList = new ArrayList<>();

    @Builder
    public User(String email, String nickname, UserRole role) {
        this.email = email;
        this.nickname = nickname;
        this.role = (role != null) ? role : UserRole.USER;
        this.totalFocusSec = 0L;
    }

    // 편의 메서드
    public void changeNickname(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            throw new IllegalArgumentException("닉네임은 비거나 null 일 수 없습니다.");
        }
        this.nickname = nickname;
    }

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

    public void toggleFollow(User targetUser) {
        if (this.equals(targetUser)) {
            throw new IllegalArgumentException("자기 자신은 팔로우할 수 없습니다.");
        }

        // 이미 관계가 있는지 확인
        Optional<Friend> existingRelation = this.followingList.stream()
                .filter(f -> f.getFollowing().equals(targetUser))
                .findFirst();

        if (existingRelation.isPresent()) {
            // 이미 팔로우 중이거나 차단 중이라면 관계 삭제
            Friend relation = existingRelation.get();
            this.followingList.remove(relation);
            targetUser.getFollowerList().remove(relation);
        } else {
            // 2. 관계가 없다면 -> 새로 팔로우
            Friend newFriend = Friend.builder()
                    .follower(this)
                    .following(targetUser)
                    .status(FriendStatus.FOLLOW)
                    .build();
            this.followingList.add(newFriend);
            targetUser.getFollowerList().add(newFriend);
        }
    }

    public void block(User targetUser) {
        Optional<Friend> existingRelation = this.followingList.stream()
                .filter(f -> f.getFollowing().equals(targetUser))
                .findFirst();
        if (existingRelation.isPresent()) {
            existingRelation.get().updateStatus(FriendStatus.BLOCK);
        } else {
            Friend blockRelation = Friend.builder()
                    .follower(this)
                    .following(targetUser)
                    .status(FriendStatus.BLOCK)
                    .build();
            this.followingList.add(blockRelation);
        }
    }

    public boolean isFollowing(User target) {
        return followingList.stream()
                .anyMatch(f -> f.getFollowing().equals(target));
    }

    public boolean isMutualFriend(User target) {
        // 나도 상대를 팔로우하고, 상대도 나를 팔로우 중인지 확인
        boolean iFollowTarget = this.isFollowing(target);
        boolean targetFollowsMe = target.getFollowingList().stream()
                .anyMatch(f -> f.getFollowing().equals(this));
        return iFollowTarget && targetFollowsMe;
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
