package com.example.ktbapi.post.repo;

import com.example.ktbapi.post.dto.CommentSearchCond;
import com.example.ktbapi.post.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentQueryRepository {
    Page<Comment> search(CommentSearchCond cond, Pageable pageable);
}
