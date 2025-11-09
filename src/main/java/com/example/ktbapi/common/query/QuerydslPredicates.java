package com.example.ktbapi.common.query;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.dsl.BooleanExpression;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.function.Supplier;

public final class QuerydslPredicates {
    private QuerydslPredicates() {}

    public static void add(BooleanBuilder builder, boolean condition, Supplier<BooleanExpression> expr) {
        if (condition) builder.and(expr.get());
    }

    public static void addNotNull(BooleanBuilder builder, Object value, Supplier<BooleanExpression> expr) {
        if (value != null) builder.and(expr.get());
    }

    public static void addNotBlank(BooleanBuilder builder, String value, Supplier<BooleanExpression> expr) {
        if (value != null && !value.isBlank()) builder.and(expr.get());
    }

    public static <T> void addNotEmpty(BooleanBuilder b, Collection<T> value, Supplier<BooleanExpression> expr) {
        if (value != null && !value.isEmpty()) b.and(expr.get());
    }

    public static void addBetween(BooleanBuilder b, LocalDateTime from, LocalDateTime to,
                                  Supplier<BooleanExpression> gte, Supplier<BooleanExpression> lte) {
        if (from != null) b.and(gte.get());
        if (to   != null) b.and(lte.get());
    }
}