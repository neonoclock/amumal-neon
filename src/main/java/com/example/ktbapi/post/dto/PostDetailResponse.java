package com.example.ktbapi.post.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record PostDetailResponse(
        @JsonProperty("post_id") Long id,
        String title,
        @JsonProperty("author_id") Long authorId,
        @JsonProperty("author_name") String authorNickname,
        @JsonProperty("author_profile_image") String authorProfileImage,
        String content,
        @JsonProperty("image_url") String imageUrl,
        int likes,
        int views,
        @JsonProperty("created_at") String createdAt,
        @JsonProperty("updated_at") String updatedAt,
        List<CommentItem> comments
) {
    public record CommentItem(
            @JsonProperty("comment_id") Long id,
            @JsonProperty("author_id") Long authorId,
            @JsonProperty("author_name") String authorNickname,
            String content,
            @JsonProperty("created_at") String createdAt
    ) {}
}