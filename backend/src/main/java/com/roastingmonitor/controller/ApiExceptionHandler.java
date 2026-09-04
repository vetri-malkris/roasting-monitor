package com.roastingmonitor.controller;
import org.springframework.web.bind.annotation.*; import org.springframework.http.*; import java.util.Map;
@RestControllerAdvice public class ApiExceptionHandler { @ExceptionHandler({IllegalArgumentException.class}) ResponseEntity<?> bad(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));} @ExceptionHandler(Exception.class) ResponseEntity<?> other(Exception e){return ResponseEntity.status(500).body(Map.of("message","Unexpected server error"));} }
