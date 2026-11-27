import { BadRequestException } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { validatePublicId } from '../../storage/public-id-validation';
import { StorageKind } from '../../storage/storage-driver.interface';

@ValidatorConstraint({ name: 'isAllowedTopikMediaUrl', async: false })
export class IsAllowedTopikMediaUrlConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;

    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return false;
    }

    if (url.username || url.password) return false;
    if (url.protocol === 'https:') return true;

    return (
      url.protocol === 'http:' &&
      process.env.NODE_ENV === 'development' &&
      (process.env.STORAGE_DRIVER || 'local') === 'local'
    );
  }

  defaultMessage(): string {
    return 'Media URLs must use HTTPS';
  }
}

@ValidatorConstraint({ name: 'isStoragePublicId', async: false })
export class IsStoragePublicIdConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== 'string') return false;

    try {
      validatePublicId(value, args.constraints[0] as StorageKind);
      return true;
    } catch (error) {
      if (error instanceof BadRequestException) return false;
      throw error;
    }
  }

  defaultMessage(): string {
    return 'The storage public ID is invalid';
  }
}

@ValidatorConstraint({ name: 'isListeningAudioTime', async: false })
export class IsListeningAudioTimeConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (value === null || value === undefined) return true;
    const question = args.object as { section?: string };
    return question.section === 'listening';
  }

  defaultMessage(): string {
    return 'Audio times are only allowed for listening questions';
  }
}

@ValidatorConstraint({ name: 'isAudioEndAfterStart', async: false })
export class IsAudioEndAfterStartConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const question = args.object as {
      audioStartSec?: number | null;
      audioEndSec?: number | null;
    };
    if (question.audioStartSec == null || question.audioEndSec == null) {
      return true;
    }
    return question.audioEndSec > question.audioStartSec;
  }

  defaultMessage(): string {
    return 'Audio end time must be greater than start time';
  }
}
