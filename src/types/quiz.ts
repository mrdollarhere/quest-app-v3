export type QuestionType = 
  | 'single_choice'
  | 'multiple_choice'
  | 'short_text'
  | 'rating'
  | 'dropdown'
  | 'true_false'
  | 'ordering'
  | 'matching'
  | 'hotspot';

export type QuizMode = 'training' | 'test' | 'race';

export interface Question {
  id: string;
  question_text: string;
  question_type: QuestionType;
  options?: string; // comma-separated
  correct_answer?: string;
  order_group?: string; // comma-separated items for ordering or prompt|answer pairs for matching
  image_url?: string;
  metadata?: string; // JSON string for hotspot zones or scale config
  required?: boolean;
}

export interface HotspotZone {
  id: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  radius: number; // percentage
}

export interface UserResponse {
  questionId: string;
  answer: any;
  isCorrect?: boolean;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  responses: UserResponse[];
  isSubmitted: boolean;
  score: number;
  startTime: number;
  endTime?: number;
  mode: QuizMode;
  highestStepReached: number;
}
