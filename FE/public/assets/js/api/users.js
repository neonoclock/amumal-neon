import { GET, PATCH, DELETE } from "../core/http.js";

export const UsersAPI = {
  async getUser(userId) {
    const res = await GET(`/api/v1/users/${userId}`);

    const raw = res?.data ?? res;

    console.log("[UsersAPI.getUser] raw:", raw);

    const user = {
      userId: raw.user_id ?? raw.userId,
      email: raw.email,
      nickname: raw.nickname,
      profileImage: raw.profile_image ?? raw.profileImage ?? null,
      role: raw.role ?? raw.user_role,
      createdAt: raw.created_at ?? raw.createdAt,
      updatedAt: raw.updated_at ?? raw.updatedAt,
    };

    return user;
  },

  updateProfile(userId, { nickname, profileImage }) {
    return PATCH(`/api/v1/users/${userId}/profile`, {
      nickname,
      profileImage: profileImage ?? null,
    });
  },

  deleteUser(userId) {
    return DELETE(`/api/v1/users/${userId}`);
  },
};
