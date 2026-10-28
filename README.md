# 🧪 Liquid Reviews — Katalog & Recenzje Ekipy

Nowoczesna, responsywna (Mobile-First) aplikacja webowa typu SPA stworzona dla grupy znajomych do wspólnego oceniania, katalogowania i porównywania longfilli, premixów oraz liquidów (e-papierosów).

Hostowana statycznie na **GitHub Pages**, z możliwością bezpłatnego backendu i bazy danych w **Supabase** (Database + Storage na zdjęcia) oraz pełnym trybem offline/lokalnym **Local Demo Mode** (startuje od pierwszej sekundy bez żadnej konfiguracji!).

---

## 🚀 Główne Funkcjonalności

- **Tryb Hybrydowy (Zero-Config Start):**
  - Działa od razu po uruchomieniu! Jeśli Supabase nie jest skonfigurowane, aplikacja automatycznie działa w **Trybie Demo** opartym o `localStorage` z bogatym, realistycznym zestawem popularnych płynów (A&L Ragnarok, Dark Line Double Apple, Vampire Vape Pinkman, Dinner Lady Lemon Tart itd.) i opiniami ekipy.
  - W nagłówku znajduje się ikona **"Konfiguracja Połączenia"**, gdzie w dowolnym momencie można wkleić `Supabase URL` oraz `Supabase Anon Key`, przetestować połączenie i przełączyć się na wspólną bazę w chmurze.
  - **Przycisk "Kopiuj skrypt SQL"** w modalu konfiguracji – jednym kliknięciem kopiuje gotowy kod tworzący tabele `liquids`, `reviews`, bucket `liquid-images` oraz reguły bezpieczeństwa RLS.
  - **Eksport i Import bazy (.json)** – pełna kopia zapasowa na dysk lub synchronizacja między urządzeniami.

- **Model Danych (Relacja 1-do-wielu: Produkt -> Recenzje):**
  - **Tabela `liquids`**: Marka, nazwa smaku, typ (Longfill, Gotowy Liquid, Aromat/Samogon), kategoria smaku (Owocowe, Menthol/Ice, Deserowe, Kwaśne, Napoje, Tytoniowe), ilość aromatu w butelce, zdjęcie.
  - **Tabela `reviews`**: Ocena ogólna (1.0 - 10.0), Słodycz (1-5), Chłodzik (1-5), Intensywność (1-5), Kop w gardło / Throat Hit (1-5), Żywotność grzałki / Wata (1 = Coil killer, 5 = Czysty), sprzęt (np. OXVA Xlim Pro, 0.6 Ω), moc i rodzaj nikotyny (Sól / Zwykła / 0mg), proporcje VG/PG, dni leżakowania (Shake & Vape), werdykt (ADV / Okazjonalnie / Do zlewu) oraz subiektywny komentarz.

- **Wskaźnik Zgodności & Kontrowersji Ekipy:**
  - Jeśli rozstrzał ocen (`max - min`) `>= 3.5 pkt`, płyn otrzymuje odznakę **"⚡ Kontrowersyjny (Rozstrzał ocen!)"** z analizą, skąd wynikają różnice.
  - Jeśli oceny są wysokie i spójne, otrzymuje odznakę **"🎯 Zgodny faworyt"**.
  - Odznaka **"Król ADV"** oraz ostrzeżenie **"Coil Killer"** (zabójca grzałek).

- **Automatyczna Kompresja Zdjęć w Locie (Canvas API):**
  - Zdjęcia robione aparatem telefonu (często 4-10 MB) są bezpośrednio w przeglądarce skalowane do maksymalnie `800px` i kompresowane do formatu **WebP (jakość 0.75)**.
  - Każde zdjęcie waży zaledwie **~40-80 KB**, co oszczędza transfer i miejsce w Supabase Storage.

- **Kalkulator Rozrabiania Longfilli:**
  - Przelicznik butelek (domyślnie 60 ml).
  - Oblicza dokładną objętość shotów nikotynowych, liczbę buteleczek 10 ml oraz ilość czystej bazy 0mg do dopełnienia.
  - Ostrzega, jeśli dana moc jest fizycznie niemożliwa do uzyskania z wybranego shota w danej butelce!
  - Kalkulator kosztów: przelicza koszt całej butelki oraz cenę za 10 ml gotowego płynu w porównaniu ze sklepem.

- **Zaawansowane Filtrowanie i Szukanie:**
  - Szukanie po nazwie, marce, komentarzach i sprzęcie.
  - Filtrowanie po kategorii i po konkretnym testerze z ekipy (`Pokaż oceniane przez: [Ksywka]`).
  - Szybkie przełączniki (Pills): `Tylko ADV`, `Bez chłodzika`, `Przyjazne grzałkom`, `Kontrowersyjne`, `Czarna Lista (Do zlewu)`.

---

## 🛠️ Stack Technologiczny

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Ikony:** Lucide React
- **Efekty:** Canvas Confetti (wystrzał konfetti przy trafieniu ADV!)
- **Baza i Storage:** `@supabase/supabase-js` (PostgreSQL + RLS + S3 Storage)
- **Deployment:** GitHub Pages + GitHub Actions CI/CD

---

## 📦 Uruchomienie Lokalne

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/<twoj-login>/<twoje-repo>.git
   cd liquid-reviews
   ```

2. Zainstaluj zależności:
   ```bash
   npm install
   ```

3. Uruchom serwer developerski:
   ```bash
   npm run dev
   ```

4. Zbuduj wersję produkcyjną:
   ```bash
   npm run build
   ```

---

## 🌐 Wdrożenie na GitHub Pages

Aplikacja jest skonfigurowana pod bezproblemowy deployment:
1. W pliku `vite.config.ts` ustawiono relatywne ścieżki: `base: './'`, dzięki czemu strona działa w dowolnej podścieżce repozytorium GitHub Pages.
2. W repozytorium znajduje się plik `.github/workflows/deploy.yml`. Po pushu do gałęzi `main`:
   - W ustawieniach repozytorium na GitHub przejdź do: **Settings -> Pages**.
   - W sekcji **Build and deployment -> Source** wybierz **GitHub Actions**.
   - Następny push automatycznie opublikuje stronę pod adresem: `https://<twoj-login>.github.io/<nazwa-repo>/`.

---

## ⚡ Podpięcie Bazy Supabase (Instrukcja w 2 minuty)

1. Załóż darmowe konto na [supabase.com](https://supabase.com) i utwórz nowy projekt (np. `liquid-reviews`).
2. W Supabase Dashboard przejdź do zakładki **SQL Editor** -> **New Query**.
3. W aplikacji kliknij ikonę bazy w nagłówku i kliknij **"Kopiuj Skrypt SQL"** (lub skopiuj z pliku `src/lib/sqlScript.ts`).
4. Wklej skrypt w edytorze Supabase i kliknij **Run**. Skrypt utworzy:
   - Tabelę `liquids`
   - Tabelę `reviews` (z kluczem obcym i kaskadowym usuwaniem)
   - Indeksy wyszukiwania
   - Reguły Row Level Security (RLS) otwarte dla znajomych (`anon`)
   - Publiczny bucket Storage `liquid-images`
5. W Supabase przejdź do **Project Settings -> API**:
   - Skopiuj **Project URL**
   - Skopiuj **anon public key**
6. Wklej je w oknie konfiguracji w aplikacji i kliknij **Zapisz i Połącz**. Gotowe!
