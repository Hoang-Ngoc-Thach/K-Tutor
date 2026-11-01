import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  create(data: Pick<User, 'email' | 'password'>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  // Admin list of learners. The password column is never selected.
  // `summary` counts all learners and ignores the filters, for the stat cards.
  async findPage(query: ListUsersQueryDto) {
    const current = query.current ?? 1;
    const pageSize = query.pageSize ?? 10;

    const where: FindOptionsWhere<User> = { role: UserRole.LEARNER };
    if (query.goal) {
      where.goal = query.goal;
    }
    if (query.locked !== undefined) {
      where.locked = query.locked;
    }
    if (query.search) {
      where.email = Like(`%${query.search}%`);
    }

    const [items, total] = await this.usersRepository.findAndCount({
      select: {
        id: true,
        email: true,
        role: true,
        goal: true,
        locked: true,
        createdAt: true,
      },
      where,
      order: { createdAt: 'DESC', id: 'ASC' },
      skip: (current - 1) * pageSize,
      take: pageSize,
    });

    const [allLearners, lockedLearners] = await Promise.all([
      this.usersRepository.count({ where: { role: UserRole.LEARNER } }),
      this.usersRepository.count({
        where: { role: UserRole.LEARNER, locked: true },
      }),
    ]);

    return {
      items,
      meta: { current, pageSize, total },
      summary: {
        total: allLearners,
        active: allLearners - lockedLearners,
        locked: lockedLearners,
      },
    };
  }

  async setLocked(
    id: string,
    locked: boolean,
  ): Promise<{ id: string; locked: boolean }> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }
    // Avoid locking admins out of the system.
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('CANNOT_LOCK_ADMIN');
    }

    await this.usersRepository.update(id, { locked });
    return { id, locked };
  }
}
