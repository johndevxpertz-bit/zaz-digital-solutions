"use server";

import { contactInfo, projectTypeOptions } from "@/lib/data/contact";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MIN_SUBMIT_MS = 1500;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Server Action backing the contact form — this is the "API route" for this
 * form: Next.js compiles it to its own POST endpoint, the implementation
 * never ships to the client bundle, and env vars stay server-only.
 *
 * Email delivery requires RESEND_API_KEY (see .env.local.example). Without
 * it, submissions are validated and rejected with an honest error instead of
 * a fake success — see the "not configured" branch below.
 */
export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot: a field real visitors never see or fill. Bots that
  // autofill every input will trip it. Report success without sending,
  // so scripted submitters don't learn to avoid the field.
  const honeypot = String(formData.get("company_site") ?? "").trim();
  if (honeypot) {
    console.warn("submitContactForm: honeypot triggered, discarding submission");
    return { status: "success", message: "Thanks — that's in. We'll follow up at the email you provided." };
  }

  // Timing check: a real person needs at least a moment to fill the form.
  const startedAt = Number(formData.get("formStartedAt") ?? 0);
  if (startedAt && Date.now() - startedAt < MIN_SUBMIT_MS) {
    console.warn("submitContactForm: submitted too fast, likely automated, discarding");
    return { status: "success", message: "Thanks — that's in. We'll follow up at the email you provided." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const projectType = String(formData.get("projectType") ?? "").trim();
  const budget = String(formData.get("budget") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !projectType || !message) {
    return {
      status: "error",
      message: "Please fill in your name, email, project type, and project details.",
    };
  }

  if (!isValidEmail(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  if (!(projectTypeOptions as readonly string[]).includes(projectType)) {
    return { status: "error", message: "Please select a valid project type." };
  }

  if (name.length > 200 || email.length > 200 || message.length > 5000) {
    return { status: "error", message: "One of the fields is too long — please shorten it and try again." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Honest failure: no provider configured yet. Never claim delivery
    // that didn't happen. See .env.local.example to enable this.
    console.error("submitContactForm: RESEND_API_KEY is not set — email not sent.");
    return {
      status: "error",
      message:
        "Sorry, online submission isn't fully set up yet. Please reach out directly using the email or phone number on this page.",
    };
  }

  // Every submission notifies both the primary support inbox and the
  // secondary recipient — always, not conditionally on an env var being set
  // correctly. CONTACT_TO_EMAIL (comma-separated) can add further recipients
  // on top of these two, but can never remove either of them.
  const REQUIRED_RECIPIENTS = [contactInfo.email, "maazqureshi632@gmail.com"];
  const extraRecipients = (process.env.CONTACT_TO_EMAIL ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const toEmail = Array.from(new Set([...REQUIRED_RECIPIENTS, ...extraRecipients]));
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "ZAZ Digital Solutions Website <onboarding@resend.dev>";

  const bodyLines = [
    `Name: ${name}`,
    `Email: ${email}`,
    company && `Company: ${company}`,
    `Project type: ${projectType}`,
    budget && `Budget: ${budget}`,
    "",
    "Project details:",
    message,
  ].filter((line): line is string => Boolean(line));

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        reply_to: email,
        subject: `New project inquiry — ${projectType} (${name})`,
        text: bodyLines.join("\n"),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("submitContactForm: email provider error", response.status, body);
      return {
        status: "error",
        message: "Something went wrong sending your message. Please email us directly instead.",
      };
    }
  } catch (error) {
    console.error("submitContactForm: network error calling email provider", error);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please email us directly instead.",
    };
  }

  return {
    status: "success",
    message: "Thanks — that's in. We'll follow up at the email you provided.",
  };
}
