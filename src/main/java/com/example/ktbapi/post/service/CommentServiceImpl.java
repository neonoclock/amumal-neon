package com.example.ktbapi.post.service;

import com.example.ktbapi.common.TimeUtil;
import com.example.ktbapi.common.dto.IdResponse;
import com.example.ktbapi.common.exception.CommentNotFoundException;
import com.example.ktbapi.common.exception.PostNotFoundException;
import com.example.ktbapi.common.exception.UnauthorizedException;
import com.example.ktbapi.post.dto.CommentCreateOrUpdateRequest;
import com.example.ktbapi.post.dto.CommentResponse;
import com.example.ktbapi.post.dto.CommentUpdatedResponse;
import com.example.ktbapi.post.model.Comment;
import com.example.ktbapi.post.model.Post;
import com.example.ktbapi.post.repo.CommentJpaRepository;
import com.example.ktbapi.post.repo.PostJpaRepository;
import com.example.ktbapi.user.model.User;
import com.example.ktbapi.user.repo.UserJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CommentServiceImpl implements CommentService {

    private final CommentJpaRepository commentRepo;
    private final PostJpaRepository postRepo;
    private final UserJpaRepository userRepo;

    public CommentServiceImpl(CommentJpaRepository commentRepo, PostJpaRepository postRepo, UserJpaRepository userRepo) {
        this.commentRepo = commentRepo;
        this.postRepo = postRepo;
        this.userRepo = userRepo;
    }

    @Override
    public List<CommentResponse> getComments(Long postId) {
        var comments = commentRepo.findByPostIdWithAuthorOrderByCreatedAtAsc(postId);
        return comments.stream().map(CommentResponse::from).toList();
    }

    @Override
    @Transactional
    public IdResponse createComment(Long userId, Long postId, CommentCreateOrUpdateRequest req) {
        User user = userRepo.findById(userId).orElseThrow(UnauthorizedException::new);
        Post post = postRepo.findById(postId).orElseThrow(() -> new PostNotFoundException(postId));

        Comment comment = new Comment(post, user, req.content);
        commentRepo.save(comment);
        return new IdResponse(comment.getId());
    }

    @Override
    @Transactional
    public CommentUpdatedResponse updateComment(Long userId, Long postId, Long commentId, CommentCreateOrUpdateRequest req) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new UnauthorizedException();
        }

        comment.changeContent(req.content);

        return new CommentUpdatedResponse(
                comment.getId(),
                TimeUtil.format(comment.getUpdatedAt()),
                comment.getContent()
        );
    }

    @Override
    @Transactional
    public void deleteComment(Long userId, Long postId, Long commentId) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new UnauthorizedException();
        }

        commentRepo.delete(comment);
    }
}
