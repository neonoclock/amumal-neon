package com.example.ktbapi.post.mapper;

import com.example.ktbapi.common.TimeUtil;
import com.example.ktbapi.post.dto.PostDetailResponse;
import com.example.ktbapi.post.dto.PostSummaryResponse;
import com.example.ktbapi.post.model.Comment;
import com.example.ktbapi.post.model.Post;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public final class PostMapper {
    private PostMapper() { }

    private static String fmt(Object t) {
        if (t == null) return null;
        if (t instanceof LocalDateTime ldt) return TimeUtil.format(ldt);
        return String.valueOf(t);
    }

    public static PostSummaryResponse toSummary(Post p) {
        return new PostSummaryResponse(
                p.getId(),
                p.getTitle(),
                p.getAuthor() != null ? p.getAuthor().getId() : null,
                p.getAuthor() != null ? p.getAuthor().getNickname() : null,
                p.getLikes(),
                p.getViews(),
                fmt(p.getCreatedAt()),
                p.getAuthor() != null ? p.getAuthor().getProfileImage() : null
        );
    }

    public static PostDetailResponse toDetail(Post p, List<Comment> comments) {
        var commentDtos = comments.stream()
                .map(c -> new PostDetailResponse.CommentItem(
                        c.getId(),
                        c.getAuthor() != null ? c.getAuthor().getId() : null,
                        c.getAuthor() != null ? c.getAuthor().getNickname() : null,
                        c.getContent(),
                        fmt(c.getCreatedAt())
                ))
                .collect(Collectors.toList());

        return new PostDetailResponse(
                p.getId(),
                p.getTitle(),
                p.getAuthor() != null ? p.getAuthor().getId() : null,
                p.getAuthor() != null ? p.getAuthor().getNickname() : null,
                p.getAuthor() != null ? p.getAuthor().getProfileImage() : null, 
                p.getContent(),
                p.getImageUrl(),
                p.getLikes(),
                p.getViews(),
                fmt(p.getCreatedAt()),
                fmt(p.getUpdatedAt()),
                commentDtos
        );
    }
}