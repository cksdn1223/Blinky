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
        if (query == null || query.trim().length() < 2) return List.of();

        User currentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("유저를 찾을 수 없습니다."));

        String trimmedQuery = query.trim();
        List<User> searchResults;

        if (trimmedQuery.contains("@")) {
            searchResults = userRepository.findByEmailContainingAndIdNot(trimmedQuery, currentUser.getId());
        }
        // 2. 닉네임 검색 모드
        else {
            searchResults = userRepository.findByNicknameContainingAndIdNot(trimmedQuery, currentUser.getId());
        }

        return searchResults.stream()
                // 정확히 일치하는 값을 리스트 맨 앞으로
                .sorted((u1, u2) -> {
                    boolean u1Exact = u1.getNickname().equals(trimmedQuery) || u1.getEmail().equals(trimmedQuery);
                    boolean u2Exact = u2.getNickname().equals(trimmedQuery) || u2.getEmail().equals(trimmedQuery);
                    if (u1Exact && !u2Exact) return -1;
                    if (!u1Exact && u2Exact) return 1;
                    return 0;
                })
                .limit(20)
                .map(u -> new UserSearchResponseDto(
                        u.getNickname(),
                        u.getEmail(),
                        currentUser.isFollowing(u),
                        u.isFollowing(currentUser),
                        u.getPet().getName()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSearchResponseDto> getFollowings(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("팔로잉 목록을 가져오는 과정에서 유저를 찾을 수 없습니다."));
        return user.getFollowingList().stream()
                .filter(f -> f.getStatus() == FriendStatus.FOLLOW)
                .map(f -> {
                    User target = f.getFollowing();
                    return new UserSearchResponseDto(
                            target.getNickname(),
                            target.getEmail(),
                            true,
                            target.isFollowing(user),
                            target.getPet().getName()
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
                .map(f -> {
                    User target = f.getFollower();
                    return new UserSearchResponseDto(
                            target.getNickname(),
                            target.getEmail(),
                            user.isFollowing(target),
                            true,
                            target.getPet().getName()
                    );
                })
                .toList();
    }
}
