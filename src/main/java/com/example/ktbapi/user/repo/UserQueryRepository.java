package com.example.ktbapi.user.repo;

import com.example.ktbapi.user.dto.UserSearchCond;
import com.example.ktbapi.user.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserQueryRepository {
    Page<User> search(UserSearchCond cond, Pageable pageable);
}