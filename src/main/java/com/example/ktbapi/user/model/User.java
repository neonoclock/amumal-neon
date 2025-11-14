package com.example.ktbapi.user.model;

import com.example.ktbapi.common.model.BaseTimeEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "`user`")
@NamedQueries({
    @NamedQuery(
        name = "User.findByEmail",
        query = "select u from User u where u.email = :email"
    ),
    @NamedQuery(
        name = "User.searchByNickname",
        query = "select u from User u where u.nickname like concat('%', :keyword, '%')"
    )
})
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String email;

    @Column(nullable = false, length = 200)
    private String password;

    @Column(nullable = false, length = 30)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "user_role", length = 20)
    private UserRole role = UserRole.USER;

    @Column(name = "profile_image", columnDefinition = "LONGTEXT")
    private String profileImage;

    protected User() { }

    public User(String email, String password, String nickname) {
        this(email, password, nickname, UserRole.USER);
    }

    public User(String email, String password, String nickname, UserRole role) {
        if (email == null || email.isBlank()) throw new IllegalArgumentException("email required");
        if (password == null || password.isBlank()) throw new IllegalArgumentException("password required");
        if (nickname == null || nickname.isBlank()) throw new IllegalArgumentException("nickname required");
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.role = role != null ? role : UserRole.USER;
    }

    public void changeNickname(String newNickname) {
        if (newNickname != null && !newNickname.isBlank()) this.nickname = newNickname;
    }

    public void changePassword(String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("password required");
        }
        this.password = newPassword;
    }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getNickname() { return nickname; }
    public UserRole getRole() { return role; }
}
