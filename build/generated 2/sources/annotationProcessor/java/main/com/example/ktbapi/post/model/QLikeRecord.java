package com.example.ktbapi.post.model;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QLikeRecord is a Querydsl query type for LikeRecord
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QLikeRecord extends EntityPathBase<LikeRecord> {

    private static final long serialVersionUID = 1821458911L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QLikeRecord likeRecord = new QLikeRecord("likeRecord");

    public final com.example.ktbapi.common.model.QBaseTimeEntity _super = new com.example.ktbapi.common.model.QBaseTimeEntity(this);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final QLikeId id;

    public final QPost post;

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final com.example.ktbapi.user.model.QUser user;

    public QLikeRecord(String variable) {
        this(LikeRecord.class, forVariable(variable), INITS);
    }

    public QLikeRecord(Path<? extends LikeRecord> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QLikeRecord(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QLikeRecord(PathMetadata metadata, PathInits inits) {
        this(LikeRecord.class, metadata, inits);
    }

    public QLikeRecord(Class<? extends LikeRecord> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.id = inits.isInitialized("id") ? new QLikeId(forProperty("id")) : null;
        this.post = inits.isInitialized("post") ? new QPost(forProperty("post"), inits.get("post")) : null;
        this.user = inits.isInitialized("user") ? new com.example.ktbapi.user.model.QUser(forProperty("user")) : null;
    }

}

