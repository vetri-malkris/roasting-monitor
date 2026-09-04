package com.roastingmonitor.controller;
import com.roastingmonitor.dto.*; import com.roastingmonitor.service.RoastingService; import jakarta.validation.Valid; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") public class AuthController { private final RoastingService service; public AuthController(RoastingService s){service=s;} @PostMapping("/login") public LoginResponse login(@Valid @RequestBody LoginRequest r){return service.login(r);} }
