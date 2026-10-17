import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Grammar } from './grammar.entity';
import { Level } from './level.entity';
import { Vocabulary } from './vocabulary.entity';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'varchar', length: 36 })
  levelId: string;

  @ManyToOne(() => Level, (level) => level.topics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'levelId' })
  level: Level;

  @OneToMany(() => Vocabulary, (vocabulary) => vocabulary.topic)
  vocabularies: Vocabulary[];

  @OneToMany(() => Grammar, (grammar) => grammar.topic)
  grammars: Grammar[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}