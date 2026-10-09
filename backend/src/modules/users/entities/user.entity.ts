import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  LEARNER = 'learner',
  ADMIN = 'admin',
}

export enum LearningGoal {
  CONVERSATION = 'conversation',
  TOPIK = 'topik',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.LEARNER })
  role: UserRole;

  @Column({ type: 'enum', enum: LearningGoal, nullable: true, default: null })
  goal: LearningGoal | null;

  @Column({ type: 'boolean', default: false })
  locked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
