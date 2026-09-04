package com.roastingmonitor.model;

import jakarta.persistence.*;

@Entity @Table(name="app_users")
public class User {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(nullable=false, unique=true) private String username;
  @Column(nullable=false) private String password;
  @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role;
  public User() {}
  public User(String username,String password,Role role){this.username=username;this.password=password;this.role=role;}
  public Long getId(){return id;} public String getUsername(){return username;} public String getPassword(){return password;} public Role getRole(){return role;}
  public void setUsername(String v){username=v;} public void setPassword(String v){password=v;} public void setRole(Role v){role=v;}
}
