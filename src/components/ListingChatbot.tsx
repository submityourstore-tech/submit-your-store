"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ListingPrefill } from "@/lib/listing-prefill";
import {
  LISTING_CHATBOT_DRAFT_KEY,
  type ChatInput,
  type ChatReply,
  type ChatStep,
  type ListingDraft,
} from "@/lib/listing-chatbot";
import { SITE_WHATSAPP_DISPLAY, SITE_WHATSAPP_LINK } from "@/lib/site-config";

type ChatMessage = {
  role: "bot" | "user";
  text: string;
};

const INITIAL_STEP: ChatStep = "welcome";

export function ListingChatbot() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<ChatStep>(INITIAL_STEP);
  const [draft, setDraft] = useState<ListingDraft>({});
  const [input, setInput] = useState("");
  const [buttons, setButtons] = useState<ChatReply["buttons"]>([]);
  const [inputType, setInputType] = useState<"text" | "none">("none");
  const [placeholder, setPlaceholder] = useState("");
  const [whatsappLink, setWhatsappLink] = useState<string | undefined>();
  const [continueHref, setContinueHref] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [checkingGbp, setCheckingGbp] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const isAdmin = pathname.startsWith("/admin");

  const appendBot = useCallback((lines: string[]) => {
    setMessages((prev) => [...prev, ...lines.map((text) => ({ role: "bot" as const, text }))]);
  }, []);

  const applyReply = useCallback(
    (reply: ChatReply) => {
      appendBot(reply.messages);
      setStep(reply.step);
      setDraft(reply.draft);
      setButtons(reply.buttons);
      setInputType(reply.inputType);
      setPlaceholder(reply.placeholder ?? "");
      setWhatsappLink(reply.whatsappLink);
      setContinueHref(reply.continueHref);

      if (reply.step === "list_complete" && reply.draft.gbpUrl) {
        sessionStorage.setItem(LISTING_CHATBOT_DRAFT_KEY, JSON.stringify(reply.draft));
      }
    },
    [appendBot],
  );

  const sendToBot = useCallback(
    async (payload: ChatInput) => {
      setBusy(true);
      try {
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const reply = (await res.json()) as ChatReply;
        applyReply(reply);
      } catch {
        appendBot(["Connection error. Try again or WhatsApp us for help."]);
      } finally {
        setBusy(false);
      }
    },
    [applyReply, appendBot],
  );

  const startChat = useCallback(async () => {
    if (started.current) return;
    started.current = true;
    await sendToBot({ step: INITIAL_STEP, draft: {} });
  }, [sendToBot]);

  useEffect(() => {
    if (open) {
      void startChat();
    }
  }, [open, startChat]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, buttons, busy]);

  async function checkGbpUrl(url: string, currentDraft: ListingDraft) {
    setCheckingGbp(true);
    try {
      const res = await fetch("/api/listings/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gbpUrl: url }),
        signal: AbortSignal.timeout(45_000),
      });
      const data = (await res.json()) as {
        error?: string;
        available?: boolean;
        prefill?: ListingPrefill;
        resolvedGbpUrl?: string;
      };

      if (!res.ok || data.error) {
        await sendToBot({
          step: "list_gbp",
          draft: currentDraft,
          gbpCheck: { ok: false, error: data.error ?? "Invalid Google profile link." },
        });
        return;
      }

      await sendToBot({
        step: "list_gbp",
        draft: currentDraft,
        gbpCheck: {
          ok: true,
          prefill: data.prefill,
          resolvedGbpUrl: data.resolvedGbpUrl,
        },
      });
    } catch {
      await sendToBot({
        step: "list_gbp",
        draft: currentDraft,
        gbpCheck: { ok: false, error: "Could not verify Google profile. Try again." },
      });
    } finally {
      setCheckingGbp(false);
    }
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy || checkingGbp) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    if (step === "list_gbp") {
      const nextDraft = { ...draft, gbpUrl: text };
      setDraft(nextDraft);
      appendBot(["Checking your Google profile…"]);
      await checkGbpUrl(text, nextDraft);
      return;
    }

    await sendToBot({ step, message: text, draft });
  }

  async function handleButton(buttonId: string, label: string) {
    if (busy || checkingGbp) return;

    setMessages((prev) => [...prev, { role: "user", text: label }]);

    if (buttonId === "continue") {
      sessionStorage.setItem(LISTING_CHATBOT_DRAFT_KEY, JSON.stringify(draft));
      setOpen(false);
      router.push("/list-your-business");
      return;
    }

    if (buttonId === "whatsapp") {
      window.open(SITE_WHATSAPP_LINK, "_blank", "noopener,noreferrer");
    }

    await sendToBot({ step, buttonId, draft });
  }

  if (isAdmin) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#1274c0] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0d5a96] sm:bottom-6 sm:right-6"
          aria-label="Open listing assistant chat"
        >
          <span className="text-lg" aria-hidden>
            💬
          </span>
          <span className="hidden sm:inline">List your business</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[min(520px,calc(100vh-2rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-[#ddd] bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-[#eee] bg-[#1274c0] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">Listing Assistant</p>
              <p className="text-xs text-white/80">Free listings · WhatsApp {SITE_WHATSAPP_DISPLAY}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-white/90 hover:bg-white/20"
              aria-label="Close chat"
            >
              ✕
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {messages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#1274c0] text-white"
                      : "bg-[#f3f4f6] text-[#111]"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {(busy || checkingGbp) && (
              <div className="text-xs text-[#999]">Typing…</div>
            )}
          </div>

          <div className="border-t border-[#eee] bg-[#fafafa] px-3 py-3">
            {buttons && buttons.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {buttons.map((btn) =>
                  btn.id === "whatsapp" ? (
                    <a
                      key={btn.id}
                      href={SITE_WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-[#25a244] bg-[#f0fdf4] px-3 py-1.5 text-xs font-semibold text-[#15803d] hover:bg-[#dcfce7]"
                    >
                      {btn.label}
                    </a>
                  ) : (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => void handleButton(btn.id, btn.label)}
                      disabled={busy || checkingGbp}
                      className="rounded-full border border-[#1274c0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1274c0] hover:bg-[#f0f7fd] disabled:opacity-50"
                    >
                      {btn.label}
                    </button>
                  ),
                )}
              </div>
            )}

            {whatsappLink && !buttons?.some((b) => b.id === "whatsapp") && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-[#25a244] hover:underline"
              >
                💬 Chat on WhatsApp
              </a>
            )}

            {continueHref && step === "list_complete" && (
              <Link
                href={continueHref}
                onClick={() => sessionStorage.setItem(LISTING_CHATBOT_DRAFT_KEY, JSON.stringify(draft))}
                className="mb-2 block text-center text-sm font-semibold text-[#1274c0] hover:underline"
              >
                Continue to listing form →
              </Link>
            )}

            {inputType === "text" && (
              <form onSubmit={(e) => void handleSend(e)} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={placeholder}
                  disabled={busy || checkingGbp}
                  className="min-w-0 flex-1 rounded-lg border border-[#ccc] px-3 py-2 text-sm outline-none focus:border-[#1274c0]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || busy || checkingGbp}
                  className="rounded-lg bg-[#1274c0] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
