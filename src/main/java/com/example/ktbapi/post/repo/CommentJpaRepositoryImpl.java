package com.example.ktbapi.post.repo;

import com.example.ktbapi.post.dto.CommentSearchCond;
import com.example.ktbapi.post.model.Comment;
import com.example.ktbapi.post.model.QComment;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.example.ktbapi.common.query.QuerydslPredicates.*;

@Repository
public class CommentJpaRepositoryImpl implements CommentQueryRepository {

    private final JPAQueryFactory query;

    public CommentJpaRepositoryImpl(JPAQueryFactory query) {
        this.query = query;
    }

    @Override
    public Page<Comment> search(CommentSearchCond cond, Pageable pageable) {
        QComment c = QComment.comment;
        BooleanBuilder where = new BooleanBuilder();

        addNotNull(where, cond.postId, () -> c.post.id.eq(cond.postId));
        addNotNull(where, cond.authorId, () -> c.author.id.eq(cond.authorId));
        addNotBlank(where, cond.contentContains, () -> c.content.containsIgnoreCase(cond.contentContains));
        addBetween(where, cond.fromCreatedAt, cond.toCreatedAt,
                () -> c.createdAt.goe(cond.fromCreatedAt),
                () -> c.createdAt.loe(cond.toCreatedAt));

        var base = query.selectFrom(c).where(where);

        if (pageable.getSort().isEmpty()) base.orderBy(c.createdAt.desc());
        else pageable.getSort().forEach(s -> {
            switch (s.getProperty()) {
                case "createdAt" -> base.orderBy(s.isAscending() ? c.createdAt.asc() : c.createdAt.desc());
                default -> base.orderBy(c.createdAt.desc());
            }
        });

        List<Comment> content = base
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        long total = query.select(c.count()).from(c).where(where).fetchOne();

        return new PageImpl<>(content, pageable, total);
    }
}
