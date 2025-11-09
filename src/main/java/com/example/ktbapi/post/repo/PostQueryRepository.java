package com.example.ktbapi.post.repo;

import com.example.ktbapi.post.dto.PostSearchCond;
import com.example.ktbapi.post.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface PostQueryRepository {
    Optional<Post> findDetailWithAuthor(Long postId);
    long increaseViews(Long postId);
    long resetViewsOver(int threshold);
    Page<Post> search(PostSearchCond cond, Pageable pageable);
}