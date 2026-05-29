package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Дозволяє фронтенду робити запити
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1. РЕЄСТРАЦІЯ (Приймає fullName, email, password)
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // Перевіряємо, чи email вже не зайнятий
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Użytkownik z tym e-mail już istnieje!"));
        }

        // За замовчуванням кожному даємо роль "USER"
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "message", "Rejestracja udana!",
                "email", savedUser.getEmail()
        ));
    }

    // 2. ВХІД / ЛОГІН (Приймає тільки email та password)
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);

        // Перевіряємо наявність юзера і збіг пароля
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            User user = userOpt.get();
            boolean isAdmin = "ADMIN".equals(user.getRole());

            // Повертаємо дані для сесії на фронтенді
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "fullName", user.getFullName(),
                    "email", user.getEmail(),
                    "role", user.getRole(),
                    "isAdmin", isAdmin
            ));
        }

        // Якщо дані невірні — помилка 401
        return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Błędny e-mail lub hasło!"
        ));
    }
}
