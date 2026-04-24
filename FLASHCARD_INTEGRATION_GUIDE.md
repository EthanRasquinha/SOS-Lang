# Flashcard System Integration Guide

This document provides step-by-step instructions for integrating the flashcard generation and quiz system into your SOS-Lang application.

## Overview

The flashcard system includes:
- **Flashcard Generation**: Uses Gemini API to automatically generate flashcards from note content
- **Flashcard Dashboard**: Browse and manage all generated flashcard sets
- **Quiz Mode**: Interactive quiz interface with scoring and results tracking
- **Quiz Results**: Track user performance on flashcard sets

## Setup Steps

### 1. Database Schema Setup

First, you need to create the required database tables in Supabase.

**Action Required**: 
- Open your Supabase project dashboard
- Go to SQL Editor
- Copy and paste all SQL statements from `FLASHCARD_SCHEMA.md`
- Execute them in order

The three required tables are:
- `flashcard_sets` - stores flashcard set metadata
- `flashcards` - stores individual flashcards
- `quiz_results` - stores quiz attempt results

### 2. Backend Configuration

**Files Created/Modified**:

- **New**: `website/apps/backend/app/services/flashcard_service.py`
  - Contains all flashcard database operations
  - Handles CRUD operations for flashcard sets, cards, and quiz results

- **Modified**: `website/apps/backend/app/models.py`
  - Added new Pydantic models:
    - `FlashcardModel` - single flashcard (front/back)
    - `FlashcardSetModel` - set of flashcards with title
    - `QuizAnswerModel` - user answer submission
    - `QuizResultModel` - quiz result data

- **Modified**: `website/apps/backend/app/api/ai.py`
  - Completely refactored to include flashcard generation
  - New endpoints:
    - `POST /ai/flashcards/{note_id}/generate` - Generate flashcards from note
    - `GET /ai/flashcard-sets` - Get all user's flashcard sets
    - `GET /ai/flashcard-sets/{flashcard_set_id}` - Get specific flashcard set
    - `DELETE /ai/flashcard-sets/{flashcard_set_id}` - Delete a flashcard set
    - `POST /ai/quiz-results` - Submit quiz results
    - `GET /ai/quiz-results/{flashcard_set_id}` - Get quiz results for a set

### 3. Frontend Components

**New Components Created**:

1. **FlashcardDashboard** (`website/apps/frontend/src/pages/FlashcardDashboard.tsx`)
   - Lists all flashcard sets for the user
   - Shows creation date and last quiz score
   - Supports starting quizzes and deleting sets
   - Fetches quiz results to display performance

2. **QuizView** (`website/apps/frontend/src/components/QuizView.tsx`)
   - Interactive quiz interface
   - Shows one flashcard at a time
   - Flip cards to reveal answers
   - Enter answers and get feedback
   - Tracks score and displays results at the end
   - Shows performance percentage

3. **Updated NoteDashboard** (`website/apps/frontend/src/pages/NoteDashboard.tsx`)
   - Added "Generate Flashcards" button
   - Calls the new flashcard generation endpoint
   - Confirmation modal before generation
   - Loading state during AI generation

### 4. Navigation Integration

To make these components accessible, update your router/navigation:

**Example for React Router**:

```tsx
import FlashcardDashboard from '@/pages/FlashcardDashboard';
import NoteDashboard from '@/pages/NoteDashboard';

// In your route configuration
<Route path="/flashcards" element={<FlashcardDashboard />} />
<Route path="/notes" element={<NoteDashboard />} />
```

### 5. Gemini API Configuration

The system uses Google's Gemini API for flashcard generation.

**Requirements**:
- GEMINI_API_KEY must be set in your `.env` file in the backend
- The API key is already configured in `ai.py`

If you need to update the API key:
```bash
# In website/apps/backend/app/.env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 6. API Endpoint Reference

All endpoints require Bearer token authentication.

#### Generate Flashcards
```
POST /ai/flashcards/{note_id}/generate
Headers: Authorization: Bearer <token>
Response: { flashcard_set: {...} }
```

#### Get All Flashcard Sets
```
GET /ai/flashcard-sets
Headers: Authorization: Bearer <token>
Response: { flashcard_sets: [...] }
```

#### Get Specific Flashcard Set
```
GET /ai/flashcard-sets/{flashcard_set_id}
Headers: Authorization: Bearer <token>
Response: { flashcard_set: {...} }
```

#### Delete Flashcard Set
```
DELETE /ai/flashcard-sets/{flashcard_set_id}
Headers: Authorization: Bearer <token>
Response: { message: "..." }
```

#### Submit Quiz Results
```
POST /ai/quiz-results
Headers: Authorization: Bearer <token>
Body: {
  flashcard_set_id: "uuid",
  score: 8,
  total: 10
}
Response: { quiz_result: {...} }
```

#### Get Quiz Results
```
GET /ai/quiz-results/{flashcard_set_id}
Headers: Authorization: Bearer <token>
Response: { quiz_results: [...] }
```

## User Workflow

1. **Create Note**: User writes a note in the NoteDashboard
2. **Generate Flashcards**: Click "Generate Flashcards" button
3. **Confirmit's correct ation**: AI generates flashcards in the background
4. **View in Dashboard**: Flashcards appear in FlashcardDashboard
5. **Start Quiz**: Click "Start Quiz" on a flashcard set
6. **Complete Quiz**: Answer flashcards and see final score
7. **Track Progress**: View previous quiz scores on flashcard cards

## Troubleshooting

### "Failed to generate flashcards"
- Check that GEMINI_API_KEY is properly set
- Ensure the note content is substantial enough for the API
- Check backend logs for detailed error messages

### "Flashcard set not found"
- Verify the flashcard_set_id exists and belongs to the user
- Ensure RLS policies are properly configured

### Quiz not saving results
- Check that the user is authenticated with a valid token
- Verify the quiz_results table is created
- Check network logs for API response errors

## Feature Details

### Flashcard Generation
- Uses Gemini Pro model
- Generates 5-10 flashcards per note
- Automatically formats as JSON
- Creates descriptive titles
- Questions are clear and answers are concise

### Quiz Logic
- Shows one flashcard at a time
- Front side visible first
- Click to flip and see the answer
- Enter your answer before checking
- Manual marking as correct/incorrect
- Prevents answer guessing - forces engagement

### Scoring System
- Tracks correct answers
- Calculates percentage accuracy
- Stores results with timestamp
- Allows users to retake quizzes
- Shows performance history

## Performance Considerations

- Flashcard generation is async and may take 10-30 seconds
- Quiz progress is tracked in-memory until completion
- Quiz results are persisted to database
- Consider pagination for users with many flashcard sets

## Security

All endpoints are protected by:
- Bearer token authentication
- User ID verification
- Row Level Security (RLS) policies in Supabase
- Foreign key constraints

Users can only:
- View/edit/delete their own flashcard sets
- View/submit their own quiz results
- Generate flashcards from their own notes
