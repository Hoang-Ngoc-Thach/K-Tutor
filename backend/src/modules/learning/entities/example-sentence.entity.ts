import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Grammar } from './grammar.entity';
import { Vocabulary } from './vocabulary.entity';

// Một câu ví dụ gắn với MỘT từ vựng HOẶC MỘT ngữ pháp
@Entity('example_sentences')
export class ExampleSentence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  korean: string;

  @Column({ type: 'varchar', length: 500 })
  meaning: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  vocabularyId: string | null;

  @ManyToOne(() => Vocabulary, (vocabulary) => vocabulary.examples, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vocabularyId' })
  vocabulary: Vocabulary | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  grammarId: string | null;

  @ManyToOne(() => Grammar, (grammar) => grammar.examples, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'grammarId' })
  grammar: Grammar | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}