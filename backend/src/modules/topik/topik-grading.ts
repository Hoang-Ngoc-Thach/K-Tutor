export interface GradableQuestion {
  id: string;
  answerIndex: number;
}

export interface AnswerInput {
  questionId: string;
  answerIndex: number;
}

export interface GradeResult {
  correct: number;
  total: number;
  score: number; // 0-100
}

// Unanswered questions count as wrong. If a question is answered twice,
// the last answer wins.
export function gradeAttempt(
  questions: GradableQuestion[],
  answers: AnswerInput[],
): GradeResult {
  const answerByQuestion = new Map(
    answers.map((answer) => [answer.questionId, answer.answerIndex]),
  );

  const total = questions.length;
  const correct = questions.filter(
    (question) => answerByQuestion.get(question.id) === question.answerIndex,
  ).length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);

  return { correct, total, score };
}
