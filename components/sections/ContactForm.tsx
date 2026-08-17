"use client";

import { useActionState, useState } from "react";
import Button from "@/components/ui/Button";
import { projectTypeOptions, budgetOptions } from "@/lib/data/contact";
import { submitContactForm, type ContactFormState } from "@/app/contact/actions";

const inputClasses =
  "w-full rounded-[var(--zaz-radius-sm)] border border-zaz-border-strong bg-zaz-surface px-4 py-3 text-sm text-zaz-text placeholder:text-zaz-muted transition-all duration-200 ease-[var(--zaz-ease)] focus:border-zaz-accent focus:shadow-[0_0_0_3px_rgba(216,211,200,0.12)] focus:outline-none";

const initialState: ContactFormState = { status: "idle", message: "" };

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);
  // Captured once on mount so the server action can reject submissions that
  // arrive implausibly fast (basic bot/spam signal, paired with the
  // honeypot field below).
  const [formStartedAt] = useState(() => Date.now());

  if (state.status === "success") {
    return (
      <div className="rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface p-8">
        <p className="font-heading text-xl font-semibold text-zaz-text">Thanks — that&apos;s in.</p>
        <p className="mt-3 text-sm text-zaz-text-secondary">
          {state.message} In the meantime, feel free to reach out directly using the details on this page.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-5">
      {state.status === "error" && (
        <div
          role="alert"
          className="rounded-[var(--zaz-radius-sm)] border border-zaz-accent-dim bg-zaz-surface px-4 py-3 text-sm text-zaz-text"
        >
          {state.message}
        </div>
      )}

      <input type="hidden" name="formStartedAt" value={formStartedAt} />

      {/* Honeypot — hidden from real visitors (incl. screen readers), left
          empty by humans, often auto-filled by bots. */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="company_site">Leave this field blank</label>
        <input
          id="company_site"
          name="company_site"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="zaz-label mb-2 block">
            Name
          </label>
          <input id="name" name="name" type="text" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="email" className="zaz-label mb-2 block">
            Email
          </label>
          <input id="email" name="email" type="email" required className={inputClasses} />
        </div>
      </div>

      <div>
        <label htmlFor="company" className="zaz-label mb-2 block">
          Company <span className="normal-case text-zaz-muted">(optional)</span>
        </label>
        <input id="company" name="company" type="text" className={inputClasses} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="projectType" className="zaz-label mb-2 block">
            Project type
          </label>
          <select id="projectType" name="projectType" required defaultValue="" className={inputClasses}>
            <option value="" disabled>
              Select one
            </option>
            {projectTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="budget" className="zaz-label mb-2 block">
            Budget <span className="normal-case text-zaz-muted">(optional)</span>
          </label>
          <select id="budget" name="budget" defaultValue="" className={inputClasses}>
            <option value="" disabled>
              Select a range
            </option>
            {budgetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="zaz-label mb-2 block">
          Project details
        </label>
        <textarea id="message" name="message" required rows={5} className={inputClasses} />
      </div>

      <Button type="submit" variant="primary" className="mt-2 w-full sm:w-auto" disabled={isPending}>
        {isPending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
