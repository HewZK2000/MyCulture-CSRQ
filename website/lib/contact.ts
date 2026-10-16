export const CONTACT_TOPICS = ['Dataset', 'Evaluation toolkit', 'Collaboration', 'Report an error', 'Other'] as const;
export const NAME_MAX = 100;
export const AFFILIATION_MAX = 150;
export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 2000;

// Web3Forms access key: a public alias for the receiving inbox, safe to ship in client code.
export const WEB3FORMS_ACCESS_KEY = '95fc043a-b72b-40a9-a616-5b3287330231';
export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
// Shown publicly as the fallback address; form messages go to the inbox behind the access key.
export const DIRECT_EMAIL = 'cs.chan@um.edu.my';

export type ContactFields = { name: string; email: string; affiliation: string; topic: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(fields: ContactFields): ContactErrors {
  const name = fields.name.trim();
  const email = fields.email.trim();
  const affiliation = fields.affiliation.trim();
  const message = fields.message.trim();
  const errors: ContactErrors = {};

  if (!name) errors.name = 'Please enter your name.';
  else if (name.length > NAME_MAX) errors.name = `Please keep your name under ${NAME_MAX} characters.`;

  if (!EMAIL_PATTERN.test(email)) errors.email = 'Please enter a valid email address so we can reply.';

  if (affiliation.length > AFFILIATION_MAX) errors.affiliation = `Please keep this under ${AFFILIATION_MAX} characters.`;

  if (!(CONTACT_TOPICS as readonly string[]).includes(fields.topic)) errors.topic = 'Please choose a topic.';

  if (message.length < MESSAGE_MIN) errors.message = `Please write at least ${MESSAGE_MIN} characters.`;
  else if (message.length > MESSAGE_MAX) errors.message = `Please keep your message under ${MESSAGE_MAX.toLocaleString('en-US')} characters.`;

  return errors;
}

// The JSON body Web3Forms expects. `replyto` lets the inbox owner answer the visitor directly.
export function buildSubmission(fields: ContactFields, accessKey: string): Record<string, string> {
  const name = fields.name.trim();
  const email = fields.email.trim();
  return {
    access_key: accessKey,
    subject: `[MyCulture] ${fields.topic} · ${name}`,
    from_name: 'MyCulture website',
    replyto: email,
    name,
    email,
    affiliation: fields.affiliation.trim() || 'Not given',
    topic: fields.topic,
    message: fields.message.trim(),
  };
}
