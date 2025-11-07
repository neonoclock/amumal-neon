package com.example.ktbapi.user.model;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUser is a Querydsl query type for User
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUser extends EntityPathBase<User> {

    private static final long serialVersionUID = 7070743L;

    public static final QUser user = new QUser("user");

    public final com.example.ktbapi.common.model.QBaseTimeEntity _super = new com.example.ktbapi.common.model.QBaseTimeEntity(this);

    public final ListPath<com.example.ktbapi.post.model.Comment, com.example.ktbapi.post.model.QComment> comments = this.<com.example.ktbapi.post.model.Comment, com.example.ktbapi.post.model.QComment>createList("comments", com.example.ktbapi.post.model.Comment.class, com.example.ktbapi.post.model.QComment.class, PathInits.DIRECT2);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final StringPath email = createString("email");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final ListPath<com.example.ktbapi.post.model.LikeRecord, com.example.ktbapi.post.model.QLikeRecord> likes = this.<com.example.ktbapi.post.model.LikeRecord, com.example.ktbapi.post.model.QLikeRecord>createList("likes", com.example.ktbapi.post.model.LikeRecord.class, com.example.ktbapi.post.model.QLikeRecord.class, PathInits.DIRECT2);

    public final StringPath nickname = createString("nickname");

    public final StringPath password = createString("password");

    public final ListPath<com.example.ktbapi.post.model.Post, com.example.ktbapi.post.model.QPost> posts = this.<com.example.ktbapi.post.model.Post, com.example.ktbapi.post.model.QPost>createList("posts", com.example.ktbapi.post.model.Post.class, com.example.ktbapi.post.model.QPost.class, PathInits.DIRECT2);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final EnumPath<UserRole> userRole = createEnum("userRole", UserRole.class);

    public QUser(String variable) {
        super(User.class, forVariable(variable));
    }

    public QUser(Path<? extends User> path) {
        super(path.getType(), path.getMetadata());
    }

    public QUser(PathMetadata metadata) {
        super(User.class, metadata);
    }

}

