export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';

export interface OptionDto {
  id: string;
  text: string;
}

export interface QuestionDto {
  id: string;
  text: string;
  type: QuestionType;
  options: OptionDto[];
  order: number;
  points: number;
}

export interface QuizDto {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  description: string | null;
  questions: QuestionDto[];
  timeLimitMinutes: number | null;
  passingScore: number;
  totalQuestions: number;
  totalPoints: number;
}

// Submit
export interface StudentAnswerRequest {
  questionId: string;
  selectedOptionIds: string[];
}

export interface SubmitQuizRequest {
  answers: StudentAnswerRequest[];
}

// Result
export interface AnswerResultDto {
  questionId: string;
  questionText: string;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  correct: boolean;
  pointsEarned: number;
  pointsPossible: number;
}

export interface QuizResultResponse {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  earnedPoints: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  answers: AnswerResultDto[];
  submittedAt: string;
}

export interface QuizSummary {
  id: string;
  lessonId: string | null;
  title: string;
  status: string;
}

export interface OptionResponse {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionResponse {
  id: string;
  text: string;
  type: QuestionType;
  options: OptionResponse[];
  order: number;
  points: number;
}

export interface QuizResponse {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  description: string | null;
  questions: QuestionResponse[];
  timeLimitMinutes: number | null;
  passingScore: number;
  status: string;
  totalQuestions: number;
  totalPoints: number;
  createdAt: string;
}