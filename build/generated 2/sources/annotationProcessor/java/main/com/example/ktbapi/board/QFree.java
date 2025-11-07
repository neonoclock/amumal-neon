package com.example.ktbapi.board;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QFree is a Querydsl query type for Free
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QFree extends EntityPathBase<Free> {

    private static final long serialVersionUID = 244773776L;

    public static final QFree free = new QFree("free");

    public final QBoard _super = new QBoard(this);

    public final StringPath category = createString("category");

    //inherited
    public final StringPath content = _super.content;

    //inherited
    public final NumberPath<Long> id = _super.id;

    //inherited
    public final StringPath title = _super.title;

    public QFree(String variable) {
        super(Free.class, forVariable(variable));
    }

    public QFree(Path<? extends Free> path) {
        super(path.getType(), path.getMetadata());
    }

    public QFree(PathMetadata metadata) {
        super(Free.class, metadata);
    }

}

