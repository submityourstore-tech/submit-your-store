import type { UtilityToolField } from "@/types/utility-tools";

type GeneratorToolConfig = {
  fields: UtilityToolField[];
  generate: (values: Record<string, string>) => string;
};

// ---------------------------------------------------------------------------
// 1. Local Business Schema Generator
// ---------------------------------------------------------------------------

export const localBusinessSchemaGenerator: GeneratorToolConfig = {
  fields: [
    { key: "businessName", label: "Business Name", type: "text", placeholder: "e.g. Joe's Pizza", required: true },
    { key: "description", label: "Description", type: "textarea", placeholder: "Brief business description", rows: 3 },
    { key: "phone", label: "Phone", type: "text", placeholder: "+1-555-123-4567" },
    { key: "email", label: "Email", type: "email", placeholder: "info@example.com" },
    { key: "streetAddress", label: "Street Address", type: "text", placeholder: "123 Main St" },
    { key: "city", label: "City", type: "text", placeholder: "New York" },
    { key: "state", label: "State / Region", type: "text", placeholder: "NY" },
    { key: "postalCode", label: "Postal / ZIP Code", type: "text", placeholder: "10001" },
    { key: "country", label: "Country", type: "text", placeholder: "US" },
    { key: "latitude", label: "Latitude", type: "text", placeholder: "40.7128" },
    { key: "longitude", label: "Longitude", type: "text", placeholder: "-74.0060" },
    {
      key: "openingHours",
      label: "Opening Hours (one per line)",
      type: "textarea",
      placeholder: "Mo-Fr 09:00-17:00\nSa 10:00-14:00",
      rows: 4,
    },
    {
      key: "businessType",
      label: "Business Type",
      type: "select",
      defaultValue: "LocalBusiness",
      options: [
        { value: "LocalBusiness", label: "Local Business" },
        { value: "Restaurant", label: "Restaurant" },
        { value: "Store", label: "Store" },
        { value: "MedicalBusiness", label: "Medical Business" },
        { value: "LegalService", label: "Legal Service" },
        { value: "FinancialService", label: "Financial Service" },
        { value: "AutomotiveBusiness", label: "Automotive Business" },
        { value: "HomeAndConstructionBusiness", label: "Home & Construction" },
        { value: "SportsActivityLocation", label: "Sports Activity Location" },
        { value: "EntertainmentBusiness", label: "Entertainment Business" },
      ],
    },
    { key: "imageUrl", label: "Image URL", type: "url", placeholder: "https://example.com/photo.jpg" },
    { key: "priceRange", label: "Price Range", type: "text", placeholder: "e.g. $$" },
  ],
  generate(values) {
    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": values.businessType || "LocalBusiness",
      name: values.businessName,
    };

    if (values.description) schema.description = values.description;
    if (values.phone) schema.telephone = values.phone;
    if (values.email) schema.email = values.email;
    if (values.imageUrl) schema.image = values.imageUrl;
    if (values.priceRange) schema.priceRange = values.priceRange;

    if (values.streetAddress || values.city) {
      schema.address = {
        "@type": "PostalAddress",
        ...(values.streetAddress && { streetAddress: values.streetAddress }),
        ...(values.city && { addressLocality: values.city }),
        ...(values.state && { addressRegion: values.state }),
        ...(values.postalCode && { postalCode: values.postalCode }),
        ...(values.country && { addressCountry: values.country }),
      };
    }

    if (values.latitude && values.longitude) {
      schema.geo = {
        "@type": "GeoCoordinates",
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
      };
    }

    const hours = parseLines(values.openingHours);
    if (hours.length) schema.openingHours = hours;

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 2. Organization Schema Generator
// ---------------------------------------------------------------------------

export const organizationSchemaGenerator: GeneratorToolConfig = {
  fields: [
    { key: "name", label: "Organization Name", type: "text", placeholder: "e.g. Acme Corp", required: true },
    { key: "url", label: "Website URL", type: "url", placeholder: "https://example.com", required: true },
    { key: "logoUrl", label: "Logo URL", type: "url", placeholder: "https://example.com/logo.png" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Organization description", rows: 3 },
    { key: "email", label: "Contact Email", type: "email", placeholder: "contact@example.com" },
    { key: "phone", label: "Phone", type: "text", placeholder: "+1-555-123-4567" },
    { key: "streetAddress", label: "Street Address", type: "text", placeholder: "123 Main St" },
    { key: "city", label: "City", type: "text", placeholder: "New York" },
    { key: "state", label: "State / Region", type: "text", placeholder: "NY" },
    { key: "postalCode", label: "Postal / ZIP Code", type: "text", placeholder: "10001" },
    { key: "country", label: "Country", type: "text", placeholder: "US" },
    {
      key: "socialLinks",
      label: "Social Profile URLs (one per line)",
      type: "textarea",
      placeholder: "https://twitter.com/example\nhttps://facebook.com/example\nhttps://linkedin.com/company/example",
      rows: 4,
    },
  ],
  generate(values) {
    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: values.name,
      url: values.url,
    };

    if (values.logoUrl) schema.logo = values.logoUrl;
    if (values.description) schema.description = values.description;
    if (values.email) schema.email = values.email;
    if (values.phone) schema.telephone = values.phone;

    if (values.streetAddress || values.city) {
      schema.address = {
        "@type": "PostalAddress",
        ...(values.streetAddress && { streetAddress: values.streetAddress }),
        ...(values.city && { addressLocality: values.city }),
        ...(values.state && { addressRegion: values.state }),
        ...(values.postalCode && { postalCode: values.postalCode }),
        ...(values.country && { addressCountry: values.country }),
      };
    }

    const socials = parseLines(values.socialLinks);
    if (socials.length) schema.sameAs = socials;

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 3. Website Schema Generator
// ---------------------------------------------------------------------------

export const websiteSchemaGenerator: GeneratorToolConfig = {
  fields: [
    { key: "name", label: "Website Name", type: "text", placeholder: "e.g. My Blog", required: true },
    { key: "url", label: "Website URL", type: "url", placeholder: "https://example.com", required: true },
    { key: "description", label: "Description", type: "textarea", placeholder: "Website description", rows: 3 },
    {
      key: "searchUrlTemplate",
      label: "Search URL Template",
      type: "text",
      placeholder: "https://example.com/search?q={search_term_string}",
    },
  ],
  generate(values) {
    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: values.name,
      url: values.url,
    };

    if (values.description) schema.description = values.description;

    if (values.searchUrlTemplate) {
      schema.potentialAction = {
        "@type": "SearchAction",
        target: values.searchUrlTemplate,
        "query-input": "required name=search_term_string",
      };
    }

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 4. Person Schema Generator
// ---------------------------------------------------------------------------

export const personSchemaGenerator: GeneratorToolConfig = {
  fields: [
    { key: "name", label: "Full Name", type: "text", placeholder: "e.g. Jane Doe", required: true },
    { key: "jobTitle", label: "Job Title", type: "text", placeholder: "e.g. Software Engineer" },
    { key: "url", label: "Personal URL", type: "url", placeholder: "https://janedoe.com" },
    { key: "image", label: "Image URL", type: "url", placeholder: "https://janedoe.com/photo.jpg" },
    { key: "email", label: "Email", type: "email", placeholder: "jane@example.com" },
    {
      key: "socialProfiles",
      label: "Social Profile URLs (one per line)",
      type: "textarea",
      placeholder: "https://twitter.com/janedoe\nhttps://linkedin.com/in/janedoe",
      rows: 4,
    },
  ],
  generate(values) {
    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: values.name,
    };

    if (values.jobTitle) schema.jobTitle = values.jobTitle;
    if (values.url) schema.url = values.url;
    if (values.image) schema.image = values.image;
    if (values.email) schema.email = values.email;

    const profiles = parseLines(values.socialProfiles);
    if (profiles.length) schema.sameAs = profiles;

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 5. Article Schema Generator
// ---------------------------------------------------------------------------

export const articleSchemaGenerator: GeneratorToolConfig = {
  fields: [
    { key: "headline", label: "Headline", type: "text", placeholder: "Article headline", required: true },
    { key: "authorName", label: "Author Name", type: "text", placeholder: "e.g. John Doe", required: true },
    { key: "publishedDate", label: "Published Date", type: "text", placeholder: "YYYY-MM-DD", required: true },
    { key: "modifiedDate", label: "Last Modified Date", type: "text", placeholder: "YYYY-MM-DD" },
    { key: "imageUrl", label: "Image URL", type: "url", placeholder: "https://example.com/article-image.jpg" },
    { key: "publisherName", label: "Publisher Name", type: "text", placeholder: "e.g. My Blog" },
    { key: "publisherLogo", label: "Publisher Logo URL", type: "url", placeholder: "https://example.com/logo.png" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Article summary", rows: 3 },
  ],
  generate(values) {
    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: values.headline,
      author: {
        "@type": "Person",
        name: values.authorName,
      },
      datePublished: values.publishedDate,
    };

    if (values.modifiedDate) schema.dateModified = values.modifiedDate;
    if (values.imageUrl) schema.image = values.imageUrl;
    if (values.description) schema.description = values.description;

    if (values.publisherName) {
      schema.publisher = {
        "@type": "Organization",
        name: values.publisherName,
        ...(values.publisherLogo && {
          logo: { "@type": "ImageObject", url: values.publisherLogo },
        }),
      };
    }

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 6. FAQ Schema Generator
// ---------------------------------------------------------------------------

export const faqSchemaGenerator: GeneratorToolConfig = {
  fields: [
    {
      key: "qaPairs",
      label: "Q&A Pairs",
      type: "textarea",
      placeholder: "Q: What is SEO?\nA: SEO stands for Search Engine Optimization.\n\nQ: Why is SEO important?\nA: SEO helps your website rank higher in search results.",
      required: true,
      rows: 12,
    },
  ],
  generate(values) {
    const pairs = parseFaqPairs(values.qaPairs);

    if (!pairs.length) {
      return "<!-- Please provide Q&A pairs in the format:\nQ: question\nA: answer\n(separated by blank lines) -->";
    }

    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: pairs.map((p) => ({
        "@type": "Question",
        name: p.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: p.answer,
        },
      })),
    };

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 7. Breadcrumb Schema Generator
// ---------------------------------------------------------------------------

export const breadcrumbSchemaGenerator: GeneratorToolConfig = {
  fields: [
    {
      key: "items",
      label: "Breadcrumb Items (label|url, one per line)",
      type: "textarea",
      placeholder: "Home|https://example.com\nBlog|https://example.com/blog\nMy Post|https://example.com/blog/my-post",
      required: true,
      rows: 6,
    },
  ],
  generate(values) {
    const lines = parseLines(values.items);

    if (!lines.length) return '<!-- Please provide breadcrumb items in "label|url" format -->';

    const items: { name: string; item: string }[] = [];

    for (const line of lines) {
      const sepIndex = line.indexOf("|");
      if (sepIndex === -1) continue;
      const name = line.slice(0, sepIndex).trim();
      const item = line.slice(sepIndex + 1).trim();
      if (name && item) items.push({ name, item });
    }

    if (!items.length) return '<!-- No valid breadcrumb items found. Use "label|url" format. -->';

    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((entry, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: entry.name,
        item: entry.item,
      })),
    };

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 8. Product Schema Generator
// ---------------------------------------------------------------------------

export const productSchemaGenerator: GeneratorToolConfig = {
  fields: [
    { key: "name", label: "Product Name", type: "text", placeholder: "e.g. Premium Wireless Headphones", required: true },
    { key: "description", label: "Description", type: "textarea", placeholder: "Product description", rows: 3, required: true },
    { key: "image", label: "Image URL", type: "url", placeholder: "https://example.com/product.jpg" },
    { key: "brand", label: "Brand", type: "text", placeholder: "e.g. BrandName" },
    { key: "sku", label: "SKU", type: "text", placeholder: "e.g. SKU-12345" },
    { key: "price", label: "Price", type: "text", placeholder: "e.g. 49.99", required: true },
    { key: "currency", label: "Currency", type: "text", defaultValue: "USD", placeholder: "USD" },
    {
      key: "availability",
      label: "Availability",
      type: "select",
      defaultValue: "https://schema.org/InStock",
      options: [
        { value: "https://schema.org/InStock", label: "In Stock" },
        { value: "https://schema.org/OutOfStock", label: "Out of Stock" },
        { value: "https://schema.org/PreOrder", label: "Pre-Order" },
        { value: "https://schema.org/BackOrder", label: "Back Order" },
      ],
    },
    { key: "ratingValue", label: "Review Rating (1–5)", type: "text", placeholder: "e.g. 4.5" },
    { key: "reviewCount", label: "Review Count", type: "text", placeholder: "e.g. 120" },
  ],
  generate(values) {
    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: values.name,
      description: values.description,
    };

    if (values.image) schema.image = values.image;
    if (values.brand) schema.brand = { "@type": "Brand", name: values.brand };
    if (values.sku) schema.sku = values.sku;

    schema.offers = {
      "@type": "Offer",
      price: values.price,
      priceCurrency: values.currency || "USD",
      availability: values.availability || "https://schema.org/InStock",
    };

    if (values.ratingValue && values.reviewCount) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: Number(values.ratingValue),
        reviewCount: Number(values.reviewCount),
      };
    }

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 9. Review Schema Generator
// ---------------------------------------------------------------------------

export const reviewSchemaGenerator: GeneratorToolConfig = {
  fields: [
    { key: "itemName", label: "Item Name", type: "text", placeholder: "e.g. iPhone 15 Pro", required: true },
    {
      key: "itemType",
      label: "Item Type",
      type: "select",
      defaultValue: "Product",
      options: [
        { value: "Product", label: "Product" },
        { value: "LocalBusiness", label: "Local Business" },
        { value: "Organization", label: "Organization" },
        { value: "Movie", label: "Movie" },
        { value: "Book", label: "Book" },
        { value: "Restaurant", label: "Restaurant" },
        { value: "SoftwareApplication", label: "Software Application" },
      ],
    },
    { key: "authorName", label: "Author Name", type: "text", placeholder: "e.g. Jane Smith", required: true },
    {
      key: "rating",
      label: "Rating (1–5)",
      type: "select",
      defaultValue: "5",
      options: [
        { value: "1", label: "1 — Poor" },
        { value: "2", label: "2 — Fair" },
        { value: "3", label: "3 — Average" },
        { value: "4", label: "4 — Good" },
        { value: "5", label: "5 — Excellent" },
      ],
    },
    { key: "reviewBody", label: "Review Text", type: "textarea", placeholder: "Write your review…", rows: 4, required: true },
    { key: "datePublished", label: "Date", type: "text", placeholder: "YYYY-MM-DD", required: true },
  ],
  generate(values) {
    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "Review",
      itemReviewed: {
        "@type": values.itemType || "Product",
        name: values.itemName,
      },
      author: {
        "@type": "Person",
        name: values.authorName,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: Number(values.rating || 5),
        bestRating: 5,
      },
      reviewBody: values.reviewBody,
      datePublished: values.datePublished,
    };

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 10. Event Schema Generator
// ---------------------------------------------------------------------------

export const eventSchemaGenerator: GeneratorToolConfig = {
  fields: [
    { key: "name", label: "Event Name", type: "text", placeholder: "e.g. Tech Conference 2025", required: true },
    { key: "startDate", label: "Start Date & Time", type: "text", placeholder: "YYYY-MM-DDTHH:mm", required: true },
    { key: "endDate", label: "End Date & Time", type: "text", placeholder: "YYYY-MM-DDTHH:mm" },
    { key: "locationName", label: "Venue Name", type: "text", placeholder: "e.g. Convention Center" },
    { key: "locationAddress", label: "Venue Address", type: "text", placeholder: "e.g. 123 Main St, New York, NY" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Event description", rows: 3 },
    { key: "image", label: "Image URL", type: "url", placeholder: "https://example.com/event.jpg" },
    { key: "performer", label: "Performer / Speaker", type: "text", placeholder: "e.g. John Doe" },
    { key: "offerPrice", label: "Ticket Price", type: "text", placeholder: "e.g. 50.00" },
    { key: "offerCurrency", label: "Ticket Currency", type: "text", defaultValue: "USD", placeholder: "USD" },
    { key: "offerUrl", label: "Ticket URL", type: "url", placeholder: "https://example.com/tickets" },
  ],
  generate(values) {
    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: values.name,
      startDate: values.startDate,
    };

    if (values.endDate) schema.endDate = values.endDate;
    if (values.description) schema.description = values.description;
    if (values.image) schema.image = values.image;

    if (values.locationName || values.locationAddress) {
      schema.location = {
        "@type": "Place",
        ...(values.locationName && { name: values.locationName }),
        ...(values.locationAddress && {
          address: {
            "@type": "PostalAddress",
            streetAddress: values.locationAddress,
          },
        }),
      };
    }

    if (values.performer) {
      schema.performer = {
        "@type": "Person",
        name: values.performer,
      };
    }

    if (values.offerPrice) {
      schema.offers = {
        "@type": "Offer",
        price: values.offerPrice,
        priceCurrency: values.offerCurrency || "USD",
        ...(values.offerUrl && { url: values.offerUrl }),
        availability: "https://schema.org/InStock",
      };
    }

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 11. Recipe Schema Generator
// ---------------------------------------------------------------------------

export const recipeSchemaGenerator: GeneratorToolConfig = {
  fields: [
    { key: "name", label: "Recipe Name", type: "text", placeholder: "e.g. Classic Chocolate Chip Cookies", required: true },
    { key: "description", label: "Description", type: "textarea", placeholder: "Short recipe description", rows: 2, required: true },
    { key: "image", label: "Image URL", type: "url", placeholder: "https://example.com/cookies.jpg" },
    { key: "author", label: "Author", type: "text", placeholder: "e.g. Chef Maria" },
    { key: "prepTime", label: "Prep Time (ISO 8601)", type: "text", placeholder: "PT15M" },
    { key: "cookTime", label: "Cook Time (ISO 8601)", type: "text", placeholder: "PT25M" },
    { key: "totalTime", label: "Total Time (ISO 8601)", type: "text", placeholder: "PT40M" },
    { key: "servings", label: "Servings", type: "text", placeholder: "e.g. 24" },
    {
      key: "ingredients",
      label: "Ingredients (one per line)",
      type: "textarea",
      placeholder: "2 cups all-purpose flour\n1 cup butter\n1 cup sugar",
      rows: 6,
    },
    {
      key: "instructions",
      label: "Instructions (one step per line)",
      type: "textarea",
      placeholder: "Preheat oven to 375°F.\nMix dry ingredients.\nCombine wet ingredients.",
      rows: 6,
    },
    { key: "calories", label: "Calories", type: "text", placeholder: "e.g. 210" },
  ],
  generate(values) {
    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "Recipe",
      name: values.name,
      description: values.description,
    };

    if (values.image) schema.image = values.image;
    if (values.author) schema.author = { "@type": "Person", name: values.author };
    if (values.prepTime) schema.prepTime = values.prepTime;
    if (values.cookTime) schema.cookTime = values.cookTime;
    if (values.totalTime) schema.totalTime = values.totalTime;
    if (values.servings) schema.recipeYield = values.servings;

    const ingredients = parseLines(values.ingredients);
    if (ingredients.length) schema.recipeIngredient = ingredients;

    const steps = parseLines(values.instructions);
    if (steps.length) {
      schema.recipeInstructions = steps.map((text) => ({
        "@type": "HowToStep",
        text,
      }));
    }

    if (values.calories) {
      schema.nutrition = {
        "@type": "NutritionInformation",
        calories: `${values.calories} calories`,
      };
    }

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 12. Video Schema Generator
// ---------------------------------------------------------------------------

export const videoSchemaGenerator: GeneratorToolConfig = {
  fields: [
    { key: "name", label: "Video Title", type: "text", placeholder: "e.g. How to Build a Website", required: true },
    { key: "description", label: "Description", type: "textarea", placeholder: "Video description", rows: 3, required: true },
    { key: "thumbnailUrl", label: "Thumbnail URL", type: "url", placeholder: "https://example.com/thumb.jpg", required: true },
    { key: "uploadDate", label: "Upload Date", type: "text", placeholder: "YYYY-MM-DD", required: true },
    { key: "duration", label: "Duration (ISO 8601)", type: "text", placeholder: "PT10M30S" },
    { key: "contentUrl", label: "Content URL", type: "url", placeholder: "https://example.com/video.mp4" },
    { key: "embedUrl", label: "Embed URL", type: "url", placeholder: "https://www.youtube.com/embed/abc123" },
  ],
  generate(values) {
    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: values.name,
      description: values.description,
      thumbnailUrl: values.thumbnailUrl,
      uploadDate: values.uploadDate,
    };

    if (values.duration) schema.duration = values.duration;
    if (values.contentUrl) schema.contentUrl = values.contentUrl;
    if (values.embedUrl) schema.embedUrl = values.embedUrl;

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 13. Job Posting Schema Generator
// ---------------------------------------------------------------------------

export const jobPostingSchemaGenerator: GeneratorToolConfig = {
  fields: [
    { key: "title", label: "Job Title", type: "text", placeholder: "e.g. Senior Software Engineer", required: true },
    { key: "description", label: "Job Description", type: "textarea", placeholder: "Full job description", rows: 5, required: true },
    { key: "companyName", label: "Company Name", type: "text", placeholder: "e.g. Acme Inc.", required: true },
    { key: "companyUrl", label: "Company Website", type: "url", placeholder: "https://example.com" },
    { key: "city", label: "City", type: "text", placeholder: "e.g. San Francisco" },
    { key: "state", label: "State / Region", type: "text", placeholder: "e.g. CA" },
    { key: "country", label: "Country", type: "text", placeholder: "e.g. US" },
    { key: "salaryMin", label: "Salary Min", type: "text", placeholder: "e.g. 80000" },
    { key: "salaryMax", label: "Salary Max", type: "text", placeholder: "e.g. 120000" },
    { key: "salaryCurrency", label: "Salary Currency", type: "text", defaultValue: "USD", placeholder: "USD" },
    {
      key: "employmentType",
      label: "Employment Type",
      type: "select",
      defaultValue: "FULL_TIME",
      options: [
        { value: "FULL_TIME", label: "Full-Time" },
        { value: "PART_TIME", label: "Part-Time" },
        { value: "CONTRACTOR", label: "Contractor" },
        { value: "TEMPORARY", label: "Temporary" },
        { value: "INTERN", label: "Intern" },
      ],
    },
    { key: "datePosted", label: "Date Posted", type: "text", placeholder: "YYYY-MM-DD", required: true },
    { key: "validThrough", label: "Valid Through", type: "text", placeholder: "YYYY-MM-DD" },
  ],
  generate(values) {
    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: values.title,
      description: values.description,
      datePosted: values.datePosted,
      hiringOrganization: {
        "@type": "Organization",
        name: values.companyName,
        ...(values.companyUrl && { sameAs: values.companyUrl }),
      },
      employmentType: values.employmentType || "FULL_TIME",
    };

    if (values.validThrough) schema.validThrough = values.validThrough;

    if (values.city || values.state || values.country) {
      schema.jobLocation = {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          ...(values.city && { addressLocality: values.city }),
          ...(values.state && { addressRegion: values.state }),
          ...(values.country && { addressCountry: values.country }),
        },
      };
    }

    if (values.salaryMin || values.salaryMax) {
      schema.baseSalary = {
        "@type": "MonetaryAmount",
        currency: values.salaryCurrency || "USD",
        value: {
          "@type": "QuantitativeValue",
          ...(values.salaryMin && { minValue: Number(values.salaryMin) }),
          ...(values.salaryMax && { maxValue: Number(values.salaryMax) }),
          unitText: "YEAR",
        },
      };
    }

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 14. HowTo Schema Generator
// ---------------------------------------------------------------------------

export const howtoSchemaGenerator: GeneratorToolConfig = {
  fields: [
    { key: "name", label: "Title", type: "text", placeholder: "e.g. How to Change a Tire", required: true },
    { key: "description", label: "Description", type: "textarea", placeholder: "Brief overview", rows: 3, required: true },
    { key: "totalTime", label: "Total Time (ISO 8601)", type: "text", placeholder: "PT30M" },
    { key: "estimatedCostValue", label: "Estimated Cost", type: "text", placeholder: "e.g. 25.00" },
    { key: "estimatedCostCurrency", label: "Cost Currency", type: "text", defaultValue: "USD", placeholder: "USD" },
    {
      key: "steps",
      label: "Steps (one per line)",
      type: "textarea",
      placeholder: "Loosen the lug nuts.\nJack up the vehicle.\nRemove the flat tire.\nMount the spare tire.",
      required: true,
      rows: 8,
    },
    { key: "image", label: "Image URL", type: "url", placeholder: "https://example.com/howto.jpg" },
  ],
  generate(values) {
    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: values.name,
      description: values.description,
    };

    if (values.totalTime) schema.totalTime = values.totalTime;
    if (values.image) schema.image = values.image;

    if (values.estimatedCostValue) {
      schema.estimatedCost = {
        "@type": "MonetaryAmount",
        currency: values.estimatedCostCurrency || "USD",
        value: values.estimatedCostValue,
      };
    }

    const steps = parseLines(values.steps);
    if (steps.length) {
      schema.step = steps.map((text, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        text,
      }));
    }

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// 15. Service Schema Generator
// ---------------------------------------------------------------------------

export const serviceSchemaGenerator: GeneratorToolConfig = {
  fields: [
    { key: "serviceName", label: "Service Name", type: "text", placeholder: "e.g. Web Design Services", required: true },
    { key: "providerName", label: "Provider Name", type: "text", placeholder: "e.g. Acme Digital", required: true },
    { key: "providerUrl", label: "Provider URL", type: "url", placeholder: "https://example.com" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Service description", rows: 3 },
    { key: "serviceType", label: "Service Type", type: "text", placeholder: "e.g. Web Development" },
    { key: "areaServed", label: "Area Served", type: "text", placeholder: "e.g. United States" },
    { key: "price", label: "Starting Price", type: "text", placeholder: "e.g. 500.00" },
  ],
  generate(values) {
    const schema: JsonLd = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: values.serviceName,
      provider: {
        "@type": "Organization",
        name: values.providerName,
        ...(values.providerUrl && { url: values.providerUrl }),
      },
    };

    if (values.description) schema.description = values.description;
    if (values.serviceType) schema.serviceType = values.serviceType;
    if (values.areaServed) schema.areaServed = values.areaServed;

    if (values.price) {
      schema.offers = {
        "@type": "Offer",
        price: values.price,
        priceCurrency: "USD",
      };
    }

    return wrapJsonLd(schema);
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonLd = Record<string, any>;

function parseLines(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function parseFaqPairs(raw: string | undefined): { question: string; answer: string }[] {
  if (!raw) return [];

  const blocks = raw.split(/\n\s*\n/);
  const pairs: { question: string; answer: string }[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    let question = "";
    let answer = "";

    for (const line of lines) {
      if (/^Q:\s*/i.test(line)) {
        question = line.replace(/^Q:\s*/i, "").trim();
      } else if (/^A:\s*/i.test(line)) {
        answer = line.replace(/^A:\s*/i, "").trim();
      }
    }

    if (question && answer) pairs.push({ question, answer });
  }

  return pairs;
}

function wrapJsonLd(schema: JsonLd): string {
  const json = JSON.stringify(schema, null, 2);
  return `<script type="application/ld+json">\n${json}\n</script>`;
}
