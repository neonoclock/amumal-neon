package com.example.ktbapi.post.dto;

import com.example.ktbapi.post.api.PostSortKey;

import java.time.LocalDateTime;

public class PostSearchCond {
    public String keyword;
    public Long authorId;
    public Integer minLikes;
    public Integer minViews;
    public LocalDateTime fromCreatedAt;
    public LocalDateTime toCreatedAt;
    public PostSortKey sort = PostSortKey.DATE;
}