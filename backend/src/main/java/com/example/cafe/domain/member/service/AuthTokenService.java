package com.example.cafe.domain.member.service;

import com.example.cafe.domain.member.entity.Member;
import com.example.cafe.global.util.Ut;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthTokenService {

    @Value("${custom.jwt.secret-key}")
    private String jwtSecretKey;

    @Value("${custom.jwt.expire-seconds}")
    private int jwtExpireSeconds;

    // Member 정보를 기반으로 JWT 토큰을 생성
    public String genAccessToken(Member member) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", member.getId());
        claims.put("email", member.getEmail());
        claims.put("authority", member.getAuthority());
        return Ut.Jwt.createToken(jwtSecretKey, jwtExpireSeconds, claims);
    }
}