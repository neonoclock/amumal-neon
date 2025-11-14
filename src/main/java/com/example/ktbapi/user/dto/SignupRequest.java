package com.example.ktbapi.user.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;
import com.example.ktbapi.user.model.UserRole;

@Schema(description = "회원가입 요청")
public class SignupRequest {

  @Email(message = "invalid email format")
  @NotBlank(message = "email is required")
  @Size(max = 200, message = "email must be <= 200 chars")
  public String email;

  @NotBlank(message = "password is required")
  @Size(min = 8, max = 200, message = "password must be between 8 and 200 chars")
  public String password;

  @NotBlank(message = "password_check is required")
  public String password_check;

  @NotBlank(message = "nickname is required")
  @Size(max = 30, message = "nickname must be <= 30 chars")
  public String nickname;

  @Schema(description = "프로필 이미지 (base64 또는 URL)")
  public String profileImage;

  @Schema(description = "사용자 역할 (기본값 USER)", example = "USER")
  public UserRole userRole;

  @AssertTrue(message = "password_mismatch")
  public boolean isPasswordMatch() {
    return password != null && password.equals(password_check);
  }
}
