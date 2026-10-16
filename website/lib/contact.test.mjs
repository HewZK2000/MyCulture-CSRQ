import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSubmission, CONTACT_TOPICS, MESSAGE_MAX, MESSAGE_MIN, validateContact } from './contact.ts';

const valid = {
  name: 'Siti Aminah',
  email: 'siti@example.edu.my',
  affiliation: 'Universiti Malaya',
  topic: 'Collaboration',
  message: 'We would like to evaluate our model on MyCulture.',
};

test('validateContact accepts a complete message', () => {
  assert.deepEqual(validateContact(valid), {});
});

test('validateContact requires name, a valid email, a known topic, and a message', () => {
  const errors = validateContact({ name: '  ', email: 'not-an-email', affiliation: '', topic: 'Spam', message: '' });
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'message', 'name', 'topic']);
});

test('validateContact treats affiliation as optional', () => {
  assert.deepEqual(validateContact({ ...valid, affiliation: '' }), {});
});

test('validateContact enforces message length after trimming', () => {
  assert.ok(validateContact({ ...valid, message: `   ${'a'.repeat(MESSAGE_MIN - 1)}   ` }).message);
  assert.ok(validateContact({ ...valid, message: 'a'.repeat(MESSAGE_MAX + 1) }).message);
  assert.equal(validateContact({ ...valid, message: 'a'.repeat(MESSAGE_MIN) }).message, undefined);
});

test('every topic offered in the form is accepted', () => {
  for (const topic of CONTACT_TOPICS) assert.equal(validateContact({ ...valid, topic }).topic, undefined);
});

test('buildSubmission sets a readable subject and replies to the visitor', () => {
  const payload = buildSubmission({ ...valid, name: '  Siti Aminah ' }, 'key-123');
  assert.equal(payload.access_key, 'key-123');
  assert.equal(payload.subject, '[MyCulture] Collaboration · Siti Aminah');
  assert.equal(payload.replyto, 'siti@example.edu.my');
  assert.equal(payload.name, 'Siti Aminah');
});

test('buildSubmission marks a missing affiliation and never sends the spam-trap field', () => {
  const payload = buildSubmission({ ...valid, affiliation: '   ' }, 'key-123');
  assert.equal(payload.affiliation, 'Not given');
  assert.equal('botcheck' in payload, false);
});
