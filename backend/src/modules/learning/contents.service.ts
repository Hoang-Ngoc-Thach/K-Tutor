import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ListContentsQueryDto } from './dto/list-contents-query.dto';

export interface ContentRow {
  id: string;
  type: 'vocabulary' | 'grammar';
  korean: string;
  pronunciation: string | null;
  meaning: string;
  topicId: string;
  topicName: string;
  createdAt: Date;
}

// Danh sách gộp từ vựng + ngữ pháp cho trang admin "Nội dung học".
// Dùng UNION ALL để phân trang đúng trên cả hai bảng. Mọi giá trị đều truyền
// qua tham số (?), không nối chuỗi từ input của người dùng.
@Injectable()
export class ContentsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findPage(query: ListContentsQueryDto) {
    const current = query.current ?? 1;
    const pageSize = query.pageSize ?? 10;
    const like = query.search ? `%${query.search}%` : null;

    const vocabularyWhere: string[] = [];
    const vocabularyParams: unknown[] = [];
    const grammarWhere: string[] = [];
    const grammarParams: unknown[] = [];

    if (query.topicId) {
      vocabularyWhere.push('v.topicId = ?');
      vocabularyParams.push(query.topicId);
      grammarWhere.push('g.topicId = ?');
      grammarParams.push(query.topicId);
    }
    if (like) {
      vocabularyWhere.push(
        '(v.korean LIKE ? OR v.meaning LIKE ? OR v.pronunciation LIKE ?)',
      );
      vocabularyParams.push(like, like, like);
      grammarWhere.push('(g.title LIKE ? OR g.content LIKE ?)');
      grammarParams.push(like, like);
    }

    const vocabularyClause = vocabularyWhere.length
      ? `WHERE ${vocabularyWhere.join(' AND ')}`
      : '';
    const grammarClause = grammarWhere.length
      ? `WHERE ${grammarWhere.join(' AND ')}`
      : '';

    const vocabularySelect = `
      SELECT v.id AS id, 'vocabulary' AS type, v.korean AS korean,
             v.pronunciation AS pronunciation, v.meaning AS meaning,
             v.topicId AS topicId, t.name AS topicName, v.createdAt AS createdAt
      FROM vocabularies v
      JOIN topics t ON t.id = v.topicId
      ${vocabularyClause}`;
    const grammarSelect = `
      SELECT g.id AS id, 'grammar' AS type, g.title AS korean,
             NULL AS pronunciation, g.content AS meaning,
             g.topicId AS topicId, t.name AS topicName, g.createdAt AS createdAt
      FROM grammars g
      JOIN topics t ON t.id = g.topicId
      ${grammarClause}`;

    // Số lượng từng loại (theo bộ lọc chủ đề + từ khóa) cho các tab "Tất cả / Từ vựng / Ngữ pháp".
    const [vocabularyCount, grammarCount] = await Promise.all([
      this.count(
        `SELECT COUNT(*) AS total FROM vocabularies v ${vocabularyClause}`,
        vocabularyParams,
      ),
      this.count(
        `SELECT COUNT(*) AS total FROM grammars g ${grammarClause}`,
        grammarParams,
      ),
    ]);

    const branches: string[] = [];
    const params: unknown[] = [];
    if (query.type !== 'grammar') {
      branches.push(vocabularySelect);
      params.push(...vocabularyParams);
    }
    if (query.type !== 'vocabulary') {
      branches.push(grammarSelect);
      params.push(...grammarParams);
    }

    const total =
      query.type === 'vocabulary'
        ? vocabularyCount
        : query.type === 'grammar'
          ? grammarCount
          : vocabularyCount + grammarCount;

    const items: ContentRow[] = await this.dataSource.query(
      `SELECT * FROM (${branches.join(' UNION ALL ')}) AS c
       ORDER BY c.createdAt DESC, c.id ASC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, (current - 1) * pageSize],
    );

    return {
      items,
      meta: { current, pageSize, total },
      summary: {
        all: vocabularyCount + grammarCount,
        vocabulary: vocabularyCount,
        grammar: grammarCount,
      },
    };
  }

  private async count(sql: string, params: unknown[]): Promise<number> {
    const rows: { total: number | string }[] = await this.dataSource.query(
      sql,
      params,
    );
    return Number(rows[0]?.total ?? 0);
  }
}
