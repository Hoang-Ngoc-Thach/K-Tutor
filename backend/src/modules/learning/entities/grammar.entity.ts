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
import { ExampleSentence } from './example-sentence.entity';
import { Topic } from './topic.entity';

@Entity('grammars')
export class Grammar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  // Nội dung ngữ pháp dạng HTML để user đọc
  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'varchar', length: 36 })
  topicId: string;

  @ManyToOne(() => Topic, (topic) => topic.grammars, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topicId' })
  topic: Topic;

  @OneToMany(() => ExampleSentence, (example) => example.grammar)
  examples: ExampleSentence[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}