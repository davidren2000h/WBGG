# 🧾 PRD: Wikipedia-Based Guessing Game (Multi-Language)

## 1. Product Overview

### 1.1 Objective

Build a lightweight, interactive knowledge game powered by Wikipedia data, where users guess an entity based on limited clues (e.g., categories, keywords, summaries).

### 1.2 Key Value Proposition

* Combines **entertainment + learning**
* Infinite content via Wikipedia
* Supports **multi-language gameplay (initially English + Chinese)**
* Scalable to AI-generated clues and richer interaction

***

## 2. Target Users

* Casual users who enjoy trivia and puzzles
* Knowledge seekers exploring Wikipedia content
* Bilingual users (EN + ZH)
* Students / engineers interested in reasoning-based games

***

## 3. Core User Scenarios

### 3.1 Daily Challenge

* User plays a fixed set (e.g., 10 questions/day)
* Tracks score
* Compares/share results

### 3.2 Quick Game

* User starts ad-hoc session
* Infinite random questions

### 3.3 Learning Mode

* After guessing, user views:
  * Wikipedia article
  * Additional context

***

## 4. Core Gameplay

### 4.1 Game Loop

1. System selects a Wikipedia article
2. Generate clues (categories / hints)
3. User inputs answer
4. System validates:
   * Correct ✅ → next question
   * Incorrect ❌ → retry / penalty
5. Continue until session ends

***

## 5. Multi-Language Design (Critical Requirement)

### 5.1 Language Scope (Phase 1)

* English (en)
* Chinese (zh)

### 5.2 Language Model

Each question is language-aware:

```json
{
  "id": "q123",
  "language": "en",
  "answer": "Albert Einstein",
  "clues": [
    "German physicists",
    "Nobel laureates in Physics"
  ]
}
```

Chinese version:

```json
{
  "id": "q123",
  "language": "zh",
  "answer": "阿尔伯特·爱因斯坦",
  "clues": [
    "德国物理学家",
    "诺贝尔物理学奖得主"
  ]
}
```

***

### 5.3 Core Requirements

#### ✅ Same Entity, Multi-Language Mapping

* Use **Wikipedia interlanguage links**
* Map:
  * English page ↔ Chinese page

#### ✅ Localized Clues

* Use categories from the target language Wikipedia
* Do NOT translate categories directly
  → must fetch native language categories

#### ✅ Answer Matching (Multi-Language)

* Accept:
  * language-specific answer
  * optionally cross-language (future)

Example:

* EN mode → expect "Beijing"
* ZH mode → expect "北京"

***

### 5.4 Language Selection UX

* Language switch at entry:
  * EN / 中文
* Persist user preference
* Game runs fully in selected language

***

## 6. Functional Requirements (MVP)

### 6.1 Question Generation

#### Input

* Wikipedia article (per language)

#### Output

* 3–6 valid clues
* Answer title (canonical)

#### Filtering Rules

Remove:

* Categories containing answer keywords
* Generic categories:
  * "Living people"
  * "出生年份"
* Hidden categories

***

### 6.2 Guessing System

#### Normalization Rules

* Lowercase
* Remove:
  * parentheses
  * punctuation
* Trim spaces

#### Example:

```
"Paris (Texas)" → "paris texas"
```

***

### 6.3 Scoring System (MVP)

| Condition               | Score |
| ----------------------- | ----- |
| Correct (first attempt) | +100  |
| Wrong guess             | -10   |
| Correct after hint      | +50   |

***

### 6.4 Hint System (Optional MVP+)

* Reveal first letter / character
* Show short summary snippet
* Reduce score after hint

***

## 7. System Architecture

### 7.1 Overview

```
Frontend: React (multi-language UI)
Backend: Node.js / Python API
Data:
  - Question cache
  - Language-specific pools
```

***

### 7.2 Multi-Language Data Flow

```
User selects language → zh

Backend:
  → fetch zh.wikipedia article
  → extract zh categories
  → build question

Answer:
  → zh title
```

***

### 7.3 API Design

#### Get Question

```
GET /api/question?lang=zh
```

#### Submit Answer

```
POST /api/answer
{
  "question_id": "...",
  "input": "...",
  "lang": "zh"
}
```

***

## 8. Key Algorithms

### 8.1 Question Generator

```python
article = get_random_article(lang="zh")

categories = get_categories(article)

filtered = []
for c in categories:
    if not contains_answer(c, article.title) and not is_generic(c):
        filtered.append(c)

clues = random.sample(filtered, k=4)
```

***

### 8.2 Language-Aware Matching

```python
def normalize(text):
    text = text.lower()
    text = remove_brackets(text)
    text = strip_punctuation(text)
    return text

if normalize(input) == normalize(answer):
    return True
```

***

### 8.3 Difficulty Control (Important)

Use:

* Wikipedia pageviews
* Category specificity

Strategy:

* Avoid:
  * extremely popular
  * extremely obscure

***

## 9. UI / UX Requirements

### 9.1 Core Pages

#### Home

* Language selector
* Start Game
* Daily Challenge

#### Game Screen

* Clue list (localized)
* Input box
* Submit
* Hint button

#### Result Screen

* Score
* Correct answers
* Wikipedia links

***

### 9.2 Localization (UI Layer)

All UI strings must support i18n:

Example:

```json
{
  "start_game": {
    "en": "Start Game",
    "zh": "开始游戏"
  }
}
```

***

## 10. Non-Functional Requirements

* Response time < 300ms (cached)
* Mobile-friendly UI
* Stateless game session (MVP)
* Scalable question generation

***

## 11. Risks & Challenges

### 11.1 Multi-Language Complexity

* EN and ZH category systems differ
* Entity mismatch possible

### 11.2 Question Quality

* Categories can be noisy
* Some questions:
  * too easy (leak answer)
  * impossible

### 11.3 Input Variations

* Synonyms
* Abbreviations
* Traditional vs Simplified Chinese (future issue)

***

## 12. Future Extensions

### Phase 2

* AI-generated clues (natural language)
* Accept cross-language answers
* Leaderboards
* Image-based guessing
* Category difficulty ranking

### Phase 3

* Add more languages
* Multiplayer mode
* Adaptive difficulty

***

## ✅ One-line Summary

A **Wikipedia-powered multilingual reasoning game** where users infer entities from structured clues, designed for scalable content and cross-language expansion.

***
