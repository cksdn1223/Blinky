package com.web.back.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 로그인 API 요청은 토큰 검증 없이 통과시킵니다.
        if (request.getServletPath().equals("/login") && request.getMethod().equalsIgnoreCase(HttpMethod.POST.name())) {
            filterChain.doFilter(request, response);
            return;
        }
        // 요청 헤더에서 Authorization 값을 가져옵니다. (JWT 토큰)
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = authHeader.substring(7).trim();

        // 토큰이 비어있으면 역시 비로그인 요청으로 처리
        if (token.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        // JWT 토큰을 검증하고 Optional<String>으로 사용자 이름을 가져옵니다.
        jwtService.validateAndExtractUsername(token).ifPresent(username -> {
            // SecurityContext에 이미 인증 정보가 없는 경우에만 실행합니다.
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        });

        // 다음 필터로 요청과 응답을 전달합니다.
        filterChain.doFilter(request, response);
    }
}