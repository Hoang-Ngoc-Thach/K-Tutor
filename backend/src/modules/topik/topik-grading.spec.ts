import { gradeAttempt } from './topik-grading';

describe('gradeAttempt', () => {
  const questions = [
    { id: 'q1', answerIndex: 0 },
    { id: 'q2', answerIndex: 2 },
    { id: 'q3', answerIndex: 1 },
    { id: 'q4', answerIndex: 3 },
  ];

  it('counts correct answers and rounds the score to 0-100', () => {
    const result = gradeAttempt(questions, [
      { questionId: 'q1', answerIndex: 0 },
      { questionId: 'q2', answerIndex: 2 },
      { questionId: 'q3', answerIndex: 0 },
    ]);
    expect(result).toEqual({ correct: 2, total: 4, score: 50 });
  });

  it('treats unanswered questions as wrong', () => {
    expect(gradeAttempt(questions, [])).toEqual({
      correct: 0,
      total: 4,
      score: 0,
    });
  });

  it('uses the last answer when a question is answered twice', () => {
    const result = gradeAttempt(questions, [
      { questionId: 'q1', answerIndex: 3 },
      { questionId: 'q1', answerIndex: 0 },
    ]);
    expect(result.correct).toBe(1);
  });

  it('returns 100 when everything is right', () => {
    const result = gradeAttempt(
      questions,
      questions.map((q) => ({ questionId: q.id, answerIndex: q.answerIndex })),
    );
    expect(result.score).toBe(100);
  });

  it('does not divide by zero for an empty exam', () => {
    expect(gradeAttempt([], [])).toEqual({ correct: 0, total: 0, score: 0 });
  });
});
