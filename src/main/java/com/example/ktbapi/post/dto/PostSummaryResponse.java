package com.example.ktbapi.post.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PostSummaryResponse(
        @JsonProperty("post_id") Long id,
        String title,
        @JsonProperty("author_id") Long authorId,
        @JsonProperty("author_name") String authorNickname,
        int likes,
        int views,
        @JsonProperty("created_at") String createdAt,
        @JsonProperty("author_profile_image") String authorProfileImage
) {}