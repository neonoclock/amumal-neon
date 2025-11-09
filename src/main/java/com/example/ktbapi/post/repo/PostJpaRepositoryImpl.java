package com.example.ktbapi.post.repo;

import com.example.ktbapi.common.query.QuerydslPredicates;
import com.example.ktbapi.post.dto.PostSearchCond;
import com.example.ktbapi.post.model.Post;
import com.example.ktbapi.post.model.QPost;
import com.example.ktbapi.user.model.QUser;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static com.example.ktbapi.common.query.QuerydslPredicates.*;

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
        Post found = query.selectFrom(p)
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
        BooleanBuilder where = new BooleanBuilder();

        addNotBlank(where, cond.keyword,
                () -> p.title.containsIgnoreCase(cond.keyword)
                        .or(p.content.containsIgnoreCase(cond.keyword)));
        addNotNull(where, cond.authorId, () -> p.author.id.eq(cond.authorId));
        addNotNull(where, cond.minLikes, () -> p.likes.goe(cond.minLikes));
        addNotNull(where, cond.minViews, () -> p.views.goe(cond.minViews));
        QuerydslPredicates.addBetween(where, cond.fromCreatedAt, cond.toCreatedAt,
                () -> p.createdAt.goe(cond.fromCreatedAt),
                () -> p.createdAt.loe(cond.toCreatedAt));

        var base = query.selectFrom(p)
                .leftJoin(p.author, u).fetchJoin()
                .where(where);

        if (pageable.getSort().isEmpty()) base.orderBy(p.createdAt.desc());
        else pageable.getSort().forEach(s -> {
            switch (s.getProperty()) {
                case "likes" -> base.orderBy(s.isAscending() ? p.likes.asc() : p.likes.desc());
                case "views" -> base.orderBy(s.isAscending() ? p.views.asc() : p.views.desc());
                default -> base.orderBy(s.isAscending() ? p.createdAt.asc() : p.createdAt.desc());
            }
        });

        List<Post> content = base
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        long total = query.select(p.count()).from(p).where(where).fetchOne();

        return new PageImpl<>(content, pageable, total);
    }
}