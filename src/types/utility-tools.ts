export type UtilityToolCategory =
  | "seo-meta"
  | "schema-markup"
  | "text-content"
  | "business-tools"
  | "link-generators"
  | "image-tools"
  | "dev-utilities"
  | "calculators";

export type UtilityToolType =
  | "text-transform"
  | "generator"
  | "calculator"
  | "image-processor"
  | "counter"
  | "converter";

export type UtilityToolField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "url" | "email" | "color";
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string }[];
  required?: boolean;
  rows?: number;
};

export type UtilityToolDefinition = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: UtilityToolCategory;
  toolType: UtilityToolType;
  keywords: string[];
  fields?: UtilityToolField[];
  outputLabel?: string;
  outputFormat?: "text" | "html" | "json" | "code";
  seoTitle?: string;
  seoDescription?: string;
};
