package com.example.ktbapi.post.repo;

import com.example.ktbapi.post.dto.PostSearchCond;
import com.example.ktbapi.post.model.Post;
import com.example.ktbapi.post.model.QPost;
import com.example.ktbapi.user.model.QUser;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@Transactional(readOnly = true)
public class PostJpaRepositoryImpl implements PostQueryRepository {

    private final JPAQueryFactory query;
    private final EntityManager em;

    private static final QPost p = QPost.post;
    private static final QUser u = QUser.user;

    public PostJpaRepositoryImpl(EntityManager em) {
        this.em = em;
        this.query = new JPAQueryFactory(em);
    }

    @Override
    public Optional<Post> findDetailWithAuthor(Long postId) {
        Post found = query
                .selectFrom(p)
                .join(p.author, u).fetchJoin()
                .where(p.id.eq(postId))
                .fetchOne();
        return Optional.ofNullable(found);
    }

    @Override
    @Transactional
    public long increaseViews(Long postId) {
        long updated = query.update(p)
                .set(p.views, p.views.add(1))
                .where(p.id.eq(postId))
                .execute();
        em.clear();
        return updated;
    }

    @Override
    @Transactional
    public long resetViewsOver(int threshold) {
        long updated = query.update(p)
                .set(p.views, 0)
                .where(p.views.gt(threshold))
                .execute();
        em.clear();
        return updated;
    }

    @Override
    public Page<Post> search(PostSearchCond cond, Pageable pageable) {

        OrderSpecifier<?>[] orderSpecifiers = pageable.getSort().stream()
                .map(order -> {
                    var path = switch (order.getProperty()) {
                        case "createdAt" -> p.createdAt;
                        case "likes"     -> p.likes;
                        case "views"     -> p.views;
                        default          -> p.createdAt;
                    };
                    return order.isAscending() ? path.asc() : path.desc();
                })
                .toArray(OrderSpecifier[]::new);

        List<Post> content = query
                .selectFrom(p)
                .leftJoin(p.author, u).fetchJoin()
                .where(
                        titleOrContentContains(cond.keyword),
                        authorEq(cond.authorId),
                        likesGoe(cond.minLikes),
                        viewsGoe(cond.minViews),
                        createdAfter(cond.fromCreatedAt),
                        createdBefore(cond.toCreatedAt)
                )
                .orderBy(orderSpecifiers)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long totalL = query
                .select(p.count())
                .from(p)
                .where(
                        titleOrContentContains(cond.keyword),
                        authorEq(cond.authorId),
                        likesGoe(cond.minLikes),
                        viewsGoe(cond.minViews),
                        createdAfter(cond.fromCreatedAt),
                        createdBefore(cond.toCreatedAt)
                )
                .fetchOne();

        long total = totalL == null ? 0L : totalL;
        return new PageImpl<>(content, pageable, total);
    }



    private BooleanExpression titleOrContentContains(String keyword) {
        if (keyword == null || keyword.isBlank()) return null;
        String like = "%" + keyword.trim().toLowerCase() + "%";
        return p.title.lower().like(like).or(p.content.lower().like(like));
    }

    private BooleanExpression authorEq(Long authorId) {
        return authorId != null ? p.author.id.eq(authorId) : null;
    }

    private BooleanExpression likesGoe(Integer minLikes) {
        return minLikes != null ? p.likes.goe(minLikes) : null;
    }

    private BooleanExpression viewsGoe(Integer minViews) {
        return minViews != null ? p.views.goe(minViews) : null;
    }

    private BooleanExpression createdAfter(LocalDateTime from) {
        return from != null ? p.createdAt.goe(from) : null;
    }

    private BooleanExpression createdBefore(LocalDateTime to) {
        return to != null ? p.createdAt.loe(to) : null;
    }
}