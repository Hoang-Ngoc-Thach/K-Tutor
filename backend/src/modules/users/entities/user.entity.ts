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

  // Set when the learner confirms the email link. Learners cannot log in
  // while this is null (admins are exempt).
  @Column({ type: 'datetime', nullable: true })
  emailVerifiedAt: Date | null;

  // Study reminder emails. The learner can switch them off via the
  // unsubscribe link in the email.
  @Column({ type: 'boolean', default: true })
  reminderEmails: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastReminderAt: Date | null;

  // Reminders sent in a row without the learner studying in between.
  @Column({ type: 'int', default: 0 })
  reminderCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
