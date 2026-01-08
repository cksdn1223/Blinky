package com.web.back.repository;

import com.web.back.entity.Friend;
import com.web.back.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendRepository extends JpaRepository<Friend, Long> {
    boolean existsByFollowerAndFollowing(User follower, User following);
}
