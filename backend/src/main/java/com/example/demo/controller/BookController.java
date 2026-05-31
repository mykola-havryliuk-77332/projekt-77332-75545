package com.example.demo.controller;

import com.example.demo.model.Book;
import com.example.demo.model.Comment;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private CommentRepository commentRepository;

    // 1. Отримання всіх книг
    @GetMapping("/books")
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // 2. Отримання книги за ID
    @GetMapping("/books/{id}")
    public ResponseEntity<Object> getBookById(@PathVariable Long id) {
        return bookRepository.findById(id)
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "Książka nie znaleziona")));
    }

    // 3. Створення нової книги
    @PostMapping("/books")
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        return ResponseEntity.ok(bookRepository.save(book));
    }

    // 4. Метод додавання відгуку
    @PostMapping("/comments")
    public ResponseEntity<Object> addComment(@RequestBody Comment comment) {
        try {
            if (comment.getBookId() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Brak ID książki!"));
            }

            return bookRepository.findById(comment.getBookId())
                    .<ResponseEntity<Object>>map(book -> {
                        comment.setBook(book);
                        if (comment.getAuthor() == null || comment.getAuthor().isEmpty()) {
                            comment.setAuthor("Anonim");
                        }
                        return ResponseEntity.ok(commentRepository.save(comment));
                    })
                    .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "Książka nie istnieje")));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Błąd serwera: " + e.getMessage()));
        }
    }

    // 5. Видалення книги
    @DeleteMapping("/books/{id}")
    public ResponseEntity<Object> deleteBook(@PathVariable Long id) {
        if (bookRepository.existsById(id)) {
            bookRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Książka usunięta"));
        }
        return ResponseEntity.status(404).body(Map.of("message", "Książka nie znaleziona"));
    }
}