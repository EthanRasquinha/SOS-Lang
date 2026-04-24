# Flashcard System - Database Schema Setup

This document contains the SQL schema needed for the flashcard, quiz, and study material features.

## Required Tables

Run these SQL statements in your Supabase database to set up the flashcard system.

### 1. Flashcard Sets Table

```sql
CREATE TABLE IF NOT EXISTS flashcard_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  note_id UUID NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE
);

CREATE INDEX idx_flashcard_sets_user_id ON flashcard_sets(user_id);
CREATE INDEX idx_flashcard_sets_note_id ON flashcard_sets(note_id);
```

### 2. Flashcards Table

```sql
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_set_id UUID NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (flashcard_set_id) REFERENCES flashcard_sets(id) ON DELETE CASCADE
);

CREATE INDEX idx_flashcards_flashcard_set_id ON flashcards(flashcard_set_id);
```

### 3. Quiz Results Table

```sql
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  flashcard_set_id UUID NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (flashcard_set_id) REFERENCES flashcard_sets(id) ON DELETE CASCADE
);

CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_flashcard_set_id ON quiz_results(flashcard_set_id);
CREATE INDEX idx_quiz_results_completed_at ON quiz_results(completed_at);
```

## RLS (Row Level Security) Policies

Apply these RLS policies to ensure users can only access their own data:

### Flashcard Sets RLS

```sql
ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own flashcard sets" 
  ON flashcard_sets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flashcard sets" 
  ON flashcard_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcard sets" 
  ON flashcard_sets FOR DELETE
  USING (auth.uid() = user_id);
```

### Flashcards RLS

```sql
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flashcards in their sets" 
  ON flashcards FOR SELECT
  USING (
    flashcard_set_id IN (
      SELECT id FROM flashcard_sets 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create flashcards in their sets" 
  ON flashcards FOR INSERT
  WITH CHECK (
    flashcard_set_id IN (
      SELECT id FROM flashcard_sets 
      WHERE user_id = auth.uid()
    )
  );
```

### Quiz Results RLS

```sql
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz results" 
  ON quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz results" 
  ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each SQL block above
4. Execute them in order (tables first, then indexes, then RLS policies)
5. Verify that all tables are created in the "Tables" section

## Notes

- The `note_id` foreign key assumes your notes table has a `note_id` column
- Adjust the foreign key references if your actual column names are different
- RLS policies ensure data privacy and security
- Indexes improve query performance for common operations
