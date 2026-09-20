export interface User {
  id: string;
  name: string;
  email: string;
  onboarding_completed: boolean;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}

export interface Question {
  id: string;
  question_text: string;
  options: string[];
}

export interface StartExamResponse {
  session_id: string;
  topic_name: string;
  total_questions: number;
  questions: Question[];
}

export interface ExamResultResponse {
  session_id: string;
  score: number;
  total_questions: number;
  percentage: number;
}
