/** Current live me-HR SEO defaults — seeded into Mongo for agency management. */

export const DEFAULT_ROBOTS_TXT = `# me-HR — https://www.me-hr.com
User-agent: *
Allow: /

# AI / answer-engine crawlers (AEO / LLM visibility)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: https://www.me-hr.com/sitemap.xml
Host: https://www.me-hr.com
`;

export const DEFAULT_LLMS_TXT = `# me-HR

> Pune-based HR outsourcing firm offering On-Demand HR, Resident (fractional) HR, Strategic HR Consulting, and Payroll Outsourcing for growing businesses across India. HRMS support for KEKA, HROne and greytHR.

## Site
- Homepage: https://www.me-hr.com/
- About: https://www.me-hr.com/about
- Services: https://www.me-hr.com/services
- Contact: https://www.me-hr.com/contact
- Insights: https://www.me-hr.com/media
- Careers: https://www.me-hr.com/careers

## Services
- On-Demand HR: https://www.me-hr.com/services/on-demand-hr
- Resident HR (fractional / retainership): https://www.me-hr.com/services/hr-retainership
- Strategic HR Consulting: https://www.me-hr.com/services/strategic-consulting
- Payroll Outsourcing: https://www.me-hr.com/pagar

## Contact
- Email: ask@me-hr.com
- Phone: +91 8600898604
- Address: 1 Floor, Thread Works, 1156 Saifee Lane, MG Road, near 1000 Oaks Restaurant, Pune, Maharashtra 411001, India
- Founded: 2018 | Founder & Director: Sonia Patra

## Optional
- Sitemap: https://www.me-hr.com/sitemap.xml
- Robots: https://www.me-hr.com/robots.txt
`;

export const DEFAULT_GLOBAL = {
  key: "global",
  siteName: "me-HR",
  siteUrl: "https://www.me-hr.com",
  defaultTitle: "HR Outsourcing & Resident HR Company in Pune | me-HR",
  defaultDescription:
    "me-HR is a Pune HR outsourcing firm offering On-Demand HR, Resident (fractional) HR, Strategic HR Consulting and Payroll Outsourcing with KEKA, HROne and greytHR support.",
  defaultKeywords: [
    "HR outsourcing services in Pune",
    "best HR services in Pune",
    "Resident HR",
    "fractional HR Pune",
    "KEKA HRMS",
    "HROne",
    "greytHR",
  ],
  defaultOgImage: "/logo1.png",
  gaMeasurementId: "G-VQYS9NB7V8",
  robotsTxt: DEFAULT_ROBOTS_TXT,
  llmsTxt: DEFAULT_LLMS_TXT,
  aeoNotes:
    "Keep llms.txt accurate. Allow AI crawlers in robots.txt. Prefer clear H1s, FAQ blocks with schema, and concise answer-style intros on service pages for AEO / AI Overviews.",
  organizationJsonLd: JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "me-HR",
      url: "https://www.me-hr.com",
      email: "ask@me-hr.com",
      telephone: "+91 8600898604",
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "1 Floor, Thread Works, 1156 Saifee Lane, MG Road, near 1000 Oaks Restaurant",
        addressLocality: "Pune",
        addressRegion: "Maharashtra",
        postalCode: "411001",
        addressCountry: "IN",
      },
      sameAs: [
        "https://www.linkedin.com/company/me-hr",
        "https://www.instagram.com/_me_hr/",
      ],
      knowsAbout: [
        "HR outsourcing",
        "On-Demand HR",
        "Resident HR",
        "Fractional HR",
        "Strategic HR Consulting",
        "Payroll Outsourcing",
        "KEKA HRMS",
        "HROne",
        "greytHR",
      ],
    },
    null,
    2
  ),
};

/** @type {Array<Record<string, unknown>>} */
export const DEFAULT_SEO_PAGES = [
  {
    path: "/",
    label: "Home",
    title: "HR Outsourcing & Resident HR Company in Pune | me-HR",
    description:
      "me-HR is among Pune’s trusted HR outsourcing partners for growing SMEs — On-Demand HR, Resident (fractional) HR, virtual HR, Strategic Consulting and Payroll Outsourcing with PF/ESIC. KEKA, HROne & greytHR support. Book a consultation.",
    focusKeyword: "HR outsourcing company in Pune",
    keywords: [
      "best HR services in Pune",
      "HR outsourcing services in Pune",
      "HR outsourcing company Pune",
      "fractional HR Pune",
      "Resident HR",
      "virtual HR services Pune",
      "KEKA HRMS",
      "HROne",
      "greytHR",
    ],
    priority: 1,
    changefreq: "weekly",
  },
  {
    path: "/about",
    label: "About",
    title: "About me-HR | HR Outsourcing Company in Pune Since 2018",
    description:
      "Founded in Pune in 2018 by Sonia Patra, me-HR is your extended HR arm for growing firms: practical HR systems, senior oversight, flexible On-Demand and Resident HR models, plus KEKA, HROne and greytHR implementation support.",
    focusKeyword: "HR outsourcing company Pune",
    keywords: ["HR outsourcing company Pune", "Resident HR", "KEKA HRMS", "me-HR Pune"],
    priority: 0.8,
  },
  {
    path: "/services",
    label: "Services",
    title: "HR Services in Pune: On-Demand, Resident HR & Consulting",
    description:
      "Explore me-HR’s HR services in Pune: On-Demand HR, Resident / fractional HR, virtual HR support, Strategic HR Consulting, Payroll Outsourcing and HRMS (KEKA, HROne, greytHR) for growing SMEs.",
    focusKeyword: "HR services in Pune",
    keywords: ["best HR services in Pune", "HR services Pune", "on-demand HR services", "KEKA HRMS"],
    priority: 0.9,
  },
  {
    path: "/services/on-demand-hr",
    label: "On-Demand HR",
    title: "On-Demand HR Services in Pune | Short-Term HR Support",
    description:
      "Need HR bandwidth for 3–7 days, 1–4 weeks or 1–3 months? me-HR provides on-demand / outsourced HR for SMEs — hiring drives, documentation backlogs and project work in Pune.",
    focusKeyword: "on-demand HR services",
    keywords: ["on-demand HR services", "outsourced HR for SMEs", "temporary HR support"],
    priority: 0.85,
  },
  {
    path: "/services/hr-retainership",
    label: "Resident HR",
    title: "Resident HR (Fractional HR) Services in Pune | me-HR",
    description:
      "Embedded Resident / fractional HR and virtual HR support for day-to-day operations with senior oversight. Part-time HR director alternative for growing businesses in Pune.",
    focusKeyword: "fractional HR Pune",
    keywords: ["Resident HR", "fractional HR Pune", "virtual HR services Pune", "part-time HR director"],
    priority: 0.85,
  },
  {
    path: "/services/strategic-consulting",
    label: "Strategic Consulting",
    title: "Strategic HR Consulting & HR Audit in Pune | me-HR",
    description:
      "HR consultant and HR audit services in Pune: organisation design, KRA/KPI systems and leadership challenges. Project-based strategic HR consulting.",
    focusKeyword: "HR audit services Pune",
    keywords: ["HR consultant Pune", "HR audit services Pune", "strategic HR consulting"],
    priority: 0.85,
  },
  {
    path: "/pagar",
    label: "Payroll (Pagar)",
    title: "Payroll Outsourcing & PF ESIC Compliance in Pune | me-HR",
    description:
      "Payroll outsourcing company support in Pune: accurate payroll with PF, ESIC, PT and LWF statutory compliance. KEKA, HROne and greytHR payroll support.",
    focusKeyword: "payroll outsourcing company Pune",
    keywords: [
      "payroll outsourcing company Pune",
      "statutory compliance outsourcing",
      "PF ESIC PT compliance",
      "KEKA payroll",
    ],
    priority: 0.85,
  },
  {
    path: "/pricing",
    label: "Pricing",
    title: "HR Outsourcing Pricing in Pune: Flexible Plans | me-HR",
    description:
      "Pay for the HR support you need: On-Demand HR, Resident / fractional HR, Strategic Consulting or Payroll Outsourcing. Request a quote.",
    focusKeyword: "HR outsourcing pricing",
    keywords: ["HR outsourcing pricing", "on-demand HR pricing", "Resident HR pricing"],
    priority: 0.7,
  },
  {
    path: "/case-studies",
    label: "Case studies",
    title: "HR Case Studies: HR Systems & Digitisation | me-HR",
    description:
      "See how me-HR digitised HR processes and built HR systems for growing businesses — including HRMS (KEKA) led outcomes.",
    focusKeyword: "HR case studies",
    keywords: ["HR case studies", "HR outsourcing case studies", "KEKA HRMS case study"],
    priority: 0.7,
  },
  {
    path: "/media",
    label: "Insights / Media",
    title: "HR Insights & Thought Leadership | me-HR",
    description:
      "Practical HR thinking on structured HR, fractional HR, virtual HR, payroll compliance, KEKA/HROne/greytHR and engagement for leaders of growing organisations.",
    focusKeyword: "HR insights",
    keywords: ["HR insights", "fractional HR Pune", "KEKA HRMS insights"],
    priority: 0.8,
    changefreq: "daily",
  },
  {
    path: "/careers",
    label: "Careers",
    title: "Careers & Job Openings in Pune | me-HR",
    description:
      "Join me-HR or apply to open roles: HR careers in Pune across outsourcing, recruitment, operations and KEKA HRMS delivery.",
    focusKeyword: "HR jobs Pune",
    keywords: ["HR jobs Pune", "HR careers Pune", "KEKA HRMS jobs"],
    priority: 0.6,
  },
  {
    path: "/contact",
    label: "Contact",
    title: "Contact me-HR | HR Consultants in Pune (MG Road)",
    description:
      "Talk to me-HR — HR consultants on MG Road, Pune — for HR outsourcing, Resident HR, payroll and KEKA / HROne / greytHR support. Call +91 8600898604.",
    focusKeyword: "HR consultant Pune",
    keywords: ["HR consultant Pune", "best HR services in Pune", "me hr pune", "KEKA HRMS Pune"],
    priority: 0.8,
  },
  {
    path: "/faqs",
    label: "FAQs",
    title: "HR Outsourcing FAQs | me-HR Pune",
    description:
      "Answers on HR outsourcing, On-Demand HR, Resident / fractional HR, payroll outsourcing, PF/ESIC compliance and HRMS platforms like KEKA.",
    focusKeyword: "HR outsourcing FAQs",
    keywords: ["HR outsourcing FAQs", "on-demand HR FAQ", "KEKA HRMS FAQ"],
    priority: 0.6,
  },
  {
    path: "/life",
    label: "Life at me-HR",
    title: "Life at me-HR | HR Careers Culture in Pune",
    description:
      "At me-HR, people are at the heart of the work we do. Explore growth, collaboration and careers with our HR team in Pune.",
    focusKeyword: "life at me-HR",
    keywords: ["life at me-HR", "HR culture Pune"],
    priority: 0.5,
  },
  {
    path: "/privacy-policy",
    label: "Privacy",
    title: "Privacy Policy | me-HR",
    description:
      "Read how me-HR collects, uses and protects personal information when you use our website or engage our HR services.",
    focusKeyword: "me-HR privacy policy",
    keywords: ["me-HR privacy policy"],
    robots: "noindex,follow",
    noIndex: true,
    priority: 0.2,
  },
  {
    path: "/terms-and-conditions",
    label: "Terms",
    title: "Terms and Conditions | me-HR",
    description:
      "Terms and conditions for using the me-HR website and engaging with our HR outsourcing and consulting services.",
    focusKeyword: "me-HR terms",
    keywords: ["me-HR terms and conditions"],
    robots: "noindex,follow",
    noIndex: true,
    priority: 0.2,
  },
];
