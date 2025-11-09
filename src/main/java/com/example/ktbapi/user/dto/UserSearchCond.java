package com.example.ktbapi.user.dto;

import com.example.ktbapi.user.model.UserRole;

import java.time.LocalDateTime;

public class UserSearchCond {
    public String emailContains;
    public String nicknameContains;
    public UserRole role;
    public LocalDateTime fromCreatedAt;
    public LocalDateTime toCreatedAt;
}