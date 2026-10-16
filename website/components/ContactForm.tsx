'use client';

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import {
  buildSubmission,
  CONTACT_TOPICS,
  DIRECT_EMAIL,
  MESSAGE_MAX,
  validateContact,
  WEB3FORMS_ACCESS_KEY,
  WEB3FORMS_ENDPOINT,
  type ContactErrors,
  type ContactFields,
} from '@/lib/contact';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type FieldName = keyof ContactFields;

const emptyFields: ContactFields = { name: '', email: '', affiliation: '', topic: '', message: '' };

function Field({ id, label, hint, error, children }: { id: FieldName; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className={error ? 'contact-field has-error' : 'contact-field'}>
      <label htmlFor={`contact-${id}`}>{label}{hint && <span>{hint}</span>}</label>
      {children}
      {error && <p className="contact-field-error" id={`contact-${id}-error`}>{error}</p>}
    </div>
  );
}

export default function ContactForm() {
  const [fields, setFields] = useState<ContactFields>(emptyFields);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [sentTo, setSentTo] = useState<{ name: string; email: string } | null>(null);

  const fieldProps = (id: FieldName) => ({
    id: `contact-${id}`,
    name: id,
    value: fields[id],
    onChange: update,
    'aria-invalid': errors[id] ? true : undefined,
    'aria-describedby': errors[id] ? `contact-${id}-error` : undefined,
  });

  function update(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const name = event.target.name as FieldName;
    const { value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = validateContact(fields);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    // Bots tick the hidden spam trap. Show them success so they move on, but send nothing.
    if ((form.elements.namedItem('botcheck') as HTMLInputElement | null)?.checked) {
      setStatus('sent');
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(buildSubmission(fields, WEB3FORMS_ACCESS_KEY)),
      });
      const result = (await response.json().catch(() => null)) as { success?: boolean; message?: string } | null;
      if (!response.ok || !result?.success) throw new Error(result?.message ?? `Web3Forms responded with HTTP ${response.status}`);
      setSentTo({ name: fields.name.trim(), email: fields.email.trim() });
      setFields(emptyFields);
      setStatus('sent');
    } catch (error) {
      console.error('Contact form submission failed:', error);
      setStatus('error');
    }
  }

  function startOver() {
    setSentTo(null);
    setStatus('idle');
  }

  if (status === 'sent') {
    return (
      <div className="contact-card contact-sent" role="status">
        <span className="contact-sent-mark" aria-hidden="true">✓</span>
        <h2>Message sent.</h2>
        <p>{sentTo ? <>Thank you, {sentTo.name}. We will reply to <b>{sentTo.email}</b>.</> : 'Thank you. We will be in touch.'}</p>
        <button type="button" className="button button-secondary" onClick={startOver}>Send another message</button>
      </div>
    );
  }

  const messageLength = fields.message.trim().length;

  return (
    <form className="contact-card contact-form" onSubmit={submit} noValidate aria-label="Send the MyCulture team a message">
      <div className="contact-row">
        <Field id="name" label="Name" error={errors.name}>
          <input type="text" autoComplete="name" {...fieldProps('name')} />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input type="email" autoComplete="email" inputMode="email" {...fieldProps('email')} />
        </Field>
      </div>
      <Field id="affiliation" label="Affiliation" hint="Optional" error={errors.affiliation}>
        <input type="text" autoComplete="organization" placeholder="University, lab, or company" {...fieldProps('affiliation')} />
      </Field>
      <Field id="topic" label="Topic" error={errors.topic}>
        <select className={fields.topic ? undefined : 'is-empty'} {...fieldProps('topic')}>
          <option value="" disabled>Choose a topic</option>
          {CONTACT_TOPICS.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
        </select>
      </Field>
      <Field id="message" label="Message" error={errors.message}>
        <textarea rows={7} placeholder="How can we help?" {...fieldProps('message')} />
        <span className={messageLength > MESSAGE_MAX ? 'contact-count is-over' : 'contact-count'} aria-live="polite">
          {messageLength.toLocaleString('en-US')} / {MESSAGE_MAX.toLocaleString('en-US')}
        </span>
      </Field>

      <input type="checkbox" name="botcheck" className="contact-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <p className="contact-privacy">Your message is delivered by Web3Forms to the MyCulture team. We use your details only to reply to you.</p>

      {status === 'error' && (
        <p className="contact-error" role="alert">
          We could not send your message. Please try again, or email us at <a href={`mailto:${DIRECT_EMAIL}`}>{DIRECT_EMAIL}</a>.
        </p>
      )}

      <button type="submit" className="button button-primary contact-submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : <>Send message <span aria-hidden="true">→</span></>}
      </button>
    </form>
  );
}
