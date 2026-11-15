import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubmitTopikAttemptDto } from './dto/submit-topik-attempt.dto';
import { TopikAttempt } from './entities/topik-attempt.entity';
import { TopikExamsService } from './topik-exams.service';
import { gradeAttempt } from './topik-grading';

export interface TopikAttemptResult {
  attemptId: string;
  score: number;
  correct: number;
  total: number;
  durationSec: number;
  // Answers and explanations are revealed only after submitting.
  review: {
    questionId: string;
    answerIndex: number;
    explanation: string | null;
  }[];
}

@Injectable()
export class TopikAttemptsService {
  constructor(
    @InjectRepository(TopikAttempt)
    private readonly attemptsRepo: Repository<TopikAttempt>,
    private readonly examsService: TopikExamsService,
  ) {}

  // The server grades the attempt, so the correct answers never have to be
  // sent to the browser before the learner submits.
  async submit(
    userId: string,
    examId: string,
    dto: SubmitTopikAttemptDto,
  ): Promise<TopikAttemptResult> {
    const exam = await this.examsService.findPublishedWithQuestions(examId);

    const questionIds = new Set(exam.questions.map((question) => question.id));
    if (dto.answers.some((answer) => !questionIds.has(answer.questionId))) {
      throw new BadRequestException('TOPIK_INVALID_ANSWER');
    }

    const { correct, total, score } = gradeAttempt(exam.questions, dto.answers);

    const attempt = await this.attemptsRepo.save(
      this.attemptsRepo.create({
        examId,
        userId,
        score,
        correct,
        total,
        durationSec: dto.durationSec,
      }),
    );

    return {
      attemptId: attempt.id,
      score,
      correct,
      total,
      durationSec: dto.durationSec,
      review: exam.questions.map((question) => ({
        questionId: question.id,
        answerIndex: question.answerIndex,
        explanation: question.explanation,
      })),
    };
  }

  // All attempts of the current learner (the UI shows the best score per exam).
  findMine(userId: string): Promise<TopikAttempt[]> {
    return this.attemptsRepo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
      select: {
        id: true,
        examId: true,
        score: true,
        correct: true,
        total: true,
        durationSec: true,
        createdAt: true,
      },
    });
  }
}
