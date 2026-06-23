"""Generate src/lib/category-registry.ts from the master category tree."""

from __future__ import annotations

import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "lib" / "category-registry.ts"

TREE: list[tuple[str, list[str]]] = [
    (
        "Business & Professional Services",
        [
            "Accountants",
            "Bookkeepers",
            "Business Consultants",
            "Marketing Agencies",
            "Advertising Agencies",
            "Public Relations Agencies",
            "Printing Services",
            "Staffing Agencies",
            "Recruitment Agencies",
            "Virtual Assistants",
            "Translation Services",
            "Notary Services",
        ],
    ),
    (
        "Home Services",
        [
            "Roofing",
            "Plumbing",
            "HVAC",
            "Electricians",
            "Cleaning Services",
            "Pest Control",
            "Landscaping",
            "Lawn Care",
            "Handyman",
            "Painting Contractors",
            "Flooring Contractors",
            "Window Installation",
            "Garage Door Services",
            "Pool Services",
            "Solar Installation",
            "Fencing Contractors",
        ],
    ),
    (
        "Construction & Trades",
        [
            "General Contractors",
            "Home Builders",
            "Commercial Builders",
            "Architects",
            "Interior Designers",
            "Concrete Contractors",
            "Excavation Contractors",
            "Masonry Contractors",
            "Remodeling Contractors",
            "Demolition Services",
        ],
    ),
    (
        "Health & Medical",
        [
            "Hospitals",
            "Medical Clinics",
            "Dentists",
            "Orthodontists",
            "Dermatologists",
            "Eye Care Centers",
            "Optometrists",
            "Physiotherapists",
            "Chiropractors",
            "Mental Health Services",
            "Pharmacies",
            "Urgent Care Centers",
            "Diagnostic Centers",
        ],
    ),
    (
        "Legal Services",
        [
            "Personal Injury Lawyers",
            "Family Lawyers",
            "Divorce Lawyers",
            "Criminal Defense Lawyers",
            "Immigration Lawyers",
            "Business Lawyers",
            "Estate Planning Lawyers",
            "Bankruptcy Lawyers",
            "Employment Lawyers",
        ],
    ),
    (
        "Real Estate",
        [
            "Real Estate Agents",
            "Real Estate Brokers",
            "Property Management",
            "Home Inspectors",
            "Mortgage Brokers",
            "Commercial Real Estate",
            "Property Developers",
            "Real Estate Appraisers",
        ],
    ),
    (
        "Automotive",
        [
            "Auto Repair",
            "Car Dealerships",
            "Used Car Dealers",
            "Auto Parts Stores",
            "Car Wash",
            "Auto Detailing",
            "Tire Shops",
            "Towing Services",
            "Motorcycle Repair",
            "Auto Body Shops",
        ],
    ),
    (
        "Restaurants & Food",
        [
            "Restaurants",
            "Cafes",
            "Bakeries",
            "Pizza Restaurants",
            "Fast Food Restaurants",
            "Catering Services",
            "Food Delivery Services",
            "Ice Cream Shops",
            "Bars",
            "Coffee Shops",
        ],
    ),
    (
        "Shopping & Retail",
        [
            "Clothing Stores",
            "Shoe Stores",
            "Jewelry Stores",
            "Furniture Stores",
            "Electronics Stores",
            "Grocery Stores",
            "Gift Shops",
            "Pet Stores",
            "Toy Stores",
            "Department Stores",
        ],
    ),
    (
        "Beauty & Wellness",
        [
            "Hair Salons",
            "Barbershops",
            "Spas",
            "Massage Therapists",
            "Nail Salons",
            "Makeup Artists",
            "Tattoo Studios",
            "Skincare Clinics",
        ],
    ),
    (
        "Education",
        [
            "Schools",
            "Colleges",
            "Universities",
            "Coaching Centers",
            "Online Learning Platforms",
            "Language Schools",
            "Music Schools",
            "Tutoring Services",
        ],
    ),
    (
        "Technology",
        [
            "Software Companies",
            "Web Design Agencies",
            "Web Development Agencies",
            "SEO Agencies",
            "Digital Marketing Agencies",
            "IT Support",
            "Cybersecurity Services",
            "Managed IT Services",
            "Mobile App Development",
            "Web Hosting Providers",
        ],
    ),
    (
        "Finance & Insurance",
        [
            "Financial Advisors",
            "Tax Services",
            "Insurance Agencies",
            "Loan Providers",
            "Investment Advisors",
            "Credit Repair Services",
            "Mortgage Lenders",
        ],
    ),
    (
        "Travel & Hospitality",
        [
            "Hotels",
            "Resorts",
            "Travel Agencies",
            "Tour Operators",
            "Vacation Rentals",
            "Car Rental Services",
            "Hostels",
            "Bed & Breakfasts",
        ],
    ),
    (
        "Events & Weddings",
        [
            "Wedding Planners",
            "Event Planners",
            "Photographers",
            "Videographers",
            "DJs",
            "Event Venues",
            "Catering Services",
            "Party Rentals",
            "Florists",
        ],
    ),
    (
        "Pets & Animals",
        [
            "Veterinarians",
            "Pet Grooming",
            "Pet Boarding",
            "Pet Training",
            "Pet Stores",
            "Animal Shelters",
        ],
    ),
    (
        "Fitness & Sports",
        [
            "Gyms",
            "Fitness Centers",
            "Yoga Studios",
            "Personal Trainers",
            "Martial Arts Schools",
            "Sports Clubs",
            "Swimming Pools",
            "Dance Studios",
        ],
    ),
    (
        "Entertainment",
        [
            "Movie Theaters",
            "Gaming Centers",
            "Escape Rooms",
            "Nightclubs",
            "Music Venues",
            "Amusement Parks",
            "Bowling Centers",
        ],
    ),
    (
        "Local Services",
        [
            "Locksmiths",
            "Movers",
            "Storage Facilities",
            "Courier Services",
            "Security Services",
            "Waste Removal",
            "Dry Cleaners",
            "Laundry Services",
        ],
    ),
    (
        "Manufacturing & Industrial",
        [
            "Manufacturers",
            "Distributors",
            "Wholesalers",
            "Industrial Equipment Suppliers",
            "Packaging Companies",
            "Logistics Companies",
        ],
    ),
    (
        "Agriculture",
        [
            "Farms",
            "Agricultural Equipment",
            "Livestock Services",
            "Seed Suppliers",
            "Fertilizer Suppliers",
        ],
    ),
    (
        "Government & Public Services",
        [
            "Government Offices",
            "Public Libraries",
            "Post Offices",
            "Public Utilities",
            "Municipal Services",
        ],
    ),
    (
        "Religious & Community",
        [
            "Temples",
            "Churches",
            "Mosques",
            "Gurudwaras",
            "Non-Profit Organizations",
            "Community Centers",
        ],
    ),
    (
        "Media & Advertising",
        [
            "Newspapers",
            "Magazines",
            "Radio Stations",
            "TV Stations",
            "Content Marketing Agencies",
            "Advertising Agencies",
        ],
    ),
    (
        "Recruitment & Jobs",
        [
            "Job Boards",
            "Recruitment Agencies",
            "Career Coaches",
            "Resume Writing Services",
            "Staffing Companies",
        ],
    ),
    (
        "E-Commerce & Online Services",
        [
            "Online Stores",
            "SaaS Companies",
            "Domain Registrars",
            "Web Hosting Providers",
            "Marketplace Platforms",
            "Subscription Services",
        ],
    ),
]

LEGACY_HOME_SUBCATEGORIES = [
    ("hvac-contractor", "HVAC Contractor"),
    ("heating-contractor", "Heating Contractor"),
    ("ac-repair", "AC Repair"),
    ("ac-contractor", "AC Contractor"),
    ("plumbing-hvac", "Plumbing & HVAC"),
    ("air-duct-cleaning", "Air Duct Cleaning"),
    ("hvac-parts-supplier", "HVAC Parts Supplier"),
    ("insulation-contractor", "Insulation Contractor"),
]

HIDDEN_LEGACY = [
    ("roofing-contractor", "Roofing Contractor", "roofing"),
    ("pest-control-service", "Pest Control Service", "pest-control"),
]


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[-\s]+", "-", text).strip("-")


def vertical_slug(label: str) -> str:
    return slugify(label)


def search_tags(label: str, subs: list[str]) -> list[str]:
    tags = [subs[0], subs[1] if len(subs) > 1 else label]
    if len(subs) > 2:
        tags.append(subs[2])
    return tags


def emit() -> None:
    lines: list[str] = [
        "/** Auto-generated by scripts/generate_category_registry.py — do not edit by hand. */",
        "",
        "export type SubcategoryDef = {",
        "  slug: string;",
        "  label: string;",
        "  legacy?: boolean;",
        "};",
        "",
        "export type VerticalDef = {",
        "  slug: string;",
        "  label: string;",
        "  navLabel: string;",
        "  searchTags: string[];",
        "  subcategories: SubcategoryDef[];",
        "  legacy?: boolean;",
        "};",
        "",
        "export const CATEGORY_REGISTRY: VerticalDef[] = [",
    ]

    for vertical_label, subs in TREE:
        vslug = vertical_slug(vertical_label)
        tags = search_tags(vertical_label, subs)
        lines.append("  {")
        lines.append(f'    slug: "{vslug}",')
        lines.append(f'    label: "{vertical_label}",')
        lines.append(f'    navLabel: "{vertical_label} Texas",')
        lines.append(f"    searchTags: {tags!r},")
        lines.append("    subcategories: [")

        seen: set[str] = set()
        for sub in subs:
            sslug = slugify(sub)
            if sslug in seen:
                sslug = f"{sslug}-service"
            seen.add(sslug)
            lines.append(f'      {{ slug: "{sslug}", label: "{sub}" }},')

        if vslug == "home-services":
            for sslug, label in LEGACY_HOME_SUBCATEGORIES:
                if sslug not in seen:
                    lines.append(
                        f'      {{ slug: "{sslug}", label: "{label}", legacy: true }},'
                    )
                    seen.add(sslug)

        lines.append("    ],")
        lines.append("  },")

    lines.append("];")
    lines.append("")
    lines.append("/** Legacy vertical slug kept for /hvac routes and imported data filters. */")
    lines.append('export const LEGACY_HVAC_VERTICAL = "hvac";')
    lines.append("")
    lines.append("export const HVAC_CATEGORY_SLUGS = new Set([")
    lines.append('  "hvac",')
    for sslug, _ in LEGACY_HOME_SUBCATEGORIES:
        lines.append(f'  "{sslug}",')
    lines.append("]);")
    lines.append("")
    lines.append("export const HIDDEN_LEGACY_VERTICALS: VerticalDef[] = [")
    for sslug, label, vslug in HIDDEN_LEGACY:
        lines.append("  {")
        lines.append(f'    slug: "{vslug}",')
        lines.append(f'    label: "{label.split()[0]}",')
        lines.append(f'    navLabel: "{label} Texas",')
        lines.append(f"    searchTags: {[label]!r},")
        lines.append("    legacy: true,")
        lines.append("    subcategories: [")
        lines.append(f'      {{ slug: "{sslug}", label: "{label}", legacy: true }},')
        lines.append("    ],")
        lines.append("  },")
    lines.append("];")
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT} ({len(TREE)} verticals)")


if __name__ == "__main__":
    emit()
