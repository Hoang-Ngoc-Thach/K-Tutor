import {
  createUnsubscribeToken,
  readUnsubscribeToken,
} from './unsubscribe-token';

describe('unsubscribe token', () => {
  const secret = 'test-secret';
  const userId = '11111111-1111-4111-8111-111111111111';

  it('returns the user id for a genuine token', () => {
    const token = createUnsubscribeToken(userId, secret);
    expect(readUnsubscribeToken(token, secret)).toBe(userId);
  });

  it('rejects a token signed with another secret', () => {
    const token = createUnsubscribeToken(userId, 'other-secret');
    expect(readUnsubscribeToken(token, secret)).toBeNull();
  });

  it('rejects a token whose user id was changed', () => {
    const token = createUnsubscribeToken(userId, secret);
    const [, signature] = token.split('.');
    const forged = `${Buffer.from('22222222-2222-4222-8222-222222222222').toString('base64url')}.${signature}`;
    expect(readUnsubscribeToken(forged, secret)).toBeNull();
  });

  it('rejects malformed tokens without throwing', () => {
    expect(readUnsubscribeToken('', secret)).toBeNull();
    expect(readUnsubscribeToken('abc', secret)).toBeNull();
    expect(readUnsubscribeToken('a.b.c', secret)).toBeNull();
    expect(readUnsubscribeToken('a.b', secret)).toBeNull();
  });
});
