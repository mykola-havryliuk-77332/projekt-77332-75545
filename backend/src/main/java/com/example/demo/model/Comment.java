package com.example.demo.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore; // Додаємо, щоб це поле не зберігалося в БД

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String author;

    @Column(columnDefinition = "TEXT")
    private String text;

    private int rating;

    @ManyToOne
    @JoinColumn(name = "book_id")
    @JsonIgnoreProperties("comments")
    private Book book;

    // --- ДОДАНО ДЛЯ СУМІСНОСТІ З ФРОНТЕНДОМ ---
    @Transient // Це поле не буде зберігатися в таблиці бази даних
    private Long bookId;

    public Comment() {
    }

    public Comment(String author, String text, int rating, Book book) {
        this.author = author;
        this.text = text;
        this.rating = rating;
        this.book = book;
    }

    // Геттери та сеттери
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    // --- ГЕТТЕР ТА СЕТТЕР ДЛЯ bookId ---
    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }
}