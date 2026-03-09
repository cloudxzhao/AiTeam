package com.aiteam.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String authToken;
    private String refresh;
    private String tokenType;

    public static AuthResponse of(Long id, String username, String fullName, String email,
                                   String authToken, String refreshToken) {
        return AuthResponse.builder()
                .id(id)
                .username(username)
                .fullName(fullName)
                .email(email)
                .authToken(authToken)
                .refresh(refreshToken)
                .tokenType("Bearer")
                .build();
    }
}