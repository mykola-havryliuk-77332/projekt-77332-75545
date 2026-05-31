package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1. РЕЄСТРАЦІЯ
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            System.out.println("DEBUG: Реєстрація користувача з email: " + user.getEmail());

            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email nie może być pusty!"));
            }

            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                System.out.println("DEBUG: Користувач вже існує!");
                return ResponseEntity.badRequest().body(Map.of("message", "Użytkownik z tym e-mail już istnieje!"));
            }

            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("USER");
            }

            User savedUser = userRepository.save(user);
            System.out.println("DEBUG: Користувача успішно збережено!");

            return ResponseEntity.ok(Map.of(
                    "message", "Rejestracja udana!",
                    "email", savedUser.getEmail()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Błąd serwera: " + e.getMessage()));
        }
    }

    // 2. ВХІД / ЛОГІН
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            System.out.println("DEBUG LOGIN: Спроба входу для email: " + email);

            if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("success", false, "message", "Wpisz e-mail i hasło!"));
            }

            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                System.out.println("DEBUG LOGIN: Користувач знайдений. Пароль в БД: " + user.getPassword() + ", вхідний: " + password);

                if (user.getPassword().equals(password)) {
                    boolean isAdmin = "ADMIN".equals(user.getRole());
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "fullName", user.getFullName() != null ? user.getFullName() : "Użytkownik",
                            "email", user.getEmail(),
                            "role", user.getRole() != null ? user.getRole() : "USER",
                            "isAdmin", isAdmin
                    ));
                } else {
                    System.out.println("DEBUG LOGIN: Паролі не збігаються!");
                }
            } else {
                System.out.println("DEBUG LOGIN: Користувача з таким email не знайдено.");
            }

            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Błędny e-mail lub hasło!"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Błąd serwera: " + e.getMessage()));
        }
    }
}