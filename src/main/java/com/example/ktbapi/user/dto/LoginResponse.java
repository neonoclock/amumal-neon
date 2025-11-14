package com.example.ktbapi.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginResponse {

    @JsonProperty("user_id")
    public final Long userId;

    @JsonProperty("token_type")
    public final String tokenType;

    @JsonProperty("access_token")
    public final String accessToken;

    @JsonProperty("refresh_token")
    public final String refreshToken;

    @JsonProperty("expires_in")
    public final int expiresIn;

    public LoginResponse(Long userId, String tokenType, String accessToken, String refreshToken, int expiresIn) {
        this.userId = userId;
        this.tokenType = tokenType;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
    }
}
