package com.web.back.service;

import com.web.back.dto.user.UserSearchResponseDto;
import com.web.back.entity.User;
import com.web.back.enums.FriendStatus;
import com.web.back.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional
    public void changeNickname(String nickname, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("닉네임을 변경하는 과정에서 해당 유저를 찾을 수 없습니다."));
        user.changeNickname(nickname);
    }

    @Transactional(readOnly = true)
    public List<UserSearchResponseDto> searchUser(String query, User user) {
        if (query == null || query.trim().isEmpty()) return List.of();

        User currentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("유저를 찾을 수 없습니다."));

        String trimmedQuery = query.trim();
        List<User> searchResults = fetchRawSearchResults(trimmedQuery, currentUser.getId());;

        return searchResults.stream()
                .filter(target -> isNotBlockedEachOther(currentUser, target))
                // 정확히 일치하는 값을 리스트 맨 앞으로
                .sorted((u1, u2) -> compareExactMatch(u1, u2, trimmedQuery))
                .limit(20)
                .map(u -> new UserSearchResponseDto(
                        u.getNickname(),
                        u.getEmail(),
                        currentUser.isFollowing(u),
                        u.isFollowing(currentUser),
                        u.getPet().getName(),
                        u.getPet().getCalculatedHappiness(),
                        u.getPet().getCalculatedBoredom()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSearchResponseDto> getFollowings(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("팔로잉 목록을 가져오는 과정에서 유저를 찾을 수 없습니다."));
        return user.getFollowingList().stream()
                .filter(f -> f.getStatus() == FriendStatus.FOLLOW)
                .filter(f -> isNotBlockedBy(f.getFollowing(), user))
                .map(f -> {
                    User target = f.getFollowing();
                    return new UserSearchResponseDto(
                            target.getNickname(),
                            target.getEmail(),
                            true,
                            target.isFollowing(user),
                            target.getPet().getName(),
                            target.getPet().getCalculatedHappiness(),
                            target.getPet().getCalculatedBoredom()
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSearchResponseDto> getFollowers(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("팔로워 목록을 가져오는 과정에서 유저를 찾을 수 없습니다."));
        return user.getFollowerList().stream()
                .filter(f -> f.getStatus() == FriendStatus.FOLLOW)
                .filter(f -> isNotBlockedBy(user, f.getFollower()))
                .map(f -> {
                    User target = f.getFollower();
                    return new UserSearchResponseDto(
                            target.getNickname(),
                            target.getEmail(),
                            user.isFollowing(target),
                            true,
                            target.getPet().getName(),
                            target.getPet().getCalculatedHappiness(),
                            target.getPet().getCalculatedBoredom()
                    );
                })
                .toList();
    }



    // 헬퍼메서드
    private boolean isNotBlockedBy(User subject, User object) {
        return subject.getFollowingList().stream()
                .noneMatch(f -> f.getFollowing().equals(object) && f.getStatus() == FriendStatus.BLOCK);
    }

    private boolean isNotBlockedEachOther(User me, User target) {
        return isNotBlockedBy(me, target) && isNotBlockedBy(target, me);
    }

    private List<User> fetchRawSearchResults(String query, UUID excludeId) {
        if (query.contains("@")) {
            return userRepository.findByEmailContainingAndIdNot(query, excludeId);
        }
        return userRepository.findByNicknameContainingAndIdNot(query, excludeId);
    }

    private int compareExactMatch(User u1, User u2, String query) {
        boolean u1Exact = u1.getNickname().equals(query) || u1.getEmail().equals(query);
        boolean u2Exact = u2.getNickname().equals(query) || u2.getEmail().equals(query);
        return Boolean.compare(u2Exact, u1Exact);
    }
}
