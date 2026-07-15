export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  author: { name: string; role: string };
  publishedAt: string;
  readingTime: string;
  featuredImage: string;
  content: string;
};

const AUTHOR = { name: "Navjeet Kamboj", role: "Founder & Local SEO Editor" };

export const ARTICLES: Article[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. How to Get Your Business Listed on Google Maps in 2026
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "how-to-get-business-listed-google-maps",
    title: "How to Get Your Business Listed on Google Maps in 2026",
    description:
      "A step-by-step guide to creating and optimizing your Google Business Profile so your business appears in Google Maps, local search, and the map pack.",
    category: "Local SEO",
    author: AUTHOR,
    publishedAt: "2026-06-10",
    readingTime: "9 min read",
    featuredImage: "/images/article-google-maps.png",
    content: `
<h2 id="why-google-maps-matters">Why a Google Maps Listing Matters for Your Business</h2>

<p>According to Google, nearly <strong>46% of all searches</strong> have local intent. When someone types "coffee shop near me" or "plumber in Dallas," Google Maps results dominate the top of the page. If your business is not listed, you are invisible to nearly half the people searching for services like yours.</p>

<p>A well-optimized Google Business Profile (GBP) gives you a free storefront on the world's most popular search engine. You get a place pin on Google Maps, a knowledge panel in search results, and the ability to collect reviews, post updates, and showcase your hours — all at zero cost.</p>

<blockquote><strong>Key stat:</strong> Businesses with complete Google Business Profiles are <strong>2.7× more likely</strong> to be considered reputable by consumers (Google, 2025).</blockquote>

<h2 id="step-1-create-account">Step 1 — Create or Claim Your Google Business Profile</h2>

<p>If you have never set up a listing, head to <strong>business.google.com</strong> and sign in with a Google account. Click "Add your business" and enter your business name exactly as it appears on signage and official documents.</p>

<h3>Already See Your Business on Maps?</h3>

<p>Someone — a customer, a data aggregator, or Google itself — may have created a listing for you. Search for your business name on Google Maps. If it exists, click "Claim this business" and follow the verification prompts.</p>

<ul>
  <li>Use a Google account you control long-term (not a personal Gmail you might abandon).</li>
  <li>If multiple locations exist, consider a single management account for all of them.</li>
  <li>Never create duplicate listings — Google penalizes businesses with multiple profiles for the same address.</li>
</ul>

<h2 id="step-2-enter-details">Step 2 — Enter Accurate Business Information</h2>

<p>Google ranks local results partly on <strong>relevance, distance, and prominence</strong>. The more complete and consistent your profile, the better your relevance signals.</p>

<h3>Business Name</h3>
<p>Use your real-world business name — no keyword stuffing. "Joe's Plumbing" is fine; "Joe's Plumbing | Best Emergency Plumber in Houston TX 24/7" is a policy violation and can get your listing suspended.</p>

<h3>Address &amp; Service Area</h3>
<p>If customers visit your location, enter the full street address. If you travel to customers (e.g., a mobile dog groomer), hide the address and define a service area instead. You can define up to 20 service areas by city, zip code, or region.</p>

<h3>Categories</h3>
<p>Pick the <strong>most specific primary category</strong> that matches your business. For example, choose "Italian Restaurant" instead of just "Restaurant." You can add up to nine additional categories. Categories directly influence which searches your listing appears in.</p>

<h3>Phone &amp; Website</h3>
<p>Use a local phone number rather than a toll-free one — Google associates local numbers with geographic relevance. Link to your website's homepage or a location-specific landing page.</p>

<blockquote><strong>Tip:</strong> Keep your Name, Address, and Phone (NAP) consistent everywhere — your website, social media, and directories. Use our <a href="/tools/nap-formatter">NAP Formatter</a> tool to generate a consistent citation format.</blockquote>

<h2 id="step-3-verify">Step 3 — Verify Your Business</h2>

<p>Google must confirm you are a real business at a real location. Verification methods vary:</p>

<table>
  <thead>
    <tr><th>Method</th><th>How It Works</th><th>Typical Timeline</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>Postcard</strong></td><td>Google mails a postcard with a PIN to your address</td><td>5–14 days</td></tr>
    <tr><td><strong>Phone</strong></td><td>Automated call or SMS with a verification code</td><td>Instant</td></tr>
    <tr><td><strong>Email</strong></td><td>Code sent to the email on file</td><td>Instant</td></tr>
    <tr><td><strong>Video</strong></td><td>Record a short video showing signage, address, and interior</td><td>1–5 days review</td></tr>
    <tr><td><strong>Instant</strong></td><td>Available if you already verified your website in Search Console</td><td>Instant</td></tr>
  </tbody>
</table>

<p>Do not change your business name or address during the verification waiting period — it can reset the process.</p>

<h2 id="step-4-optimize">Step 4 — Optimize Your Profile for Maximum Visibility</h2>

<p>A bare-bones listing with just a name and address will not rank well. Here is what to add:</p>

<h3>Business Description</h3>
<p>You get 750 characters. Lead with your main service and location. Naturally include keywords customers search for, but write for humans first. Use our <a href="/tools/company-description-generator">Company Description Generator</a> if you need a starting point.</p>

<h3>Photos &amp; Videos</h3>
<p>Listings with photos receive <strong>42% more requests for directions</strong> and 35% more website clicks. Upload at least:</p>
<ul>
  <li>A high-quality logo (square, 250×250 minimum)</li>
  <li>A cover photo showing the exterior or storefront</li>
  <li>3–5 interior photos, product photos, or team photos</li>
  <li>A short video (30–60 seconds) of your business in action</li>
</ul>

<h3>Business Hours</h3>
<p>Set regular hours and update them for holidays. Inaccurate hours frustrate customers and lead to negative reviews.</p>

<h3>Products &amp; Services</h3>
<p>Add specific products or services with descriptions and prices. This helps Google match your listing to detailed queries like "teeth whitening cost" or "brake pad replacement."</p>

<h3>Attributes</h3>
<p>Select relevant attributes like "wheelchair accessible," "free Wi-Fi," "outdoor seating," or "women-owned." These attributes appear in your listing and can filter search results.</p>

<h2 id="step-5-reviews">Step 5 — Build and Manage Reviews</h2>

<p>Reviews are one of the top three local ranking factors. Aim for a steady stream of genuine reviews rather than a one-time burst.</p>

<ul>
  <li>Ask satisfied customers to leave a review right after the service.</li>
  <li>Make it easy — share a direct review link. You can generate one with our <a href="/tools/review-link-generator">Review Link Generator</a>.</li>
  <li>Respond to every review, positive or negative, within 24–48 hours.</li>
  <li>Never buy fake reviews — Google detects patterns and can remove your listing entirely.</li>
</ul>

<h2 id="step-6-posts">Step 6 — Use Google Posts to Stay Active</h2>

<p>Google Posts let you share updates, offers, events, and news directly on your listing. Posts expire after seven days (events after the event date), so post weekly to keep your profile fresh.</p>

<p>Each post should include an image, a short paragraph, and a call-to-action button (Learn More, Call, Book, etc.).</p>

<h2 id="free-vs-paid">Free vs. Paid: Google Business Profile Options</h2>

<table>
  <thead>
    <tr><th>Feature</th><th>Free GBP</th><th>Paid Ads (Local Services Ads)</th></tr>
  </thead>
  <tbody>
    <tr><td>Appear in Google Maps</td><td>✅ Yes</td><td>✅ Yes (top placement)</td></tr>
    <tr><td>Show reviews &amp; ratings</td><td>✅ Yes</td><td>✅ Yes + Google Guaranteed badge</td></tr>
    <tr><td>Post updates &amp; offers</td><td>✅ Yes</td><td>❌ No</td></tr>
    <tr><td>Photos &amp; videos</td><td>✅ Unlimited</td><td>Limited</td></tr>
    <tr><td>Click-to-call tracking</td><td>✅ Basic</td><td>✅ Advanced</td></tr>
    <tr><td>Cost</td><td>Free forever</td><td>Pay per lead ($5–$100+)</td></tr>
    <tr><td>Best for</td><td>All businesses</td><td>High-competition service businesses</td></tr>
  </tbody>
</table>

<h2 id="common-mistakes">Common Mistakes to Avoid</h2>

<ol>
  <li><strong>Keyword-stuffed business name</strong> — violates Google's guidelines and risks suspension.</li>
  <li><strong>Using a virtual office or PO Box</strong> — Google requires a real staffed location or a legitimate service area.</li>
  <li><strong>Ignoring negative reviews</strong> — a polite, professional response shows potential customers you care.</li>
  <li><strong>Inconsistent NAP data</strong> — if your address is "123 Main St." on Google and "123 Main Street" on Yelp, it confuses search engines.</li>
  <li><strong>Leaving the profile incomplete</strong> — missing hours, categories, or description signals low effort to Google's algorithm.</li>
</ol>

<h2 id="track-performance">How to Track Your Listing's Performance</h2>

<p>Inside your Google Business Profile dashboard, the "Performance" tab shows:</p>

<ul>
  <li><strong>Search queries</strong> — what terms people used to find you</li>
  <li><strong>Views</strong> — how many times your listing appeared in search and maps</li>
  <li><strong>Actions</strong> — calls, direction requests, website clicks, and bookings</li>
  <li><strong>Photo views</strong> — compared to similar businesses</li>
</ul>

<p>Check these metrics monthly. If direction requests are growing but calls are not, consider adding a stronger call-to-action. If views are flat, you may need more reviews or better category selection.</p>

<h2 id="next-steps">Next Steps</h2>

<p>Getting listed on Google Maps is the first step of any local SEO strategy. Once your profile is live, focus on building citations (mentions of your NAP on other directories), earning backlinks from local organizations, and keeping your profile updated with fresh posts, photos, and review responses.</p>

<p>Explore our free tools to help you along the way:</p>

<ul>
  <li><a href="/tools/meta-title-generator">Meta Title Generator</a> — optimize your website's title tags</li>
  <li><a href="/tools/local-business-schema-generator">Local Business Schema Generator</a> — add structured data to your site</li>
  <li><a href="/tools/google-review-qr-generator">Google Review QR Generator</a> — print QR codes for easy review collection</li>
  <li><a href="/tools/nap-formatter">NAP Formatter</a> — ensure citation consistency everywhere</li>
</ul>
`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Top 10 Free SEO Tools Every Small Business Needs
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "top-free-seo-tools-small-business",
    title: "Top 10 Free SEO Tools Every Small Business Needs in 2026",
    description:
      "A curated list of the best free SEO tools for small businesses — from keyword research and meta tag generators to page speed testers and schema markup builders.",
    category: "SEO",
    author: AUTHOR,
    publishedAt: "2026-06-18",
    readingTime: "7 min read",
    featuredImage: "/images/article-seo-tools.png",
    content: `
<h2 id="why-free-tools">Why Free SEO Tools Are a Game-Changer for Small Businesses</h2>

<p>Enterprise SEO software can cost $200–$500 per month. For a local bakery, a solo consultant, or a brand-new startup, that is not realistic. The good news: the most impactful SEO tasks — writing meta tags, checking page speed, building structured data — can be done with free tools that deliver professional results.</p>

<p>We built a suite of <a href="/tools">free SEO and utility tools</a> on Submit Your Store for exactly this reason. Combined with Google's own free offerings, you have everything you need to compete in search without spending a dollar.</p>

<blockquote><strong>Principle:</strong> Tools do not replace strategy. Use them to execute faster, but always start with a plan: who is your customer, what are they searching for, and what content answers their question?</blockquote>

<h2 id="the-list">The 10 Tools You Should Be Using</h2>

<h3 id="tool-1">1. Google Search Console (Free by Google)</h3>

<p>If you only use one SEO tool, make it this one. Google Search Console shows you which queries bring people to your site, which pages are indexed, and any crawl errors or manual actions. It also lets you submit sitemaps and request indexing for new pages.</p>

<ul>
  <li><strong>Best for:</strong> monitoring organic traffic, fixing index issues, identifying your top-performing keywords.</li>
  <li><strong>Limitation:</strong> only shows data for your own site (not competitors).</li>
</ul>

<h3 id="tool-2">2. Meta Title &amp; Description Generator</h3>

<p>Your title tag and meta description are the first things searchers see. A good title boosts click-through rate; a bad one gets ignored. Our <a href="/tools/meta-title-generator">Meta Title Generator</a> and <a href="/tools/meta-description-generator">Meta Description Generator</a> help you craft titles and descriptions that fit within Google's character limits and include your target keywords naturally.</p>

<table>
  <thead>
    <tr><th>Element</th><th>Ideal Length</th><th>Purpose</th></tr>
  </thead>
  <tbody>
    <tr><td>Meta Title</td><td>50–60 characters</td><td>Appears as the clickable headline in search results</td></tr>
    <tr><td>Meta Description</td><td>150–160 characters</td><td>Appears as the snippet below the title</td></tr>
  </tbody>
</table>

<h3 id="tool-3">3. Word Counter &amp; Readability Checker</h3>

<p>Content length and readability both influence rankings. Our <a href="/tools/word-counter">Word Counter</a> gives you a real-time count of words, characters, sentences, and estimated reading time. Pair it with the <a href="/tools/readability-checker">Readability Checker</a> to see the Flesch-Kincaid grade level of your writing — aim for grade 8 or below to reach the widest audience.</p>

<h3 id="tool-4">4. Google PageSpeed Insights</h3>

<p>Page speed is a confirmed ranking factor. Google PageSpeed Insights analyzes your page on both mobile and desktop, scoring it from 0–100 and providing specific recommendations (optimize images, reduce JavaScript, enable compression). You can quickly generate a test link using our <a href="/tools/page-speed-checker">Page Speed Insights Link</a> tool.</p>

<h3 id="tool-5">5. Local Business Schema Generator</h3>

<p>Structured data tells Google exactly what your business is, where it is, and when it is open. Our <a href="/tools/local-business-schema-generator">Local Business Schema Generator</a> builds valid JSON-LD markup you can paste into your site's HTML. This is essential for appearing in rich results and the local knowledge panel.</p>

<h3 id="tool-6">6. Open Graph &amp; Twitter Card Generator</h3>

<p>When someone shares your page on Facebook, LinkedIn, or Twitter, Open Graph and Twitter Card tags control the image, title, and description that appear. Without them, social platforms guess — and usually guess wrong. Use our <a href="/tools/open-graph-generator">Open Graph Generator</a> and <a href="/tools/twitter-card-generator">Twitter Card Generator</a> to set them up in minutes.</p>

<h3 id="tool-7">7. NAP Formatter</h3>

<p>NAP consistency (Name, Address, Phone) across every directory listing is critical for local SEO. Our <a href="/tools/nap-formatter">NAP Formatter</a> generates a standardized citation format you can copy and paste into Yelp, Facebook, BBB, and dozens of other directories.</p>

<h3 id="tool-8">8. XML Sitemap Generator</h3>

<p>A sitemap tells search engines about every important page on your site. If you have a static site without a CMS that generates sitemaps automatically, our <a href="/tools/xml-sitemap-generator">XML Sitemap Generator</a> creates a valid sitemap you can upload to your server and submit in Google Search Console.</p>

<h3 id="tool-9">9. Robots.txt Generator</h3>

<p>Your robots.txt file controls which pages search engines can and cannot crawl. A misconfigured robots.txt can accidentally block your entire site from being indexed. Our <a href="/tools/robots-txt-generator">Robots.txt Generator</a> creates a properly formatted file with allow/disallow rules, sitemap URL, and crawl delay settings.</p>

<h3 id="tool-10">10. URL Slug Generator</h3>

<p>Clean, readable URLs improve both SEO and user experience. Instead of <code>/page?id=847&ref=nav</code>, you want <code>/free-seo-tools-small-business</code>. Our <a href="/tools/url-slug-generator">URL Slug Generator</a> converts any text into a lowercase, hyphenated slug ready for your CMS.</p>

<h2 id="how-to-use">How to Use These Tools Together</h2>

<p>Here is a practical workflow for a small business owner publishing a new blog post or landing page:</p>

<ol>
  <li><strong>Write your content</strong> and paste it into the <a href="/tools/word-counter">Word Counter</a> to check length (aim for 800+ words for blog posts).</li>
  <li><strong>Run the <a href="/tools/readability-checker">Readability Checker</a></strong> and simplify any sentences scoring above grade 10.</li>
  <li><strong>Generate a URL slug</strong> with the <a href="/tools/url-slug-generator">URL Slug Generator</a>.</li>
  <li><strong>Write a meta title and description</strong> using the generators — hit the green character limit indicators.</li>
  <li><strong>Add Open Graph tags</strong> so your page looks professional on social media.</li>
  <li><strong>If applicable, add schema markup</strong> — local business, FAQ, or article schema.</li>
  <li><strong>Publish and submit</strong> the URL in Google Search Console for indexing.</li>
  <li><strong>Test page speed</strong> and fix any warnings.</li>
</ol>

<h2 id="bonus-tools">Bonus: Tools We Also Recommend</h2>

<ul>
  <li><a href="/tools/keyword-density-checker">Keyword Density Checker</a> — make sure you are not over- or under-using your target keyword.</li>
  <li><a href="/tools/canonical-tag-generator">Canonical Tag Generator</a> — prevent duplicate content issues if you have similar pages.</li>
  <li><a href="/tools/serp-snippet-preview">SERP Snippet Preview</a> — see exactly how your page will look in Google before you publish.</li>
  <li><a href="/tools/google-index-checker">Google Index Checker</a> — verify that your page is actually appearing in Google's index.</li>
</ul>

<h2 id="final-thoughts">Final Thoughts</h2>

<p>You do not need an expensive SEO subscription to rank in local search. With the right free tools and a consistent content strategy, small businesses can compete with much larger competitors. Start with the basics — meta tags, schema, speed, and reviews — and build from there.</p>

<p>Explore all of our <a href="/tools">free SEO and business tools</a>, or <a href="/list-your-business">list your business</a> for free to start building your online presence today.</p>
`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Complete Guide to Local Business Citations
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "guide-local-business-citations",
    title: "Complete Guide to Local Business Citations: What They Are and Why They Matter",
    description:
      "Learn what local business citations are, why NAP consistency is critical for SEO, and how to build citations on the most important directories in 2026.",
    category: "Local SEO",
    author: AUTHOR,
    publishedAt: "2026-06-25",
    readingTime: "8 min read",
    featuredImage: "/images/article-citations.png",
    content: `
<h2 id="what-are-citations">What Are Local Business Citations?</h2>

<p>A <strong>local business citation</strong> is any online mention of your business's Name, Address, and Phone number (NAP). Citations can appear on business directories (Yelp, Yellow Pages), social platforms (Facebook, LinkedIn), industry-specific sites (TripAdvisor for hotels, Avvo for lawyers), and data aggregators that feed information to hundreds of smaller directories.</p>

<p>Citations are one of the core ranking factors for Google's local algorithm. They help Google validate that your business is real, legitimate, and located where you say it is.</p>

<blockquote><strong>Think of citations as votes of confidence:</strong> the more consistent, high-quality mentions of your business across the web, the more trust search engines place in your listing.</blockquote>

<h2 id="types-of-citations">Types of Citations</h2>

<h3>Structured Citations</h3>
<p>These appear in organized directory listings with dedicated fields for business name, address, phone, website, hours, and categories. Examples include Google Business Profile, Yelp, Bing Places, and Apple Maps.</p>

<h3>Unstructured Citations</h3>
<p>These are mentions of your NAP in blog posts, news articles, press releases, or social media posts. They do not have a formal listing format but still count as citations.</p>

<table>
  <thead>
    <tr><th>Citation Type</th><th>Example</th><th>SEO Impact</th></tr>
  </thead>
  <tbody>
    <tr><td>Structured (directory listing)</td><td>Yelp, BBB, Yellow Pages</td><td>High — direct NAP validation</td></tr>
    <tr><td>Unstructured (mention)</td><td>Local newspaper article, blog post</td><td>Medium — contextual relevance</td></tr>
    <tr><td>Social (profile page)</td><td>Facebook Page, LinkedIn Company</td><td>Medium-High — authority signals</td></tr>
  </tbody>
</table>

<h2 id="nap-consistency">Why NAP Consistency Is Everything</h2>

<p>The single biggest mistake businesses make with citations is <strong>inconsistency</strong>. If your Google listing says "123 Main Street, Suite 4" but Yelp says "123 Main St #4" and Facebook says "123 Main Street," search engines are not sure which is correct. This confusion weakens your local rankings.</p>

<p>Pick one canonical format for your NAP and use it everywhere. Our <a href="/tools/nap-formatter">NAP Formatter</a> generates a clean, standardized version of your business information that you can copy and paste into every directory.</p>

<h3>Common Inconsistencies to Watch For</h3>

<ul>
  <li><strong>Street abbreviations:</strong> "Street" vs. "St." vs. "St"</li>
  <li><strong>Suite/unit formatting:</strong> "Suite 200" vs. "Ste 200" vs. "#200"</li>
  <li><strong>Phone formatting:</strong> "(555) 123-4567" vs. "555-123-4567" vs. "5551234567"</li>
  <li><strong>Business name variations:</strong> "Joe's Auto Repair" vs. "Joe's Auto Repair LLC" vs. "Joes Auto Repair"</li>
  <li><strong>Old addresses:</strong> if you moved, old listings with the previous address still exist</li>
</ul>

<h2 id="top-citation-sources">Top Citation Sources to Prioritize</h2>

<p>Not all citations carry equal weight. Focus on these high-authority sources first:</p>

<h3>Tier 1 — Essential (Do These First)</h3>
<ol>
  <li><strong>Google Business Profile</strong> — the single most important listing</li>
  <li><strong>Apple Maps (Apple Business Connect)</strong> — important for iPhone users</li>
  <li><strong>Bing Places for Business</strong> — feeds data to Cortana, Edge, and Alexa</li>
  <li><strong>Yelp</strong> — massive authority for local businesses</li>
  <li><strong>Facebook Business Page</strong> — social validation and review platform</li>
</ol>

<h3>Tier 2 — Important Directories</h3>
<ol>
  <li><strong>Better Business Bureau (BBB)</strong> — trust signal</li>
  <li><strong>Yellow Pages (YP.com)</strong> — longstanding directory</li>
  <li><strong>Foursquare</strong> — feeds data to Uber, Twitter, Samsung, and more</li>
  <li><strong>Nextdoor</strong> — hyperlocal community recommendations</li>
  <li><strong>Manta</strong> — small business directory</li>
</ol>

<h3>Tier 3 — Industry-Specific</h3>
<ul>
  <li><strong>Restaurants:</strong> TripAdvisor, OpenTable, Zomato</li>
  <li><strong>Healthcare:</strong> Healthgrades, Zocdoc, Vitals</li>
  <li><strong>Legal:</strong> Avvo, FindLaw, Justia</li>
  <li><strong>Home Services:</strong> Angi, HomeAdvisor, Thumbtack</li>
  <li><strong>Real Estate:</strong> Zillow, Realtor.com, Redfin</li>
</ul>

<h2 id="how-to-build">How to Build Citations: A Step-by-Step Process</h2>

<ol>
  <li><strong>Audit existing citations.</strong> Search your business name in quotes on Google. Note every site that mentions your NAP and check for accuracy.</li>
  <li><strong>Fix inconsistencies.</strong> Log into each directory where your NAP is wrong and update it to match your canonical format.</li>
  <li><strong>Claim unclaimed listings.</strong> Many directories auto-generate listings from data aggregators. Claim yours so you can control the information.</li>
  <li><strong>Build new citations.</strong> Work through the tier lists above, starting with Tier 1. Create a profile on each site with your exact canonical NAP.</li>
  <li><strong>Submit to data aggregators.</strong> Services like Data Axle, Neustar Localeze, and Foursquare feed information to hundreds of smaller directories. Getting listed on aggregators multiplies your reach.</li>
  <li><strong>Monitor regularly.</strong> Check your citations every 3–6 months. Directories can change your data, merge listings, or create duplicates.</li>
</ol>

<h2 id="citation-checklist">Quick Citation Checklist</h2>

<table>
  <thead>
    <tr><th>Task</th><th>Status</th></tr>
  </thead>
  <tbody>
    <tr><td>NAP format standardized</td><td>☐</td></tr>
    <tr><td>Google Business Profile claimed &amp; optimized</td><td>☐</td></tr>
    <tr><td>Apple Maps listing created</td><td>☐</td></tr>
    <tr><td>Bing Places listing created</td><td>☐</td></tr>
    <tr><td>Yelp listing claimed</td><td>☐</td></tr>
    <tr><td>Facebook Business Page set up</td><td>☐</td></tr>
    <tr><td>5+ Tier 2 directories completed</td><td>☐</td></tr>
    <tr><td>Industry-specific directories completed</td><td>☐</td></tr>
    <tr><td>Data aggregator submissions done</td><td>☐</td></tr>
    <tr><td>Quarterly audit scheduled</td><td>☐</td></tr>
  </tbody>
</table>

<h2 id="tools-to-help">Tools to Help You Build Citations</h2>

<ul>
  <li><a href="/tools/nap-formatter">NAP Formatter</a> — generate a consistent NAP format for all directories</li>
  <li><a href="/tools/local-business-schema-generator">Local Business Schema Generator</a> — add structured data to your own website</li>
  <li><a href="/tools/google-maps-embed-generator">Google Maps Embed Generator</a> — add a map to your website's contact page</li>
  <li><a href="/tools/business-hours-generator">Business Hours Generator</a> — format hours consistently for directories</li>
</ul>

<h2 id="conclusion">Conclusion</h2>

<p>Citations are a foundational piece of local SEO. They are not glamorous, but they work. A business with 50 accurate, consistent citations will almost always outrank a competitor with 200 inconsistent, duplicate ones. Focus on quality over quantity, maintain consistency, and audit regularly. Your local rankings will thank you.</p>

<p>Ready to get started? <a href="/list-your-business">List your business for free</a> on Submit Your Store and begin building your citation network today.</p>
`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. How to Optimize Your Business Description for SEO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "optimize-business-description-seo",
    title: "How to Optimize Your Business Description for SEO",
    description:
      "Learn how to write business descriptions that rank in search engines and convert visitors into customers. Includes examples, keyword tips, and a free generator tool.",
    category: "Content Marketing",
    author: AUTHOR,
    publishedAt: "2026-07-02",
    readingTime: "6 min read",
    featuredImage: "/images/article-content-marketing.png",
    content: `
<h2 id="why-descriptions-matter">Why Your Business Description Matters More Than You Think</h2>

<p>Your business description appears in multiple places: Google Business Profile, directories, your website's "About" page, and social media bios. It is often the <strong>first piece of text</strong> a potential customer reads about you. A well-written description does three things:</p>

<ol>
  <li><strong>Tells Google what you do</strong> — so it can match you to relevant search queries.</li>
  <li><strong>Convinces visitors to take action</strong> — call, visit, or learn more.</li>
  <li><strong>Differentiates you from competitors</strong> — why choose you over the next result?</li>
</ol>

<blockquote><strong>Key insight:</strong> Google uses the text in your business description as a relevance signal. If someone searches for "emergency plumber in Austin" and your description mentions those exact words naturally, you are more likely to appear.</blockquote>

<h2 id="good-vs-bad">Good vs. Bad Business Descriptions</h2>

<table>
  <thead>
    <tr><th>Aspect</th><th>Bad Example</th><th>Good Example</th></tr>
  </thead>
  <tbody>
    <tr><td>Opening line</td><td>"We are a company that does many things."</td><td>"We are Austin's highest-rated emergency plumbing service, available 24/7."</td></tr>
    <tr><td>Keywords</td><td>None or keyword-stuffed: "plumber plumbing plumber Austin plumber"</td><td>Naturally included: "residential and commercial plumbing in Austin, TX"</td></tr>
    <tr><td>Specificity</td><td>"We offer great service at great prices."</td><td>"We handle drain cleaning, water heater repair, and slab leak detection."</td></tr>
    <tr><td>Call to action</td><td>Missing</td><td>"Call us at (512) 555-0100 or request a free estimate online."</td></tr>
    <tr><td>Length</td><td>One vague sentence</td><td>3–5 concise sentences (150–300 words)</td></tr>
  </tbody>
</table>

<h2 id="writing-formula">The 5-Part Formula for SEO-Friendly Descriptions</h2>

<h3>1. Lead With What You Do + Where</h3>
<p>Start with your primary service and location. This is the most important sentence for both SEO and reader comprehension.</p>
<p><strong>Example:</strong> "Smith Dental is a family dentistry practice in downtown Portland, Oregon, offering preventive care, cosmetic dentistry, and emergency dental services."</p>

<h3>2. Highlight Your Unique Value</h3>
<p>What makes you different? Years of experience, certifications, awards, or a specific approach. Avoid generic claims like "best quality" — be specific.</p>
<p><strong>Example:</strong> "With 15 years of experience and a 4.9-star Google rating from 300+ patients, we are known for gentle care and same-day appointments."</p>

<h3>3. List Key Services or Products</h3>
<p>Include your top 3–5 services. This helps Google match you to long-tail queries and gives customers a quick overview.</p>
<p><strong>Example:</strong> "Our services include teeth whitening, dental implants, Invisalign, routine cleanings, and pediatric dentistry."</p>

<h3>4. Include a Trust Signal</h3>
<p>Mention awards, certifications, years in business, or notable clients. Social proof builds credibility.</p>
<p><strong>Example:</strong> "We are accredited by the American Dental Association and have been serving Portland families since 2011."</p>

<h3>5. End With a Call to Action</h3>
<p>Tell the reader what to do next. A phone number, a booking link, or a simple invitation works well.</p>
<p><strong>Example:</strong> "Schedule your free consultation at smithdental.com or call (503) 555-0200."</p>

<h2 id="keyword-tips">Keyword Tips for Business Descriptions</h2>

<ul>
  <li><strong>Use your primary keyword in the first sentence.</strong> Google gives more weight to text that appears early.</li>
  <li><strong>Include location names naturally.</strong> City, neighborhood, and region names help with local search.</li>
  <li><strong>Use synonyms and related terms.</strong> "Plumber" + "plumbing services" + "pipe repair" covers more queries.</li>
  <li><strong>Avoid keyword stuffing.</strong> If it sounds unnatural when read aloud, rewrite it.</li>
  <li><strong>Match search intent.</strong> If people search "affordable," include pricing language. If they search "24/7," mention your hours.</li>
</ul>

<h2 id="platform-lengths">Optimal Description Lengths by Platform</h2>

<table>
  <thead>
    <tr><th>Platform</th><th>Max Length</th><th>Recommendation</th></tr>
  </thead>
  <tbody>
    <tr><td>Google Business Profile</td><td>750 characters</td><td>Use all 750 — frontload keywords</td></tr>
    <tr><td>Yelp</td><td>5,000 characters</td><td>300–500 words with services and history</td></tr>
    <tr><td>Facebook</td><td>255 characters (short desc)</td><td>Concise tagline + key service</td></tr>
    <tr><td>LinkedIn</td><td>2,000 characters</td><td>Professional tone, mention specialties</td></tr>
    <tr><td>Your Website</td><td>No limit</td><td>Full "About" page with 500+ words</td></tr>
  </tbody>
</table>

<h2 id="use-our-generator">Generate Yours Automatically</h2>

<p>If you are staring at a blank text field, our <a href="/tools/company-description-generator">Company Description Generator</a> can help. Enter your business name, industry, location, and key services, and it will produce a professional starting point you can customize.</p>

<p>You can also use the <a href="/tools/keyword-density-checker">Keyword Density Checker</a> to analyze your description after writing it — make sure your target keyword appears 2–3 times without being overused.</p>

<h2 id="final-tips">Final Tips</h2>

<ul>
  <li>Write in <strong>third person</strong> for directories ("Smith Dental offers…") and first person for your website ("We offer…").</li>
  <li><strong>Update your description annually.</strong> Add new services, remove discontinued ones, and refresh keywords.</li>
  <li><strong>Proofread carefully.</strong> Typos and grammatical errors undermine trust.</li>
  <li>Keep sentences short — <strong>15–20 words maximum</strong>. Long sentences lose readers.</li>
</ul>

<p>A compelling business description takes 20 minutes to write and works for you 24/7. Invest the time, get it right, and watch your click-through rates improve.</p>
`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Understanding Schema Markup for Local Businesses
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "schema-markup-local-business-guide",
    title: "Understanding Schema Markup for Local Businesses: A Practical Guide",
    description:
      "Learn what schema markup is, which types matter for local businesses, how to implement JSON-LD structured data, and how to test it — with free generator tools.",
    category: "Technical SEO",
    author: AUTHOR,
    publishedAt: "2026-07-08",
    readingTime: "8 min read",
    featuredImage: "/images/article-schema-markup.png",
    content: `
<h2 id="what-is-schema">What Is Schema Markup?</h2>

<p><strong>Schema markup</strong> (also called structured data) is a standardized vocabulary of tags you add to your website's HTML to help search engines understand your content. Defined by <a href="https://schema.org" target="_blank" rel="noopener">Schema.org</a> — a collaboration between Google, Bing, Yahoo, and Yandex — it translates human-readable information into machine-readable data.</p>

<p>When Google understands your content, it can display <strong>rich results</strong>: star ratings, business hours, FAQ dropdowns, event dates, recipe cards, and more. These enhanced listings get significantly more clicks than standard blue links.</p>

<blockquote><strong>Stat:</strong> Pages with structured data receive up to <strong>30% more clicks</strong> than pages without it, according to a 2025 Search Engine Journal study.</blockquote>

<h2 id="why-local-business">Why Schema Matters for Local Businesses</h2>

<p>For local businesses, schema markup provides three key advantages:</p>

<ol>
  <li><strong>Rich results in search</strong> — your listing can show stars, hours, phone number, and address directly in Google.</li>
  <li><strong>Knowledge panel data</strong> — Google's knowledge panel pulls from structured data to display your business info.</li>
  <li><strong>Voice search optimization</strong> — when someone asks "Hey Google, what time does Joe's Pizza close?" Google reads your schema data.</li>
</ol>

<h2 id="schema-types">Schema Types Every Local Business Should Use</h2>

<h3>1. LocalBusiness Schema</h3>
<p>This is the foundation. It tells Google your business name, address, phone number, hours, geo-coordinates, payment methods, and more. Every local business website should have this.</p>

<p>Generate yours instantly with our <a href="/tools/local-business-schema-generator">Local Business Schema Generator</a>.</p>

<h3>2. Organization Schema</h3>
<p>Broader than LocalBusiness, Organization schema describes your company at a higher level — logo, social profiles, founding date, and contact information. It helps Google build a comprehensive knowledge panel.</p>

<p>Use our <a href="/tools/organization-schema-generator">Organization Schema Generator</a> to create it.</p>

<h3>3. FAQ Schema</h3>
<p>If your website has a FAQ section, wrapping it in FAQPage schema lets Google display expandable questions and answers directly in search results. This can dramatically increase your SERP real estate.</p>

<p>Build yours with our <a href="/tools/faq-schema-generator">FAQ Schema Generator</a>.</p>

<h3>4. Review / AggregateRating Schema</h3>
<p>Display star ratings in search results. If your site collects reviews, AggregateRating schema tells Google the average rating, review count, and best/worst rating. Note: Google has strict guidelines — only use this for genuine, first-party reviews.</p>

<p>Create it with the <a href="/tools/review-schema-generator">Review Schema Generator</a>.</p>

<h3>5. Service Schema</h3>
<p>Service businesses (plumbers, lawyers, consultants) can describe individual services with descriptions, pricing, and availability. This helps Google match your page to service-specific queries.</p>

<p>Try our <a href="/tools/service-schema-generator">Service Schema Generator</a>.</p>

<h3>6. Breadcrumb Schema</h3>
<p>Breadcrumb markup shows your site hierarchy in search results (Home &gt; Services &gt; Plumbing). This improves navigation understanding and click-through rate.</p>

<p>Generate it with the <a href="/tools/breadcrumb-schema-generator">Breadcrumb Schema Generator</a>.</p>

<table>
  <thead>
    <tr><th>Schema Type</th><th>Best For</th><th>Rich Result Type</th></tr>
  </thead>
  <tbody>
    <tr><td>LocalBusiness</td><td>All local businesses</td><td>Knowledge panel, Maps</td></tr>
    <tr><td>Organization</td><td>Companies with a brand presence</td><td>Knowledge panel, logo</td></tr>
    <tr><td>FAQPage</td><td>Pages with Q&amp;A content</td><td>Expandable FAQ in SERP</td></tr>
    <tr><td>AggregateRating</td><td>Businesses with reviews</td><td>Star ratings in SERP</td></tr>
    <tr><td>Service</td><td>Service-based businesses</td><td>Service details</td></tr>
    <tr><td>BreadcrumbList</td><td>Multi-page websites</td><td>Breadcrumb trail in SERP</td></tr>
    <tr><td>Product</td><td>E-commerce, retail</td><td>Price, availability, ratings</td></tr>
    <tr><td>Event</td><td>Businesses hosting events</td><td>Date, venue, tickets</td></tr>
  </tbody>
</table>

<h2 id="json-ld">How to Implement Schema with JSON-LD</h2>

<p>Google recommends <strong>JSON-LD</strong> (JavaScript Object Notation for Linked Data) as the preferred format for structured data. It lives in a <code>&lt;script&gt;</code> tag in your page's <code>&lt;head&gt;</code> and does not affect your visible content.</p>

<h3>Example: Minimal LocalBusiness Schema</h3>

<p>Here is what a basic LocalBusiness JSON-LD looks like:</p>

<pre style="background:#f8f9fa;padding:16px;border-radius:6px;overflow-x:auto;font-size:13px;line-height:1.5;border:1px solid #e0e0e0;"><code>{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Joe's Pizza",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "New York",
    "addressRegion": "NY",
    "postalCode": "10001",
    "addressCountry": "US"
  },
  "telephone": "+1-212-555-0100",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "11:00",
      "closes": "22:00"
    }
  ],
  "url": "https://joespizza.com",
  "image": "https://joespizza.com/storefront.jpg"
}</code></pre>

<h3>Where to Place It</h3>
<p>Paste the <code>&lt;script type="application/ld+json"&gt;...&lt;/script&gt;</code> block in your page's <code>&lt;head&gt;</code> section. If you use a CMS like WordPress, plugins like Yoast or Rank Math can inject it for you. If you have a static site, paste it manually or use our generators to create the code.</p>

<h2 id="testing">How to Test Your Schema Markup</h2>

<p>Always validate your structured data before and after deployment:</p>

<ol>
  <li><strong>Google Rich Results Test</strong> — <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener">search.google.com/test/rich-results</a> — shows which rich results your page is eligible for.</li>
  <li><strong>Schema Markup Validator</strong> — <a href="https://validator.schema.org/" target="_blank" rel="noopener">validator.schema.org</a> — checks for syntax errors in any schema format.</li>
  <li><strong>Google Search Console</strong> — the "Enhancements" section shows schema errors and warnings across your entire site.</li>
</ol>

<h2 id="common-mistakes">Common Schema Mistakes to Avoid</h2>

<ul>
  <li><strong>Using schema for content not visible on the page.</strong> Google requires that structured data reflects content users can actually see. Hidden or misleading schema is a policy violation.</li>
  <li><strong>Incorrect business type.</strong> Use the most specific type: "Dentist" instead of "MedicalBusiness," "ItalianRestaurant" instead of "Restaurant."</li>
  <li><strong>Missing required properties.</strong> Each schema type has required and recommended fields. Missing required fields prevents rich results.</li>
  <li><strong>Fake reviews in AggregateRating.</strong> Google can issue manual actions (penalties) for fabricated review data.</li>
  <li><strong>Not updating schema after business changes.</strong> If you change your hours, phone number, or address, update your schema too.</li>
</ul>

<h2 id="getting-started">Getting Started: Use Our Free Generators</h2>

<p>You do not need to write JSON-LD by hand. Our free schema generators produce valid, ready-to-use code:</p>

<ul>
  <li><a href="/tools/local-business-schema-generator">Local Business Schema Generator</a></li>
  <li><a href="/tools/organization-schema-generator">Organization Schema Generator</a></li>
  <li><a href="/tools/faq-schema-generator">FAQ Schema Generator</a></li>
  <li><a href="/tools/article-schema-generator">Article Schema Generator</a></li>
  <li><a href="/tools/product-schema-generator">Product Schema Generator</a></li>
  <li><a href="/tools/review-schema-generator">Review Schema Generator</a></li>
  <li><a href="/tools/service-schema-generator">Service Schema Generator</a></li>
  <li><a href="/tools/breadcrumb-schema-generator">Breadcrumb Schema Generator</a></li>
  <li><a href="/tools/event-schema-generator">Event Schema Generator</a></li>
</ul>

<p>Pick the schema types relevant to your business, generate the code, paste it into your site, and validate with Google's tools. The whole process takes less than 30 minutes and the SEO benefits are permanent.</p>
`,
  },
];

const SLUG_INDEX = new Map(ARTICLES.map((a) => [a.slug, a]));

export function getAllArticles(): Article[] {
  return ARTICLES;
}

export function getArticle(slug: string): Article | undefined {
  return SLUG_INDEX.get(slug);
}

export function getRelatedArticles(slug: string, limit = 3): Article[] {
  const article = getArticle(slug);
  if (!article) return [];

  const sameCategory = ARTICLES.filter(
    (a) => a.slug !== slug && a.category === article.category,
  );

  const others = ARTICLES.filter(
    (a) => a.slug !== slug && a.category !== article.category,
  );

  return [...sameCategory, ...others].slice(0, limit);
}
