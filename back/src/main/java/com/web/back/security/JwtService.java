package com.web.back.security;

import com.web.back.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-time}")
    private long expirationTime;

    @Value("${jwt.issuer}")
    private String issuer;

    @Value("${jwt.audience}")
    private String audience;

    private SecretKey signingKey;
    private JwtParser jwtParser;

    @PostConstruct
    public void init() {
        // 1. Secret Key 검증 및 생성
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length * 8 < 256) {
            log.error("JWT Secret Key is too short. It must be at least 256 bits (32 bytes).");
            throw new IllegalArgumentException("JWT Secret Key must be at least 256 bits long.");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);

        // 2. JWT 파서 초기화 (검증 규칙 설정)
        this.jwtParser = Jwts.parser()
                .requireIssuer(issuer)
                .requireAudience(audience)
                .verifyWith(signingKey)
                .build();
    }

    private SecretKey getSigningKey() {
        return this.signingKey;
    }

    public String getToken(User user) {
        return Jwts.builder()
                .claim("userId", user.getId())
                .claim("role", user.getRole())
                .issuer(issuer)
                .claim("aud", audience) // "audience" 클레임 설정
                .subject(user.getUsername())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    public Optional<String> validateAndExtractUsername(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        try {
            Claims claims = jwtParser.parseSignedClaims(token).getPayload();
            return Optional.ofNullable(claims.getSubject());
        } catch (ExpiredJwtException e) {
            log.warn("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Malformed JWT token: {}", e.getMessage());
        } catch (SignatureException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return Optional.empty();
    }
}