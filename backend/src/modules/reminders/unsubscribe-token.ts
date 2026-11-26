import { createHmac, timingSafeEqual } from 'crypto';

// Unsubscribe links must work without logging in and must not expire, so the
// token is a signed copy of the user id (HMAC), not a login token. It is
// signed with its own purpose label, so it can never be used as a JWT.

function sign(userId: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`unsubscribe:${userId}`)
    .digest('base64url');
}

export function createUnsubscribeToken(userId: string, secret: string): string {
  return `${Buffer.from(userId).toString('base64url')}.${sign(userId, secret)}`;
}

// Returns the user id when the token is genuine, otherwise null.
export function readUnsubscribeToken(
  token: string,
  secret: string,
): string | null {
  const [encodedId, signature, ...rest] = token.split('.');
  if (!encodedId || !signature || rest.length > 0) return null;

  const userId = Buffer.from(encodedId, 'base64url').toString();
  const expected = Buffer.from(sign(userId, secret));
  const received = Buffer.from(signature);

  if (expected.length !== received.length) return null;
  return timingSafeEqual(expected, received) ? userId : null;
}
