import type { ListingPrefill } from "@/lib/listing-prefill";
import { SITE_WHATSAPP_DISPLAY, SITE_WHATSAPP_LINK } from "@/lib/site-config";

export type ChatStep =
  | "welcome"
  | "list_gbp"
  | "list_name"
  | "list_email"
  | "list_phone"
  | "list_city"
  | "list_description"
  | "list_complete"
  | "search_help"
  | "general_help";

export type ListingDraft = {
  gbpUrl?: string;
  resolvedGbpUrl?: string;
  businessName?: string;
  businessEmail?: string;
  phone?: string;
  city?: string;
  state?: string;
  description?: string;
};

export type ChatButton = {
  id: string;
  label: string;
};

export type ChatInput = {
  step: ChatStep;
  message?: string;
  buttonId?: string;
  draft?: ListingDraft;
  gbpCheck?: {
    ok: boolean;
    error?: string;
    prefill?: ListingPrefill;
    resolvedGbpUrl?: string;
  };
};

export type ChatReply = {
  messages: string[];
  step: ChatStep;
  draft: ListingDraft;
  buttons?: ChatButton[];
  inputType: "text" | "none";
  placeholder?: string;
  whatsappLink?: string;
  continueHref?: string;
};

const WELCOME_BUTTONS: ChatButton[] = [
  { id: "list", label: "List my business" },
  { id: "search", label: "Find a business" },
  { id: "whatsapp", label: `WhatsApp ${SITE_WHATSAPP_DISPLAY}` },
  { id: "help", label: "How listings work" },
];

function welcomeReply(draft: ListingDraft): ChatReply {
  return {
    messages: [
      "Hi! I'm your Submit Your Store assistant.",
      "I can help you list your business for free, find local businesses, or connect you with our team on WhatsApp.",
      "What would you like to do?",
    ],
    step: "welcome",
    draft,
    buttons: WELCOME_BUTTONS,
    inputType: "none",
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizePhone(value: string): string {
  return value.replace(/[^\d+]/g, "").trim();
}

export function processListingChat(input: ChatInput): ChatReply {
  const draft: ListingDraft = { ...(input.draft ?? {}) };
  const message = input.message?.trim() ?? "";
  const step = input.step;

  if (input.buttonId === "back") {
    return welcomeReply(draft);
  }

  if (input.buttonId === "list" || message.toLowerCase() === "list my business") {
    return {
      messages: [
        "Great — let's get your business listed for free.",
        "Paste your Google Business Profile link (Google Maps → Share → Copy link). I'll pull your name and address automatically.",
      ],
      step: "list_gbp",
      draft,
      inputType: "text",
      placeholder: "https://maps.google.com/...",
    };
  }

  if (input.buttonId === "search" || message.toLowerCase().includes("find")) {
    return {
      messages: [
        "Use the search bar at the top of any page — type a business name, city, or category.",
        "You'll see instant suggestions as you type. Pick one or press Enter to see all matches.",
        "Try searching from the homepage or go to /search.",
      ],
      step: "search_help",
      draft,
      buttons: [
        { id: "list", label: "List my business instead" },
        { id: "back", label: "Back to menu" },
      ],
      inputType: "none",
    };
  }

  if (input.buttonId === "whatsapp") {
    return {
      messages: [
        `Chat with us on WhatsApp at ${SITE_WHATSAPP_DISPLAY}.`,
        "We can help with listings, claims, and any questions about your profile.",
      ],
      step: "general_help",
      draft,
      buttons: [{ id: "back", label: "Back to menu" }],
      inputType: "none",
      whatsappLink: SITE_WHATSAPP_LINK,
    };
  }

  if (input.buttonId === "help" || message.toLowerCase().includes("how")) {
    return {
      messages: [
        "Listing is free for registered users:",
        "1. Sign in (or create a free account)",
        "2. Paste your Google Business Profile link",
        "3. Add phone, business email, and a short description (40+ characters)",
        "4. Your listing goes live immediately with an Unclaimed badge",
        "5. Verify your business email to claim and edit it",
        "Want me to walk you through it step by step?",
      ],
      step: "general_help",
      draft,
      buttons: [
        { id: "list", label: "Yes — list my business" },
        { id: "back", label: "Back to menu" },
      ],
      inputType: "none",
    };
  }

  if (step === "list_gbp") {
    if (input.gbpCheck?.ok && input.gbpCheck.resolvedGbpUrl) {
      draft.gbpUrl = input.gbpCheck.resolvedGbpUrl;
      draft.resolvedGbpUrl = input.gbpCheck.resolvedGbpUrl;
      const prefill = input.gbpCheck.prefill;
      if (prefill?.businessName) draft.businessName = prefill.businessName;
      if (prefill?.phone) draft.phone = prefill.phone;
      if (prefill?.city) draft.city = prefill.city;
      if (prefill?.state) draft.state = prefill.state;

      const nextStep: ChatStep = draft.businessName ? "list_email" : "list_name";
      const lines = [
        "Google profile linked successfully.",
        draft.businessName ? `Business: ${draft.businessName}` : "I couldn't auto-fetch the name — please type it next.",
      ];
      if (draft.city && draft.state) {
        lines.push(`Location: ${draft.city}, ${draft.state}`);
      }
      if (nextStep === "list_email") {
        lines.push("What's your business email? (Used for verification)");
      } else {
        lines.push("What's your business name?");
      }

      return {
        messages: lines,
        step: nextStep,
        draft,
        inputType: "text",
        placeholder: nextStep === "list_email" ? "you@company.com" : "Your Business Name",
      };
    }

    if (input.gbpCheck && !input.gbpCheck.ok) {
      return {
        messages: [
          input.gbpCheck.error ?? "That doesn't look like a valid Google Business Profile link.",
          "Open Google Maps → your business → Share → Copy link, then paste it here.",
        ],
        step: "list_gbp",
        draft,
        inputType: "text",
        placeholder: "https://maps.google.com/...",
      };
    }

    if (!message) {
      return {
        messages: ["Please paste your Google Business Profile link to continue."],
        step: "list_gbp",
        draft,
        inputType: "text",
        placeholder: "https://maps.google.com/...",
      };
    }

    draft.gbpUrl = message;
    return {
      messages: ["Checking your Google profile…"],
      step: "list_gbp",
      draft,
      inputType: "none",
    };
  }

  if (step === "list_name") {
    if (!message) {
      return {
        messages: ["Please enter your business name."],
        step: "list_name",
        draft,
        inputType: "text",
        placeholder: "Your Business Name",
      };
    }
    draft.businessName = message;
    return {
      messages: [`Got it — ${message}.`, "What's your business email? (We'll send a verification link)"],
      step: "list_email",
      draft,
      inputType: "text",
      placeholder: "you@company.com",
    };
  }

  if (step === "list_email") {
    if (!isValidEmail(message)) {
      return {
        messages: ["Please enter a valid business email (e.g. you@company.com)."],
        step: "list_email",
        draft,
        inputType: "text",
        placeholder: "you@company.com",
      };
    }
    draft.businessEmail = message.trim();
    return {
      messages: ["What's the best phone number for customers to reach you?"],
      step: "list_phone",
      draft,
      inputType: "text",
      placeholder: "(555) 123-4567",
    };
  }

  if (step === "list_phone") {
    const phone = normalizePhone(message);
    if (phone.length < 10) {
      return {
        messages: ["Please enter a valid phone number with at least 10 digits."],
        step: "list_phone",
        draft,
        inputType: "text",
        placeholder: "(555) 123-4567",
      };
    }
    draft.phone = message.trim();
    if (draft.city && draft.state) {
      return {
        messages: [
          `Using location: ${draft.city}, ${draft.state}.`,
          "Now write a short description of your business (at least 40 characters). Mention services, areas served, and what makes you stand out.",
        ],
        step: "list_description",
        draft,
        inputType: "text",
        placeholder: "We provide…",
      };
    }
    return {
      messages: ["Which city is your business in? (e.g. Dallas, TX)"],
      step: "list_city",
      draft,
      inputType: "text",
      placeholder: "Dallas, TX",
    };
  }

  if (step === "list_city") {
    if (!message) {
      return {
        messages: ["Please enter your city and state (e.g. Dallas, TX)."],
        step: "list_city",
        draft,
        inputType: "text",
        placeholder: "Dallas, TX",
      };
    }
    const parts = message.split(",").map((p) => p.trim());
    draft.city = parts[0] ?? message;
    draft.state = parts[1]?.toUpperCase() ?? "TX";
    return {
      messages: [
        `Location: ${draft.city}, ${draft.state}.`,
        "Write a short description of your business (at least 40 characters).",
      ],
      step: "list_description",
      draft,
      inputType: "text",
      placeholder: "We provide…",
    };
  }

  if (step === "list_description") {
    if (message.length < 40) {
      return {
        messages: [
          `Description is ${message.length} characters — please write at least 40.`,
          "Mention your services, service area, and what customers can expect.",
        ],
        step: "list_description",
        draft,
        inputType: "text",
        placeholder: "We provide…",
      };
    }
    draft.description = message;
    return {
      messages: [
        "You're all set! I've saved your details.",
        "Click below to open the listing form — your info will be pre-filled. Sign in (free) and submit to go live.",
        `Need help? WhatsApp us at ${SITE_WHATSAPP_DISPLAY}.`,
      ],
      step: "list_complete",
      draft,
      buttons: [
        { id: "continue", label: "Continue to listing form" },
        { id: "whatsapp", label: "Chat on WhatsApp" },
        { id: "back", label: "Start over" },
      ],
      inputType: "none",
      continueHref: "/list-your-business",
      whatsappLink: SITE_WHATSAPP_LINK,
    };
  }

  if (step === "list_complete" && input.buttonId === "continue") {
    return {
      messages: ["Opening the listing form with your details…"],
      step: "list_complete",
      draft,
      inputType: "none",
      continueHref: "/list-your-business",
    };
  }

  if (message) {
    const lower = message.toLowerCase();
    if (lower.includes("list") || lower.includes("add") || lower.includes("submit")) {
      return processListingChat({ step: "welcome", buttonId: "list", draft });
    }
    if (lower.includes("search") || lower.includes("find")) {
      return processListingChat({ step: "welcome", buttonId: "search", draft });
    }
    if (lower.includes("whatsapp") || lower.includes("help")) {
      return processListingChat({
        step: "welcome",
        buttonId: lower.includes("whatsapp") ? "whatsapp" : "help",
        draft,
      });
    }
  }

  if (step === "welcome" && !message && !input.buttonId) {
    return welcomeReply(draft);
  }

  return welcomeReply(draft);
}

export const LISTING_CHATBOT_DRAFT_KEY = "listing-chatbot-draft";
