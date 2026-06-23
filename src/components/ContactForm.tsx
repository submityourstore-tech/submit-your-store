"use client";

import { useState } from "react";
import { SUPPORT_EMAIL } from "@/lib/site-config";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
    ].join("\n");
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject || "Contact from Submit Your Store")}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-[#e0e0e0] bg-[#f7f7f7] p-5">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-[#111]">
          Your name
        </label>
        <input
          id="contact-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-[#111]">
          Your email
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-[#111]">
          Subject
        </label>
        <input
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-[#111]">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-[#1274c0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d5a94]"
      >
        Send message
      </button>
      <p className="text-xs text-[#717171]">
        Submitting opens your email app with a draft to {SUPPORT_EMAIL}. We typically respond within two business days.
      </p>
    </form>
  );
}
