import { $, on } from "../core/dom.js";
import { loadUserId } from "../core/storage.js";
import { PostsAPI } from "../api/posts.js";
import { loadMyAvatar, setupAvatarMenu } from "../common/ui.js";

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createPostElement(post) {
  const {
    id,
    title,
    authorNickname,
    likes,
    views,
    createdAt,
    commentsCount,
    authorProfileImage,
  } = post;

  const article = document.createElement("article");
  article.className = "post";
  article.dataset.postId = id;

  article.innerHTML = `
    <div class="post-head">
      <h2 class="post-title">${escapeHtml(title)}</h2>
      <time class="post-date">${escapeHtml(createdAt || "")}</time>
    </div>

    <div class="post-meta">
      <span>좋아요 ${likes ?? 0}</span>
      <span>댓글 ${commentsCount ?? 0}</span>
      <span>조회수 ${views ?? 0}</span>
    </div>

    <div class="post-divider"></div>

    <footer class="post-footer">
      <span class="author-avatar" aria-hidden="true"></span>
      <span class="author-name">${escapeHtml(authorNickname || "익명")}</span>
    </footer>
  `;

  const avatarEl = article.querySelector(".author-avatar");
  if (avatarEl && authorProfileImage) {
    avatarEl.style.backgroundImage = `url(${authorProfileImage})`;
    avatarEl.style.backgroundSize = "cover";
    avatarEl.style.backgroundPosition = "center";
    avatarEl.style.backgroundRepeat = "no-repeat";
    avatarEl.style.border = "none";
  }

  return article;
}

async function loadPosts() {
  const boardEl = $(".board");
  if (!boardEl) return;

  boardEl.innerHTML = "";

  try {
    const res = await PostsAPI.getList({
      page: 0,
      limit: 10,
      sort: "DATE",
    });

    console.log("[BOARD] posts list res:", res);

    const rawList = res?.items ?? [];

    if (!Array.isArray(rawList) || rawList.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "아직 작성된 게시글이 없습니다.";
      empty.className = "empty";
      boardEl.appendChild(empty);
      return;
    }

    rawList.forEach((post) => {
      const normalized = {
        id: post.post_id,
        title: post.title,
        authorNickname: post.author_name,
        likes: post.likes ?? 0,
        views: post.views ?? 0,
        createdAt: post.created_at,
        commentsCount: post.comment_count ?? post.commentsCount ?? 0,
        authorProfileImage: post.author_profile_image ?? null,
      };

      const card = createPostElement(normalized);
      boardEl.appendChild(card);
    });
  } catch (err) {
    console.error("게시글 목록 조회 실패:", err);
    const errorMsg = document.createElement("p");
    errorMsg.textContent =
      "게시글을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    errorMsg.className = "empty";
    $(".board")?.appendChild(errorMsg);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const writeBtn = $(".intro .btn.primary");
  const boardEl = $(".board");

  loadPosts();
  loadMyAvatar("[BOARD]");
  setupAvatarMenu();

  if (writeBtn) {
    on(writeBtn, "click", () => {
      const userId = loadUserId();
      if (!userId) {
        alert("게시글 작성은 로그인 후 이용 가능합니다.");
        window.location.href = "./login.html";
        return;
      }
      window.location.href = "./post-create.html";
    });
  }

  if (boardEl) {
    on(boardEl, "click", (e) => {
      const postEl = e.target.closest(".post");
      if (!postEl) return;

      const postId = postEl.dataset.postId;
      if (!postId) return;

      window.location.href = `./post-detail.html?postId=${postId}`;
    });
  }
});
