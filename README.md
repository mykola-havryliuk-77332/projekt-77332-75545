# 📚 CzytajZamiast - Pełna Dokumentacja Projektu

## 📌 O projekcie
**CzytajZamiast** to nowoczesna aplikacja internetowa będąca interaktywnym katalogiem książek. Projekt został zrealizowany z podziałem na warstwę kliencką (Frontend) oraz serwerową (Backend). 

Aplikacja umożliwia przeglądanie bazy książek, rejestrację i logowanie użytkowników, a także dodawanie ocen i komentarzy. Całość została wdrożona w środowisku chmurowym, zapewniając ciągły dostęp do systemu online.

**Zespół programistyczny:**
* **Frontend Developer:** Mykola Havryliuk (Numer albumu: 77332)
* **Backend Developer:** Mykola Vynnichyk (Numer albumu: 75545)

## 🔐 Dostęp administratora

W celu przetestowania dodawania książek przygotowano konto administratora:

**Email:** admin@test.com  
**Hasło:** admin123

Po zalogowaniu na to konto pojawia się panel administratora, w którym można dodać nową książkę do katalogu.

To rozwiązanie zostało użyte wyłącznie do celów demonstracyjnych.

---

## 🎨 Moduł Frontend (Mykola Havryliuk - 77332)

Jako Frontend Developer odpowiadałem za stworzenie interfejsu użytkownika, logikę działania aplikacji po stronie przeglądarki oraz integrację z przygotowanym API. Aplikacja została zbudowana przy użyciu czystego HTML, CSS oraz Vanilla JavaScript, bez użycia zewnętrznych frameworków, co pozwoliło na pełną kontrolę nad kodem.

### 🚀 Zrealizowane funkcjonalności
* **Modułowa architektura (Komponenty HTML):** Zamiast jednego wielkiego pliku HTML, interfejs został podzielony na mniejsze komponenty (np. `header.html`, `catalog-section.html`, `modals.html`), które są dynamicznie wstrzykiwane przez JavaScript za pomocą interfejsu `fetch`.
* **System Autoryzacji i Rejestracji (JWT):**
  - Obsługa logowania i rejestracji przez interfejs modalny.
  - Zapisywanie tokena JWT w `localStorage` i dołączanie go do nagłówków `Authorization: Bearer` przy chronionych endpointach.
  - Funkcja "Pokaż hasło" (ikona oka 👁️) dla lepszego UX podczas wpisywania haseł (obsługa myszki oraz urządzeń dotykowych).
* **Obsługa ról (User / Admin):** Dynamiczne renderowanie interfejsu w zależności od roli użytkownika (ukrywanie/pokazywanie panelu dodawania książek oraz przycisków Edytuj/Usuń).
* **Katalog i Wyszukiwarka:** Dynamiczne pobieranie i renderowanie książek z bazy danych wraz z wyszukiwarką "na żywo" (Real-time search) filtrującą wyniki po tytule i autorze.
* **System Opinii i Komentarzy:** Możliwość dodawania ocen (1-5 gwiazdek) oraz tekstowych komentarzy dla zalogowanych użytkowników.
* **Nowoczesny UX / UI:** - **Skeleton Loaders:** Animacje ładowania (szkielety), które pojawiają się na ułamek sekundy przed pobraniem danych z serwera, eliminując zjawisko pustego ekranu.
  - **Dark / Light Mode:** Przełącznik motywu z zapisem preferencji w przeglądarce.
  - **Toast Notifications:** Własny system dynamicznych powiadomień dla akcji użytkownika.

### 🛠 Napotkane trudności i rozwiązania (Frontend)
1. **Problemy z buforowaniem (Browser Caching):** Przeglądarka agresywnie cachowała pliki `app.js` oraz komponenty HTML. Zastosowano technikę "Cache-Busting", dodając unikalne znaczniki czasu (`?v=...`) przy ładowaniu komponentów.
2. **Skoki interfejsu (Layout Shifts / FOUC):** Podczas ładowania przez ułamek sekundy widoczny był panel administratora przed weryfikacją roli. Zoptymalizowano proces inicjalizacji (`initApp()`), domyślnie ukrywając zastrzeżone elementy.
3. **Niespójne formaty danych ocen:** Wdrożono elastyczny parser ocen używający wyrażeń regularnych (`.match(/⭐/g)`), uodparniając frontend na różne formaty zwracane przez serwer.

### 🎓 Czego się nauczyłem (Frontend)
* **Tworzenia dynamicznych interfejsów** przy użyciu czystego **JavaScriptu (ES6+)** bez gotowych frameworków, co pozwoliło mi znacznie lepiej zrozumieć praktyczne działanie DOM API.
* **Pracy z asynchronicznością**, czyli dynamicznego pobierania części strony z serwera oraz bezpiecznego przesyłania nagłówków sieciowych i tokenów JWT.
* **Poprawy działania aplikacji (Web Performance)** i dbania o to, by strona nie "skakała" podczas ładowania, wykorzystując do tego nowoczesne animacje **Skeleton Loaders**.
* **Rozwiązywania problemów z komunikacją sieciową** między klientem a serwerem, w tym radzenia sobie z konfiguracją i blokadami polityki **CORS**.

---

## ⚙️ Moduł Backend (Mykola Vynnichyk - 75545)

Jako Backend Developer odpowiadałem za pełną obsługę logiki serwerowej, zarządzanie bazą danych, bezpieczeństwo autoryzacji oraz wdrożenie projektu na serwer produkcyjny.

### 🚀 Zrealizowane funkcjonalności
* **Projektowanie i implementacja API:** Stworzyłem RESTful API we frameworku Spring Boot, obsługujące katalog książek, operacje CRUD oraz zaawansowany system komentarzy. 
* **Architektura Bazy Danych (JPA/Hibernate):** Zadbałem o poprawną architekturę danych, mapowanie encji i bezpieczne relacje między książkami a komentarzami.
* **System Autoryzacji (JWT):** Zaimplementowałem moduł rejestracji i logowania użytkowników, wykorzystując mechanizmy JWT (JSON Web Token) do zapewnienia wysokiego standardu bezpieczeństwa sesji.
* **Wdrożenie (Deployment):** Odpowiadałem za proces hostingu aplikacji w chmurze (platforma Railway), konfigurację środowiska produkcyjnego oraz zapewnienie ciągłego dostępu do systemu online.
* **Integracja:** Ściśle współpracowałem z frontendem, dostarczając stabilne endpointy i rozwiązując problemy komunikacyjne na linii klient-serwer.

### 🛠 Napotkane trudności i rozwiązania (Backend)
1. **Synchronizacja kontraktu API i zasady CORS:**
   * *Problem:* Podczas integracji z frontendem zidentyfikowałem rozbieżności w ścieżkach, błędy (404/405) oraz blokady CORS przy próbach wysyłania modyfikacji (np. komentarzy).
   * *Rozwiązanie:* Przeprowadziłem gruntowną refaktoryzację `BookController.java`, ujednolicając endpointy do standardu `/api/comments`, co trwale rozwiązało problemy z metodami POST i zsynchronizowało przesyłanie tokenów.
2. **Bezpieczeństwo i sesje:**
   * *Problem:* Implementacja chronionego systemu oceniania wymagała precyzyjnego zarządzania tokenami.
   * *Rozwiązanie:* Wdrożono ścisłą weryfikację nagłówków, upewniając się, że tylko prawidłowo autoryzowani użytkownicy posiadający aktywny token mogą dodawać treści.
3. **Konfiguracja środowiska produkcyjnego:**
   * *Problem:* Przeniesienie lokalnej bazy danych i aplikacji do środowiska chmurowego.
   * *Rozwiązanie:* Wymagało to odpowiedniego dopasowania konfiguracji zmiennych środowiskowych i zapewnienia stabilności połączenia z chmurowym klastrem bazy danych.

### 🎓 Czego się nauczyłem (Backend)
* Budowania kompletnych, wydajnych systemów backendowych w oparciu o framework **Spring Boot**.
* Zarządzania bezpieczeństwem w nowoczesnych aplikacjach webowych (mechanizmy JWT, autoryzacja).
* Procesów **DevOps**: Zrozumiałem od podstaw, jak wygląda proces wdrażania aplikacji na serwer produkcyjny i z jakimi konfiguracjami sieciowymi się to wiąże.

---

## 💻 Wykorzystane Technologie
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+, Fetch API), GitHub Pages.
* **Backend:** Java, Spring Boot, Spring Security (JWT), JPA / Hibernate, PostgreSQL / MySQL.
* **Infrastruktura:** Railway (Backend Hosting), GitHub Actions (CI/CD Deployments).
