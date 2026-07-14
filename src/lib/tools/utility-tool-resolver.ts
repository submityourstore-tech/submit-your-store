/**
 * Maps each utility tool slug to its implementation (fields + logic function).
 * Lazy-loaded at page level — only the needed tool is imported.
 */

/* ---------- SEO Meta ---------- */
import {
  metaTitleGenerator,
  metaDescriptionGenerator,
  metaTagGenerator,
  robotsTxtGenerator,
  xmlSitemapGenerator,
  canonicalTagGenerator,
  openGraphGenerator,
  twitterCardGenerator,
  hreflangTagGenerator,
} from "@/lib/tools/implementations/seo-meta";

/* ---------- Schema Generators ---------- */
import {
  localBusinessSchemaGenerator,
  organizationSchemaGenerator,
  websiteSchemaGenerator,
  personSchemaGenerator,
  articleSchemaGenerator,
  faqSchemaGenerator,
  breadcrumbSchemaGenerator,
  productSchemaGenerator,
  reviewSchemaGenerator,
  eventSchemaGenerator,
  recipeSchemaGenerator,
  videoSchemaGenerator,
  jobPostingSchemaGenerator,
  howtoSchemaGenerator,
  serviceSchemaGenerator,
} from "@/lib/tools/implementations/schema-generators";

/* ---------- Text Tools ---------- */
import {
  wordCounter,
  characterCounter,
  keywordDensityChecker,
  readingTimeCalculator,
  readabilityChecker,
  lineCounter,
  sentenceCounter,
  paragraphCounter,
  urlSlugGenerator,
  removeDuplicateLines,
  removeExtraSpaces,
  textSorter,
  textReverser,
  caseConverter,
  serpSnippetPreview,
  randomTextGenerator,
  loremIpsumGenerator,
} from "@/lib/tools/implementations/text-tools";

/* ---------- Dev Utilities ---------- */
import {
  htmlMinifier,
  cssMinifier,
  javascriptMinifier,
  jsonFormatter,
  md5Generator,
  sha256Generator,
  base64Encode,
  base64Decode,
  hashtagGenerator,
  timestampConverter,
  unixTimeConverter,
  hexToRgb,
  rgbToHex,
  passwordGenerator,
  uuidGenerator,
  cssGradientGenerator,
  qrCodeGenerator,
  barcodeGenerator,
  emojiPicker,
} from "@/lib/tools/implementations/dev-utilities";

/* ---------- Business Tools ---------- */
import {
  businessNameGenerator,
  businessSloganGenerator,
  companyDescriptionGenerator,
  businessBioGenerator,
  invoiceGenerator,
  quoteGenerator,
  receiptGenerator,
  privacyPolicyGenerator,
  termsConditionsGenerator,
  disclaimerGenerator,
  refundPolicyGenerator,
  shippingPolicyGenerator,
  returnPolicyGenerator,
  cookiePolicyGenerator,
  businessHoursGenerator,
  emailSignatureGenerator,
} from "@/lib/tools/implementations/business-tools";

/* ---------- Link Generators ---------- */
import {
  googleReviewQrGenerator,
  googleMapsEmbedGenerator,
  utmUrlBuilder,
  whatsappLinkGenerator,
  clickToCallGenerator,
  mailtoLinkGenerator,
  napFormatter,
  googleMapsDirectionGenerator,
  reviewLinkGenerator,
  businessCardQrGenerator,
} from "@/lib/tools/implementations/link-generators";

/* ---------- Image Tools ---------- */
import {
  imageCompressor,
  imageResizer,
  imageCropper,
  jpgToWebp,
  pngToWebp,
  webpToPng,
  webpToJpg,
  jpgToPng,
  pngToJpg,
  imageRotator,
  imageFlip,
} from "@/lib/tools/implementations/image-tools";

/* ---------- Calculators ---------- */
import {
  percentageCalculator,
  gstCalculator,
  profitMarginCalculator,
  discountCalculator,
} from "@/lib/tools/implementations/calculators";

export type ToolImplKind = "generator" | "counter" | "text-transform" | "calculator" | "image-processor";

export type ToolImpl =
  | { kind: "generator"; fields: unknown[]; generate: (v: Record<string, string>) => string; outputFormat?: string }
  | { kind: "counter"; analyzeFn: (text: string) => { label: string; value: string | number }[] }
  | { kind: "text-transform"; transformFn: (input: string, options?: Record<string, string>) => string; options?: unknown[] }
  | { kind: "calculator"; fields: unknown[]; calculate: (v: Record<string, string>) => { label: string; value: string }[] }
  | { kind: "image-processor"; processFn: (file: File, options: Record<string, string>) => Promise<Blob>; outputFormat: string; fields?: unknown[] };

function gen(impl: { fields: unknown[]; generate: (v: Record<string, string>) => string }, outputFormat = "code"): ToolImpl {
  return { kind: "generator", fields: impl.fields, generate: impl.generate, outputFormat };
}

function counter(impl: { analyzeFn: (t: string) => { label: string; value: string | number }[] }): ToolImpl {
  return { kind: "counter", analyzeFn: impl.analyzeFn };
}

function textTransform(impl: { transformFn: (i: string, o?: Record<string, string>) => string; options?: unknown[] }): ToolImpl {
  return { kind: "text-transform", transformFn: impl.transformFn, options: impl.options };
}

function calc(impl: { fields: unknown[]; calculate: (v: Record<string, string>) => { label: string; value: string }[] }): ToolImpl {
  return { kind: "calculator", fields: impl.fields, calculate: impl.calculate };
}

function img(impl: { processFn: (f: File, o: Record<string, string>) => Promise<Blob>; outputFormat: string; fields?: unknown[] }): ToolImpl {
  return { kind: "image-processor", processFn: impl.processFn, outputFormat: impl.outputFormat, fields: impl.fields };
}

const TOOL_MAP: Record<string, ToolImpl> = {
  // SEO Meta
  "meta-title-generator": gen(metaTitleGenerator),
  "meta-description-generator": gen(metaDescriptionGenerator),
  "meta-tag-generator": gen(metaTagGenerator),
  "robots-txt-generator": gen(robotsTxtGenerator, "text"),
  "xml-sitemap-generator": gen(xmlSitemapGenerator, "code"),
  "canonical-tag-generator": gen(canonicalTagGenerator),
  "open-graph-generator": gen(openGraphGenerator),
  "twitter-card-generator": gen(twitterCardGenerator),
  "hreflang-tag-generator": gen(hreflangTagGenerator),

  // Schema
  "local-business-schema-generator": gen(localBusinessSchemaGenerator),
  "organization-schema-generator": gen(organizationSchemaGenerator),
  "website-schema-generator": gen(websiteSchemaGenerator),
  "person-schema-generator": gen(personSchemaGenerator),
  "article-schema-generator": gen(articleSchemaGenerator),
  "faq-schema-generator": gen(faqSchemaGenerator),
  "breadcrumb-schema-generator": gen(breadcrumbSchemaGenerator),
  "product-schema-generator": gen(productSchemaGenerator),
  "review-schema-generator": gen(reviewSchemaGenerator),
  "event-schema-generator": gen(eventSchemaGenerator),
  "recipe-schema-generator": gen(recipeSchemaGenerator),
  "video-schema-generator": gen(videoSchemaGenerator),
  "job-posting-schema-generator": gen(jobPostingSchemaGenerator),
  "howto-schema-generator": gen(howtoSchemaGenerator),
  "service-schema-generator": gen(serviceSchemaGenerator),

  // Text counters
  "word-counter": counter(wordCounter),
  "character-counter": counter(characterCounter),
  "keyword-density-checker": counter(keywordDensityChecker),
  "reading-time-calculator": counter(readingTimeCalculator),
  "readability-checker": counter(readabilityChecker),
  "line-counter": counter(lineCounter),
  "sentence-counter": counter(sentenceCounter),
  "paragraph-counter": counter(paragraphCounter),

  // Text transforms
  "url-slug-generator": textTransform(urlSlugGenerator),
  "remove-duplicate-lines": textTransform(removeDuplicateLines),
  "remove-extra-spaces": textTransform(removeExtraSpaces),
  "text-sorter": textTransform(textSorter),
  "text-reverser": textTransform(textReverser),
  "case-converter": textTransform(caseConverter),

  // Dev text transforms
  "html-minifier": textTransform(htmlMinifier),
  "css-minifier": textTransform(cssMinifier),
  "javascript-minifier": textTransform(javascriptMinifier),
  "json-formatter": textTransform(jsonFormatter),
  "md5-generator": textTransform(md5Generator),
  "sha256-generator": textTransform(sha256Generator),
  "base64-encode": textTransform(base64Encode),
  "base64-decode": textTransform(base64Decode),
  "hashtag-generator": textTransform(hashtagGenerator),

  // Dev converters (analyzeFn-based)
  "timestamp-converter": counter(timestampConverter),
  "unix-time-converter": counter(unixTimeConverter),
  "hex-to-rgb": counter(hexToRgb),
  "rgb-to-hex": counter(rgbToHex),

  // Text generators
  "serp-snippet-preview": gen(serpSnippetPreview, "html"),
  "random-text-generator": gen(randomTextGenerator, "text"),
  "lorem-ipsum-generator": gen(loremIpsumGenerator, "text"),

  // Dev generators
  "password-generator": textTransform(passwordGenerator),
  "uuid-generator": textTransform(uuidGenerator),
  "css-gradient-generator": textTransform(cssGradientGenerator),
  "qr-code-generator": gen(qrCodeGenerator, "html"),
  "barcode-generator": gen(barcodeGenerator, "html"),
  "emoji-picker": textTransform(emojiPicker),

  // Business generators
  "business-name-generator": gen(businessNameGenerator, "text"),
  "business-slogan-generator": gen(businessSloganGenerator, "text"),
  "company-description-generator": gen(companyDescriptionGenerator, "text"),
  "business-bio-generator": gen(businessBioGenerator, "text"),
  "invoice-generator": gen(invoiceGenerator, "html"),
  "quote-generator": gen(quoteGenerator, "html"),
  "receipt-generator": gen(receiptGenerator, "html"),
  "privacy-policy-generator": gen(privacyPolicyGenerator, "text"),
  "terms-conditions-generator": gen(termsConditionsGenerator, "text"),
  "disclaimer-generator": gen(disclaimerGenerator, "text"),
  "refund-policy-generator": gen(refundPolicyGenerator, "text"),
  "shipping-policy-generator": gen(shippingPolicyGenerator, "text"),
  "return-policy-generator": gen(returnPolicyGenerator, "text"),
  "cookie-policy-generator": gen(cookiePolicyGenerator, "text"),
  "business-hours-generator": gen(businessHoursGenerator, "text"),
  "email-signature-generator": gen(emailSignatureGenerator, "html"),

  // Link generators
  "google-review-qr-generator": gen(googleReviewQrGenerator, "text"),
  "google-maps-embed-generator": gen(googleMapsEmbedGenerator, "code"),
  "utm-url-builder": gen(utmUrlBuilder, "text"),
  "whatsapp-link-generator": gen(whatsappLinkGenerator, "code"),
  "click-to-call-generator": gen(clickToCallGenerator, "code"),
  "mailto-link-generator": gen(mailtoLinkGenerator, "code"),
  "nap-formatter": gen(napFormatter, "text"),
  "google-maps-direction-generator": gen(googleMapsDirectionGenerator, "text"),
  "review-link-generator": gen(reviewLinkGenerator, "text"),
  "business-card-qr-generator": gen(businessCardQrGenerator, "text"),

  // Image tools
  "image-compressor": img(imageCompressor),
  "image-resizer": img(imageResizer),
  "image-cropper": img(imageCropper),
  "jpg-to-webp": img(jpgToWebp),
  "png-to-webp": img(pngToWebp),
  "webp-to-png": img(webpToPng),
  "webp-to-jpg": img(webpToJpg),
  "jpg-to-png": img(jpgToPng),
  "png-to-jpg": img(pngToJpg),
  "image-rotator": img(imageRotator),
  "image-flip": img(imageFlip),

  // Calculators
  "percentage-calculator": calc(percentageCalculator),
  "gst-calculator": calc(gstCalculator),
  "profit-margin-calculator": calc(profitMarginCalculator),
  "discount-calculator": calc(discountCalculator),
};

export function resolveToolImpl(slug: string): ToolImpl | undefined {
  return TOOL_MAP[slug];
}
