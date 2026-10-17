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

@Entity('vocabularies')
export class Vocabulary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  korean: string;

  @Column({ type: 'varchar', length: 500 })
  meaning: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pronunciation: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'varchar', length: 36 })
  topicId: string;

  @ManyToOne(() => Topic, (topic) => topic.vocabularies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'topicId' })
  topic: Topic;

  @OneToMany(() => ExampleSentence, (example) => example.vocabulary)
  examples: ExampleSentence[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}