import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTopikExamDto } from './dto/create-topik-exam.dto';
import { TopikQuestionDto } from './dto/topik-question.dto';
import { UpdateTopikExamDto } from './dto/update-topik-exam.dto';
import { TopikExam, TopikExamStatus } from './entities/topik-exam.entity';
import { TopikQuestion, TopikSection } from './entities/topik-question.entity';

export type TopikExamSummary = TopikExam & { questionCount: number };

// What a learner receives before submitting: no answers, no explanations.
export interface TopikQuestionForLearner {
  id: string;
  section: TopikSection;
  text: string;
  passage: string | null;
  script: string | null;
  options: string[];
  sortOrder: number;
}

@Injectable()
export class TopikExamsService {
  constructor(
    @InjectRepository(TopikExam)
    private readonly examsRepo: Repository<TopikExam>,
    @InjectRepository(TopikQuestion)
    private readonly questionsRepo: Repository<TopikQuestion>,
  ) {}

  // ---- Admin ----

  findAllForAdmin(): Promise<TopikExamSummary[]> {
    return this.findSummaries();
  }

  async findOneForAdmin(id: string): Promise<TopikExam> {
    const exam = await this.examsRepo.findOne({
      where: { id },
      relations: { questions: true },
      order: { questions: { sortOrder: 'ASC' } },
    });
    if (!exam) {
      throw new NotFoundException('TOPIK_EXAM_NOT_FOUND');
    }
    return exam;
  }

  async create(dto: CreateTopikExamDto): Promise<TopikExam> {
    await this.assertTitleAvailable(dto.title);
    this.assertQuestionsValid(dto.questions);

    const exam = this.examsRepo.create({
      title: dto.title,
      level: dto.level,
      year: dto.year,
      round: dto.round || null,
      durationMinutes: dto.durationMinutes,
      status: dto.status ?? TopikExamStatus.DRAFT,
      description: dto.description || null,
      questions: dto.questions.map((question, index) =>
        this.questionsRepo.create(this.toQuestionFields(question, index)),
      ),
    });
    const saved = await this.examsRepo.save(exam);
    return this.findOneForAdmin(saved.id);
  }

  async update(id: string, dto: UpdateTopikExamDto): Promise<TopikExam> {
    const exam = await this.examsRepo.findOne({ where: { id } });
    if (!exam) {
      throw new NotFoundException('TOPIK_EXAM_NOT_FOUND');
    }

    if (dto.title !== undefined) {
      await this.assertTitleAvailable(dto.title, id);
      exam.title = dto.title;
    }
    if (dto.level !== undefined) exam.level = dto.level;
    if (dto.year !== undefined) exam.year = dto.year;
    if (dto.round !== undefined) exam.round = dto.round || null;
    if (dto.durationMinutes !== undefined) {
      exam.durationMinutes = dto.durationMinutes;
    }
    if (dto.status !== undefined) exam.status = dto.status;
    if (dto.description !== undefined) {
      exam.description = dto.description || null;
    }
    if (dto.questions !== undefined) {
      this.assertQuestionsValid(dto.questions);
    }

    // Exam fields and the replaced questions are saved together or not at all.
    await this.examsRepo.manager.transaction(async (manager) => {
      await manager.save(TopikExam, exam);

      if (dto.questions !== undefined) {
        await manager.delete(TopikQuestion, { examId: id });
        await manager.save(
          TopikQuestion,
          dto.questions.map((question, index) =>
            manager.create(TopikQuestion, {
              ...this.toQuestionFields(question, index),
              examId: id,
            }),
          ),
        );
      }
    });

    return this.findOneForAdmin(id);
  }

  // Deleting an exam also deletes its questions and attempts (CASCADE).
  async remove(id: string): Promise<{ id: string }> {
    const exam = await this.examsRepo.findOne({ where: { id } });
    if (!exam) {
      throw new NotFoundException('TOPIK_EXAM_NOT_FOUND');
    }
    await this.examsRepo.remove(exam);
    return { id };
  }

  // ---- Learner ----

  findPublished(): Promise<TopikExamSummary[]> {
    return this.findSummaries(TopikExamStatus.PUBLISHED);
  }

  async findPublishedForLearner(id: string) {
    const exam = await this.findPublishedWithQuestions(id);

    return {
      id: exam.id,
      title: exam.title,
      level: exam.level,
      year: exam.year,
      round: exam.round,
      durationMinutes: exam.durationMinutes,
      status: exam.status,
      description: exam.description,
      // List only the fields that are safe to show before submitting:
      // no correct answer and no explanation.
      questions: exam.questions.map((question): TopikQuestionForLearner => ({
        id: question.id,
        section: question.section,
        text: question.text,
        passage: question.passage,
        script: question.script,
        options: question.options,
        sortOrder: question.sortOrder,
      })),
    };
  }

  // Used by the attempts service, which needs the correct answers.
  async findPublishedWithQuestions(id: string): Promise<TopikExam> {
    const exam = await this.examsRepo.findOne({
      where: { id, status: TopikExamStatus.PUBLISHED },
      relations: { questions: true },
      order: { questions: { sortOrder: 'ASC' } },
    });
    if (!exam) {
      throw new NotFoundException('TOPIK_EXAM_NOT_FOUND');
    }
    return exam;
  }

  // ---- Helpers ----

  private async findSummaries(
    status?: TopikExamStatus,
  ): Promise<TopikExamSummary[]> {
    const exams = await this.examsRepo.find({
      where: status ? { status } : {},
      order: { year: 'DESC', level: 'ASC', title: 'ASC' },
    });

    if (exams.length === 0) {
      return [];
    }

    const rows = await this.questionsRepo
      .createQueryBuilder('question')
      .select('question.examId', 'examId')
      .addSelect('COUNT(*)', 'count')
      .where('question.examId IN (:...examIds)', {
        examIds: exams.map((exam) => exam.id),
      })
      .groupBy('question.examId')
      .getRawMany<{ examId: string; count: string | number }>();
    const counts = new Map(rows.map((row) => [row.examId, Number(row.count)]));

    return exams.map((exam) => ({
      ...exam,
      questionCount: counts.get(exam.id) ?? 0,
    }));
  }

  private toQuestionFields(question: TopikQuestionDto, sortOrder: number) {
    const isListening = question.section === TopikSection.LISTENING;
    return {
      section: question.section,
      text: question.text,
      passage: question.passage || null,
      script: isListening ? question.script || null : null,
      options: question.options,
      answerIndex: question.answerIndex,
      explanation: question.explanation || null,
      sortOrder,
    };
  }

  private assertQuestionsValid(questions: TopikQuestionDto[]): void {
    for (const question of questions) {
      if (new Set(question.options).size !== question.options.length) {
        throw new BadRequestException('TOPIK_OPTIONS_DUPLICATED');
      }
      if (question.section === TopikSection.LISTENING && !question.script) {
        throw new BadRequestException('TOPIK_LISTENING_SCRIPT_REQUIRED');
      }
    }
  }

  private async assertTitleAvailable(
    title: string,
    ignoreId?: string,
  ): Promise<void> {
    const existing = await this.examsRepo.findOne({ where: { title } });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('TOPIK_EXAM_TITLE_EXISTS');
    }
  }
}
