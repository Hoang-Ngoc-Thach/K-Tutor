import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as ExcelJS from 'exceljs';

export const MAX_IMPORT_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
export const MAX_IMPORT_ROWS = 500;
export const MAX_REPORTED_ERRORS = 50;

export interface ImportColumn {
  field: string;
  // Tên cột chấp nhận trong dòng tiêu đề (đã viết thường, bỏ dấu *).
  aliases: string[];
  required: boolean;
  maxLength: number;
}

export interface ImportRow {
  row: number; // số dòng trong file Excel (dòng 1 là tiêu đề)
  values: Record<string, string>;
}

export interface ImportRowError {
  row: number;
  field: string;
  code: 'REQUIRED' | 'TOO_LONG' | 'DUPLICATE_IN_FILE' | 'DUPLICATE_EXISTING';
}

export const excelUploadOptions: MulterOptions = {
  limits: { fileSize: MAX_IMPORT_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, callback) => {
    const isXlsx = file.originalname.toLowerCase().endsWith('.xlsx');
    if (!isXlsx) {
      callback(new BadRequestException('IMPORT_INVALID_FILE'), false);
      return;
    }
    callback(null, true);
  },
};

function normalizeHeader(text: string): string {
  return text
    .normalize('NFC')
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function cellToString(value: ExcelJS.CellValue | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value.normalize('NFC').trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if ('richText' in value) {
    return value.richText
      .map((part) => part.text)
      .join('')
      .normalize('NFC')
      .trim();
  }
  if ('result' in value && value.result !== undefined) {
    return cellToString(value.result as ExcelJS.CellValue);
  }
  if ('text' in value && typeof value.text === 'string') {
    return value.text.normalize('NFC').trim(); // hyperlink
  }
  return '';
}

// Đọc sheet đầu tiên: dòng 1 là tiêu đề, các dòng sau là dữ liệu.
// Bỏ qua dòng trống hoàn toàn. Ném BadRequestException với mã lỗi (IMPORT_*).
export async function readExcelRows(
  buffer: Buffer,
  columns: ImportColumn[],
): Promise<ImportRow[]> {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  } catch {
    throw new BadRequestException('IMPORT_INVALID_FILE');
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new BadRequestException('IMPORT_EMPTY');
  }

  // Tìm vị trí cột theo tên tiêu đề (không phụ thuộc thứ tự cột).
  const columnIndex: Record<string, number> = {};
  sheet.getRow(1).eachCell((cell, columnNumber) => {
    const name = normalizeHeader(cellToString(cell.value));
    for (const column of columns) {
      if (
        columnIndex[column.field] === undefined &&
        column.aliases.includes(name)
      ) {
        columnIndex[column.field] = columnNumber;
      }
    }
  });

  const missing = columns
    .filter((column) => column.required && !columnIndex[column.field])
    .map((column) => column.field);
  if (missing.length > 0) {
    throw new BadRequestException({
      message: 'IMPORT_MISSING_COLUMNS',
      columns: missing,
    });
  }

  const rows: ImportRow[] = [];
  sheet.eachRow({ includeEmpty: false }, (excelRow, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const values: Record<string, string> = {};
    let hasData = false;
    for (const column of columns) {
      const index = columnIndex[column.field];
      const text = index ? cellToString(excelRow.getCell(index).value) : '';
      values[column.field] = text;
      if (text) {
        hasData = true;
      }
    }
    if (!hasData) {
      return;
    }

    rows.push({ row: rowNumber, values });
    if (rows.length > MAX_IMPORT_ROWS) {
      throw new BadRequestException({
        message: 'IMPORT_TOO_MANY_ROWS',
        max: MAX_IMPORT_ROWS,
      });
    }
  });

  if (rows.length === 0) {
    throw new BadRequestException('IMPORT_EMPTY');
  }
  return rows;
}

// Kiểm tra bắt buộc / độ dài từng ô, ghi lỗi theo dòng.
export function validateRow(
  row: ImportRow,
  columns: ImportColumn[],
  errors: ImportRowError[],
): void {
  for (const column of columns) {
    const value = row.values[column.field];
    if (!value) {
      if (column.required) {
        errors.push({ row: row.row, field: column.field, code: 'REQUIRED' });
      }
    } else if (value.length > column.maxLength) {
      errors.push({ row: row.row, field: column.field, code: 'TOO_LONG' });
    }
  }
}

export function throwIfInvalid(errors: ImportRowError[]): void {
  if (errors.length > 0) {
    throw new BadRequestException({
      message: 'IMPORT_INVALID_ROWS',
      total: errors.length,
      errors: errors.slice(0, MAX_REPORTED_ERRORS),
    });
  }
}
