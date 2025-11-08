package com.example.ktbapi.post.service;

import com.example.ktbapi.common.TimeUtil;
import com.example.ktbapi.common.dto.IdResponse;
import com.example.ktbapi.common.exception.*;
import com.example.ktbapi.common.paging.PagedResponse;
import com.example.ktbapi.post.api.PostSortKey;
import com.example.ktbapi.post.dto.*;
import com.example.ktbapi.post.mapper.PostMapper;
import com.example.ktbapi.post.model.LikeRecord;
import com.example.ktbapi.post.model.Post;
import com.example.ktbapi.post.repo.CommentJpaRepository;
import com.example.ktbapi.post.repo.LikeRecordJpaRepository;
import com.example.ktbapi.post.repo.PostJpaRepository;
import com.example.ktbapi.user.model.User;
import com.example.ktbapi.user.repo.UserJpaRepository;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class PostServiceImpl implements PostService {

    private final PostJpaRepository postRepo;
    private final CommentJpaRepository commentRepo;
    private final LikeRecordJpaRepository likeRepo;
    private final UserJpaRepository userRepo;
    private final EntityManager em;

    public PostServiceImpl(PostJpaRepository postRepo,
                           CommentJpaRepository commentRepo,
                           LikeRecordJpaRepository likeRepo,
                           UserJpaRepository userRepo,
                           EntityManager em) {
        this.postRepo = postRepo;
        this.commentRepo = commentRepo;
        this.likeRepo = likeRepo;
        this.userRepo = userRepo;
        this.em = em;
    }

    private Sort toSort(PostSortKey sortKey) {
        return switch (sortKey) {
            case DATE  -> Sort.by(Sort.Direction.DESC, "createdAt");
            case LIKES -> Sort.by(Sort.Direction.DESC, "likes");
            case VIEWS -> Sort.by(Sort.Direction.DESC, "views");
        };
    }

    @Override
    public PagedResponse<PostSummaryResponse> getPosts(int page, int limit, PostSortKey sort) {
        Pageable pageable = PageRequest.of(page, limit, toSort(sort));
        Page<Post> pageData = postRepo.findAll(pageable);

        var items = pageData.getContent().stream()
                .map(PostMapper::toSummary)
                .toList();

        return new PagedResponse<>(
                items,
                pageData.getNumber(),
                pageData.getSize(),
                pageData.getTotalElements(),
                pageData.hasNext()
        );
    }

    @Override
    public PagedResponse<PostSummaryResponse> searchPosts(
            String keyword, Long authorId, Integer minLikes, Integer minViews,
            int page, int limit, PostSortKey sort) {

        Pageable pageable = PageRequest.of(page, limit, toSort(sort));
        Page<Post> result = postRepo.search(keyword, authorId, minLikes, minViews, pageable);

        var items = result.getContent().stream()
                .map(PostMapper::toSummary)
                .toList();

        return new PagedResponse<>(
                items,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.hasNext()
        );
    }

    @Override
    @Transactional
    public PostDetailResponse getPostDetail(Long postId, Long viewerUserId) {
        Post post = postRepo.findDetailWithAuthor(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));

        postRepo.increaseViews(postId);
        em.clear();

        var comments = commentRepo.findByPostIdWithAuthorOrderByCreatedAtAsc(postId);
        return PostMapper.toDetail(post, comments);
    }

    @Override
    @Transactional
    public IdResponse createPost(Long userId, PostCreateRequest req) {
        User author = userRepo.findById(userId).orElseThrow(UnauthorizedException::new);
        Post post = new Post(author, req.title, req.content, req.imageUrl);
        postRepo.save(post);
        return new IdResponse(post.getId());
    }

    @Override
    @Transactional
    public PostUpdatedResponse updatePost(Long userId, Long postId, PostUpdateRequest req) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));
        if (!post.getAuthor().getId().equals(userId)) throw new UnauthorizedException();

        post.updateDetails(req.title(), req.content(), req.imageUrl());

        return new PostUpdatedResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getImageUrl(),
                TimeUtil.format(post.getUpdatedAt())
        );
    }

    @Override
    @Transactional
    public void deletePost(Long userId, Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));
        if (!post.getAuthor().getId().equals(userId)) throw new UnauthorizedException();
        postRepo.delete(post);
    }

    @Override
    @Transactional
    public void like(Long userId, Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));
        User user = userRepo.findById(userId).orElseThrow(UnauthorizedException::new);

        if (likeRepo.existsByUserIdAndPostId(userId, postId)) throw new AlreadyLikedException();

        likeRepo.save(LikeRecord.of(user, post));
        post.increaseLikes();
    }

    @Override
    @Transactional
    public void unlike(Long userId, Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));
        if (!likeRepo.existsByUserIdAndPostId(userId, postId)) throw new NotLikedException();
        likeRepo.deleteByUserIdAndPostId(userId, postId);
        post.decreaseLikes();
    }

    @Override
    public List<PostSummaryResponse> getAllPosts_NPlusOne() {
        return postRepo.findAll()
                .stream()
                .map(PostMapper::toSummary)
                .toList();
    }

    @Override
    public List<PostSummaryResponse> getAllPosts_EntityGraph() {
        return postRepo.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(PostMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional
    public long resetViews(int threshold) {
        long updated = postRepo.resetViewsOver(threshold);
        em.clear();
        return updated;
    }
}