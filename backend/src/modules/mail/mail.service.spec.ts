import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

const message = {
  to: 'a@b.c',
  subject: 'Hi',
  text: 'secret link',
  html: '<p>secret link</p>',
};

function serviceWith(settings: Record<string, string>): MailService {
  const config = { get: (key: string) => settings[key] } as ConfigService;
  return new MailService(config);
}

describe('MailService without MAIL_HOST', () => {
  it('only logs the email in development', async () => {
    const service = serviceWith({ NODE_ENV: 'development' });
    await expect(service.send(message)).resolves.toBeUndefined();
  });

  it('refuses to send in production, so secret links are never logged', async () => {
    const service = serviceWith({ NODE_ENV: 'production' });
    await expect(service.send(message)).rejects.toThrow('MAIL_HOST');
  });
});
