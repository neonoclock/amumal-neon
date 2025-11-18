package com.example.ktbapi;

import com.example.ktbapi.post.model.Post;
import com.example.ktbapi.user.model.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class BulkOperationTest {

    @PersistenceContext
    EntityManager em;

    private String uniqEmail(String prefix) {
        return prefix + "+" + System.nanoTime() + "-" + UUID.randomUUID().toString().substring(0, 6) + "@example.com";
    }
    private String uniqNick(String prefix) {
        return (prefix + "_" + UUID.randomUUID().toString().substring(0, 6)).substring(0, Math.min(12, prefix.length() + 7));
    }

    @Test
    void bulkUpdate_users_all_to_same_nickname_then_clear() {
        for (int i = 0; i < 5; i++) {
            em.persist(new User(uniqEmail("tester"), "pw", uniqNick("Adapterz")));
        }
        em.flush();
        em.clear();

        int updated = em.createQuery("update User u set u.nickname = :nick")
                .setParameter("nick", "Bulked")
                .executeUpdate();
        assertTrue(updated >= 5);

        em.clear();

        List<User> users = em.createQuery("select u from User u order by u.id", User.class)
                .setMaxResults(5)
                .getResultList();
        assertFalse(users.isEmpty());
        users.forEach(u -> assertEquals("Bulked", u.getNickname()));
    }

    @Test
    void bulkUpdate_without_clear_demo() {
        User u1 = new User(uniqEmail("a"), "pw", "NickA");
        User u2 = new User(uniqEmail("b"), "pw", "NickB");
        User u3 = new User(uniqEmail("c"), "pw", "NickC");
        em.persist(u1);
        em.persist(u2);
        em.persist(u3);
        em.flush();

        int updated = em.createQuery("update User u set u.nickname = :nick")
                .setParameter("nick", "Bulked")
                .executeUpdate();
        assertTrue(updated >= 3);

        List<User> again = em.createQuery(
                        "select u from User u where u.id in (:ids) order by u.id", User.class)
                .setParameter("ids", List.of(u1.getId(), u2.getId(), u3.getId()))
                .getResultList();
        again.forEach(u -> System.out.println("[after bulk WITHOUT clear] id=" + u.getId() + ", nickname=" + u.getNickname()));

        em.clear();
        List<User> fixed = em.createQuery(
                        "select u from User u where u.id in (:ids) order by u.id", User.class)
                .setParameter("ids", List.of(u1.getId(), u2.getId(), u3.getId()))
                .getResultList();
        fixed.forEach(u -> assertEquals("Bulked", u.getNickname()));
    }

    @Test
    void bulkDelete_likes_by_post_example() {
        User author = new User(uniqEmail("author"), "pw", "Author");
        em.persist(author);
        Post p = new Post(author, "제목", "내용", null);
        em.persist(p);
        em.flush();

        int deleted = em.createQuery("delete from LikeRecord l where l.post.id = :postId")
                .setParameter("postId", p.getId())
                .executeUpdate();
        assertTrue(deleted >= 0);

        em.clear();

        Long cnt = em.createQuery("select count(l) from LikeRecord l where l.post.id = :postId", Long.class)
                .setParameter("postId", p.getId())
                .getSingleResult();
        assertEquals(0L, cnt);
    }

    @Test
    void bulkUpdate_posts_reset_views_over_threshold() {
        User u = new User(uniqEmail("user"), "pw", "U");
        em.persist(u);
        for (int i = 0; i < 3; i++) {
            Post p = new Post(u, "t" + i, "c", null);
            for (int v = 0; v < (10 * (i + 1)); v++) p.increaseViews(); 
            em.persist(p);
        }
        em.flush();
        em.clear();

        int updated = em.createQuery(
                        "update Post p set p.views = 0 " +
                        "where p.author.id = :uid and p.views > :threshold")
                .setParameter("uid", u.getId())
                .setParameter("threshold", 15)
                .executeUpdate();
        assertTrue(updated >= 1);

        em.clear();

        List<Integer> views = em.createQuery(
                        "select p.views from Post p where p.author.id = :uid order by p.id", Integer.class)
                .setParameter("uid", u.getId())
                .getResultList();

        assertEquals(3, views.size());
        assertEquals(10, views.get(0));
        assertEquals(0,  views.get(1));
        assertEquals(0,  views.get(2));
    }
}