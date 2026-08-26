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
 * Delivery core for submitContactForm: sends independent per-recipient
 * requests (see the comment at its call site below for why) to the required
 * recipients plus any CONTACT_TO_EMAIL extras, and reports which addresses
 * actually succeeded/failed. The caller can't shrink or bypass the
 * required-recipient list.
 */
async function sendNotificationEmail(options: {
  apiKey: string;
  fromEmail: string;
  replyTo: string;
  subject: string;
  text: string;
}): Promise<{ succeeded: string[]; failed: string[] }> {
  const REQUIRED_RECIPIENTS = [contactInfo.email, "maazqureshi632@gmail.com"];
  const extraRecipients = (process.env.CONTACT_TO_EMAIL ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const toEmail = Array.from(new Set([...REQUIRED_RECIPIENTS, ...extraRecipients]));

  // Sent as independent per-recipient requests rather than one call with a
  // multi-address `to` array. A single Resend call only reports one
  // success/failure for the whole message — it can't reveal that, say,
  // support@zazdigitalsolutions.com went through while
  // maazqureshi632@gmail.com didn't. Sending each recipient its own request
  // makes every recipient's outcome independently visible in the server
  // logs, which is exactly what's needed to diagnose "one address is
  // getting it, the other isn't" instead of guessing.
  const results = await Promise.allSettled(
    toEmail.map(async (recipient) => {
      const response = await fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: options.fromEmail,
          to: recipient,
          reply_to: options.replyTo,
          subject: options.subject,
          text: options.text,
        }),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend rejected the send to ${recipient}: ${response.status} ${body}`);
      }
      return recipient;
    })
  );

  const succeeded: string[] = [];
  const failed: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      succeeded.push(result.value);
    } else {
      failed.push(toEmail[i]);
      console.error("sendNotificationEmail: delivery failed for one recipient —", result.reason);
    }
  });

  return { succeeded, failed };
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

  const subject = `New project inquiry — ${projectType} (${name})`;
  const text = bodyLines.join("\n");

  const { succeeded, failed } = await sendNotificationEmail({ apiKey, fromEmail, replyTo: email, subject, text });

  if (succeeded.length === 0) {
    // Every recipient failed — nothing reached anyone, so this is an
    // honest failure, not a partial success.
    return {
      status: "error",
      message: "Something went wrong sending your message. Please email us directly instead.",
    };
  }

  if (failed.length > 0) {
    // At least one recipient got it, so the lead isn't lost — but log
    // exactly who was missed so it can be caught and fixed, not silently
    // dropped the way this exact issue reached us in the first place.
    console.error("submitContactForm: partial delivery — missing recipients:", failed);
  }

  return {
    status: "success",
    message: "Thanks — that's in. We'll follow up at the email you provided.",
  };
}
