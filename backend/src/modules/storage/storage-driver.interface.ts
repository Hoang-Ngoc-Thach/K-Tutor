export type StorageKind = 'image' | 'audio';

export interface StorageFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface StorageUploadOptions {
  kind: StorageKind;
  folder: string;
}

export interface StoredFile {
  url: string;
  publicId: string;
  kind: StorageKind;
  bytes: number;
  mimeType: string;
}

export interface StorageDriver {
  upload(file: StorageFile, options: StorageUploadOptions): Promise<StoredFile>;
  delete(publicId: string, kind: StorageKind): Promise<void>;
}
