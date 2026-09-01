export type QuestionType = 'short_text' | 'single_choice' | 'multiple_choice' | 'number_input' | 'lottery' | 'matrix' | 'slider';

export interface LotteryRow {
  id?: number;
  sureAmount: number;
  gamble: string;
}

export interface QuestionCondition {
  operator?: 'AND' | 'OR';
  rules?: any[];
  questionId?: string;
  expectedValue?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  block_name: string;
  options?: any;
  dependsOn?: QuestionCondition;
  required?: boolean;
}

export interface LotteryResponse {
  type: 'lottery_response';
  choices: ('A' | 'B' | null)[];
  selectedValues: Record<number, 'A' | 'B'>;
  rows: LotteryRow[];
}

export type AnswerValue = string | string[] | number | LotteryResponse | Record<string, string> | undefined;

export interface SessionData {
  sessionId: string;
  currentStep: number;
  answers: Record<string, AnswerValue>;
}
