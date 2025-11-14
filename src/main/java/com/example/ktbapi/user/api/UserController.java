package com.example.ktbapi.user.api;

import com.example.ktbapi.common.ApiResponse;
import com.example.ktbapi.common.dto.IdResponse;
import com.example.ktbapi.common.exception.UnauthorizedException;
import com.example.ktbapi.user.dto.LoginRequest;
import com.example.ktbapi.user.dto.SignupRequest;
import com.example.ktbapi.user.dto.ProfileUpdateRequest;
import com.example.ktbapi.user.dto.PasswordUpdateRequest;
import com.example.ktbapi.user.model.User;
import com.example.ktbapi.user.model.UserRole;
import com.example.ktbapi.user.repo.UserJpaRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://172.16.24.172:5500")
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "회원 가입/조회/수정/삭제")
public class UserController {

    private final UserJpaRepository userRepo;

    public UserController(UserJpaRepository userRepo) {
        this.userRepo = userRepo;
    }

    @PostMapping
    public ApiResponse<IdResponse> signup(@Valid @RequestBody SignupRequest req) {
        
        UserRole role = req.userRole != null ? req.userRole : UserRole.USER;

        User user = new User(req.email, req.password, req.nickname, role);

        
        if (req.profileImage != null && !req.profileImage.isBlank()) {
            user.setProfileImage(req.profileImage);
        }

        userRepo.save(user);
        return ApiResponse.success(new IdResponse(user.getId()));
    }

    @PostMapping("/login")
    public ApiResponse<User> login(@Valid @RequestBody LoginRequest req) {

        User user = userRepo.findByEmail(req.email)
                .orElseThrow(() -> new UnauthorizedException("invalid credentials"));

        if (!user.getPassword().equals(req.password)) {
            throw new UnauthorizedException("invalid credentials");
        }

        return ApiResponse.success(user);
    }

    @GetMapping("/{userId}")
    public ApiResponse<User> getUser(@PathVariable Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ApiResponse.success(user);
    }

    @PatchMapping("/{userId}/profile")
    public ApiResponse<Void> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody ProfileUpdateRequest req) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.changeNickname(req.nickname);
        if (req.profileImage != null) {
            user.setProfileImage(req.profileImage);
        }

        userRepo.save(user);
        return ApiResponse.success();
    }

    @PatchMapping("/{userId}/password")
    public ApiResponse<Void> updatePassword(
            @PathVariable Long userId,
            @Valid @RequestBody PasswordUpdateRequest req) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getPassword().equals(req.oldPassword)) {
            throw new IllegalArgumentException("Current password incorrect");
        }

        user.changePassword(req.newPassword);
        userRepo.save(user);

        return ApiResponse.success();
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<Void> deleteUser(@PathVariable Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        userRepo.delete(user);

        return ApiResponse.success();
    }
}
