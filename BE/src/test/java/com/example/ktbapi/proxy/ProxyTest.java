package com.example.ktbapi.proxy;

import com.example.ktbapi.post.model.Post;
import com.example.ktbapi.user.model.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.PersistenceContext;
import org.hibernate.Hibernate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class ProxyTest {

    @Autowired
    EntityManagerFactory emf;

    @PersistenceContext
    EntityManager em;

    @Test
    @DisplayName("LAZY 프록시 동작: isLoaded → false, initialize 후 true")
    @Rollback(false)
    void proxy_lazy_with_hibernate_initialize() {
        User u = new User("proxy+" + System.currentTimeMillis() + "@ktb.api", "Pa$$w0rd!", "ProxyUser");
        em.persist(u);

        Post p = new Post(u, "프록시 테스트", "내용", null);
        em.persist(p);

        em.flush();
        em.clear();

        Post found = em.find(Post.class, p.getId());
        User authorProxy = found.getAuthor();

        boolean loadedBefore = emf.getPersistenceUnitUtil().isLoaded(authorProxy);
        System.out.println("초기화 전 isLoaded = " + loadedBefore);

        System.out.println("프록시 실제 클래스 = " + authorProxy.getClass().getName());

        Hibernate.initialize(authorProxy);
        boolean loadedAfter = emf.getPersistenceUnitUtil().isLoaded(authorProxy);
        System.out.println("강제 초기화 후 isLoaded = " + loadedAfter);

        System.out.println("작성자 닉네임 = " + authorProxy.getNickname());
    }

    @Test
    @DisplayName("순수 JPA로 프록시 초기화: 게터 접근 시점에 SELECT 발생")
    @Rollback(false)
    void proxy_lazy_origin_jpa_getter() {
        User u = new User("proxy2+" + System.currentTimeMillis() + "@ktb.api", "Pa$$w0rd!", "ProxyUser2");  
        em.persist(u);

        Post p = new Post(u, "프록시 테스트2", "내용2", null);
        em.persist(p);

        em.flush();
        em.clear();

        Post found = em.find(Post.class, p.getId());
        User authorProxy = found.getAuthor();

        boolean loadedBefore = emf.getPersistenceUnitUtil().isLoaded(authorProxy);
        System.out.println("초기화 전 isLoaded = " + loadedBefore);

        System.out.println("프록시 실제 클래스 = " + authorProxy.getClass().getName());

        String nickname = authorProxy.getNickname();
        System.out.println("게터 접근으로 초기화됨, nickname = " + nickname);

        boolean loadedAfter = emf.getPersistenceUnitUtil().isLoaded(authorProxy);
        System.out.println("게터 접근 후 isLoaded = " + loadedAfter);
    }
}
