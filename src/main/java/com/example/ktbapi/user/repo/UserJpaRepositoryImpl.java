package com.example.ktbapi.user.repo;

import com.example.ktbapi.user.dto.UserSearchCond;
import com.example.ktbapi.user.model.QUser;
import com.example.ktbapi.user.model.User;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.example.ktbapi.common.query.QuerydslPredicates.*;

@Repository
public class UserJpaRepositoryImpl implements UserQueryRepository {

    private final JPAQueryFactory query;

    public UserJpaRepositoryImpl(JPAQueryFactory query) {
        this.query = query;
    }

    @Override
    public Page<User> search(UserSearchCond cond, Pageable pageable) {
        QUser u = QUser.user;
        BooleanBuilder where = new BooleanBuilder();

        addNotBlank(where, cond.emailContains, () -> u.email.containsIgnoreCase(cond.emailContains));
        addNotBlank(where, cond.nicknameContains, () -> u.nickname.containsIgnoreCase(cond.nicknameContains));
        addNotNull(where, cond.role, () -> u.role.eq(cond.role));
        addBetween(where, cond.fromCreatedAt, cond.toCreatedAt,
                () -> u.createdAt.goe(cond.fromCreatedAt),
                () -> u.createdAt.loe(cond.toCreatedAt));

        var base = query.selectFrom(u).where(where);

        if (pageable.getSort().isEmpty()) base.orderBy(u.createdAt.desc());
        else pageable.getSort().forEach(s -> {
            switch (s.getProperty()) {
                case "email" -> base.orderBy(s.isAscending() ? u.email.asc() : u.email.desc());
                case "nickname" -> base.orderBy(s.isAscending() ? u.nickname.asc() : u.nickname.desc());
                default -> base.orderBy(s.isAscending() ? u.createdAt.asc() : u.createdAt.desc());
            }
        });

        List<User> content = base
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        long total = query.select(u.count()).from(u).where(where).fetchOne();

        return new PageImpl<>(content, pageable, total);
    }
}
