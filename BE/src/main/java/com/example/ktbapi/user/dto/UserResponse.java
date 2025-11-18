package com.example.ktbapi.user.dto;

import com.example.ktbapi.user.model.User;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class UserResponse {

    @JsonProperty("user_id")
    public Long id;

    public String email;

    public String nickname;

    public String role;

    @JsonProperty("profile_image")
    public String profileImage;

    @JsonProperty("created_at")
    public LocalDateTime createdAt;

    @JsonProperty("updated_at")
    public LocalDateTime updatedAt;

    public static UserResponse from(User user) {
        UserResponse dto = new UserResponse();
        dto.id = user.getId();
        dto.email = user.getEmail();
        dto.nickname = user.getNickname();
        dto.role = user.getRole().name();
        dto.profileImage = user.getProfileImage();
        dto.createdAt = user.getCreatedAt();
        dto.updatedAt = user.getUpdatedAt();
        return dto;
    }
}
