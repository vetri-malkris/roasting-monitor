package com.roastingmonitor.repository;
import com.roastingmonitor.model.User; import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User,Long>{Optional<User> findByUsername(String username);}
