package com.example.ktbapi.post.dto;

import java.time.LocalDateTime;

public class CommentSearchCond {
    public Long postId;
    public Long authorId;
    public String contentContains;
    public LocalDateTime fromCreatedAt;
    public LocalDateTime toCreatedAt;
}