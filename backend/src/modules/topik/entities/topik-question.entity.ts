import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TopikExam } from './topik-exam.entity';

export enum TopikSection {
  READING = 'reading',
  LISTENING = 'listening',
}

// One multiple-choice question with exactly 4 options.
@Entity('topik_questions')
export class TopikQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TopikSection, default: TopikSection.READING })
  section: TopikSection;

  @Column({ type: 'text' })
  text: string;

  // Reading passage or sentence with a blank; optional.
  @Column({ type: 'text', nullable: true })
  passage: string | null;

  // Listening transcript, read aloud by the browser (Web Speech API).
  @Column({ type: 'text', nullable: true })
  script: string | null;

  @Column({ type: 'json' })
  options: string[];

  @Column({ type: 'int' })
  answerIndex: number;

  @Column({ type: 'text', nullable: true })
  explanation: string | null;

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  imagePublicId: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 1,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | number | null) =>
        value === null ? null : Number(value),
    },
  })
  audioStartSec: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 1,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | number | null) =>
        value === null ? null : Number(value),
    },
  })
  audioEndSec: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'varchar', length: 36 })
  examId: string;

  @ManyToOne(() => TopikExam, (exam) => exam.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'examId' })
  exam: TopikExam;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
