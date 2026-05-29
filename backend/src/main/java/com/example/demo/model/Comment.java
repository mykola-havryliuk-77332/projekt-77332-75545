package com.example.demo.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String author; // Ім'я того, хто залишив відгук

    @Column(columnDefinition = "TEXT")
    private String text; // Текст коментаря

    private int rating; // Рейтинг від 1 до 5 зірок

    @ManyToOne
    @JoinColumn(name = "book_id")
    @JsonIgnoreProperties("comments") // Запобігає нескінченному зацикленню JSON при відповіді
    private Book book;

    public Comment() {
    }

    public Comment(String author, String text, int rating, Book book) {
        this.author = author;
        this.text = text;
        this.rating = rating;
        this.book = book;
    }

    // Геттери та сеттери
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }
}