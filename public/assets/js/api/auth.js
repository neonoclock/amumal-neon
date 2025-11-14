import { GET, POST, PATCH, DELETE } from "../core/http.js";

export const AuthAPI = {
  signup({ email, password, passwordCheck, nickname, profileImage }) {
    return POST("/api/v1/users", {
      email,
      password,
      password_check: passwordCheck,
      nickname,
      profileImage: profileImage ?? null,
      userRole: null,
    });
  },

  login(email, password, remember = false) {
    return POST("/api/v1/users/login", {
      email,
      password,
      remember_me: remember,
    });
  },

  getUser(userId) {
    return GET(`/api/v1/users/${userId}`);
  },

  updateProfile(userId, { nickname, profileImage }) {
    return PATCH(`/api/v1/users/${userId}/profile`, {
      nickname,
      profileImage: profileImage ?? null,
    });
  },

  updatePassword(userId, { oldPassword, newPassword, newPasswordCheck }) {
    return PATCH(`/api/v1/users/${userId}/password`, {
      oldPassword,
      newPassword,
      newPasswordCheck,
    });
  },

  deleteUser(userId) {
    return DELETE(`/api/v1/users/${userId}`);
  },
};
