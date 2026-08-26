/**
 * ZAZ AI chatbot knowledge base — general questions not already covered by
 * the structured pricing/service data (lib/data/pricing.ts, servicePillars.ts,
 * logoPortfolio.ts, websitePortfolio.ts). Every answer here is sourced only
 * from what's already published/approved elsewhere in this project — never
 * invented. If a real answer isn't available, the chatbot is instructed
 * (see lib/chat/systemPrompt.ts) to say so honestly rather than use this
 * file's absence as license to guess.
 */

export type ChatbotFaq = {
  question: string;
  answer: string;
};

export const chatbotFaqs: ChatbotFaq[] = [
  {
    question: "What services does ZAZ Digital Solutions offer?",
    answer:
      "ZAZ Digital Solutions offers three core services: Logo Design, Website Design, and Digital Marketing (SEO, Google Ads, Social Media Marketing, and Meta Ads).",
  },
  {
    question: "What types of logos do you design?",
    answer:
      "Seven logo styles: Wordmark, Lettermark, Pictorial Mark, Abstract Mark, Combination Mark, Mascot Logo, and Emblem.",
  },
  {
    question: "What kind of websites do you build?",
    answer:
      "Both WordPress and fully custom-coded websites, across seven site types: E-commerce, Business, Portfolio, Educational, Landing Page, Personal, and Directory & Listing — each with page-based packages that scale as needs grow.",
  },
  {
    question: "What digital marketing services do you offer?",
    answer: "SEO, Google Ads (PPC), Social Media Marketing, and Meta Ads, each with Starter, Growth, and Pro tiers.",
  },
  {
    question: "How do I get a quote?",
    answer:
      "Exact package pricing is available on the Pricing and Services pages. For a project-specific quote or anything outside the listed packages, the best next step is to talk to the ZAZ team directly.",
  },
  {
    question: "Where is ZAZ Digital Solutions located?",
    answer: "Houston, TX.",
  },
  {
    question: "How can I contact ZAZ Digital Solutions directly?",
    answer:
      "Via the contact form on the website, by email, or by phone — the current details are shown in the site footer and on the Contact page.",
  },
];
