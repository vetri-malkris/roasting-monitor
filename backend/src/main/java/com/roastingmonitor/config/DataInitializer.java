package com.roastingmonitor.config;

import com.roastingmonitor.model.*;
import com.roastingmonitor.model.Role;
import com.roastingmonitor.repository.*; import org.springframework.boot.CommandLineRunner; import org.springframework.context.annotation.*; import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import java.math.BigDecimal;

@Configuration
public class DataInitializer {
  @Bean CommandLineRunner seed(UserRepository users, RawMaterialRepository materials){ return args -> {
    if(users.count()==0){ var e=new BCryptPasswordEncoder(); users.save(new User("operator",e.encode("operator123"), Role.OPERATOR)); users.save(new User("admin",e.encode("admin123"),Role.ADMIN)); }
    if(materials.count()==0){ materials.save(new RawMaterial("Arabica Green Coffee Beans",new BigDecimal("300"),new BigDecimal("20"))); materials.save(new RawMaterial("Robusta Green Coffee Beans",new BigDecimal("300"),new BigDecimal("18"))); }
  }; }
}
