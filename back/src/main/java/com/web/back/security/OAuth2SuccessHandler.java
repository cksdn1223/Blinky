package com.web.back.security;

import com.web.back.entity.User;
import com.web.back.enums.UserRole;
import com.web.back.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler{
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${oauth2.success.redirect-url}")
    private String redirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attrs = oauthUser.getAttributes();

        String email = (String) attrs.get("email");

        // 1. 이메일 필수 체크
        if (email == null || email.isBlank()) {
            response.sendRedirect(redirectUrl + "?error=email_required");
            return;
        }

        // 2. 유저 조회 또는 생성 (랜덤 닉네임 포함)
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    String randomNickname = "USER_" + generateRandomDigits(8);
                    return User.builder() // User 엔티티에 @Builder가 있다고 가정하거나 생성자 사용
                            .email(email)
                            .nickname(randomNickname)
                            .role(UserRole.USER)
                            .build();
                });

        userRepository.save(user);

        // 3. 토큰 생성 및 리다이렉트
        String token = jwtService.getToken(user);
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUrl)
                .queryParam("token", token)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUriString();

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    /**
     * n자리의 랜덤 숫자를 생성하는 헬퍼 메서드
     */
    private String generateRandomDigits(int n) {
        StringBuilder sb = new StringBuilder();
        Random random = new java.util.Random();
        for (int i = 0; i < n; i++) {
            sb.append(random.nextInt(10)); // 0~9 사이 숫자
        }
        return sb.toString();
    }
}