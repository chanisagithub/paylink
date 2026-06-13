export const marketingCopy = {
  brand: {
    eyebrow: "Merchant Payment Infrastructure",
    name: "PayLink",
  },
  hero: {
    kicker: "Launch branded links fast",
    title: "Sell with polished payment links that feel like your own product.",
    description:
      "PayLink gives merchants branded payment pages, fast checkout, and the analytics layer they need to understand views, conversions, and revenue in one place.",
  },
  preview: {
    label: "Live merchant snapshot",
    amount: "$12,480",
    badge: "Realtime ready",
    metrics: [
      { label: "Monthly revenue", value: "$12.4k" },
      { label: "Payment links", value: "18 active" },
      { label: "Average conversion", value: "7.3%" },
    ],
  },
  actions: {
    login: "Log In",
    signup: "Create Account",
    getStarted: "Get Started",
    previewDashboard: "Go to Dashboard",
  },
} as const;

export const authCopy = {
  brandLabel: "PayLink Auth",
  highlights: [
    {
      title: "Supabase SSR sessions",
      description: "Auth state is persisted with cookie-aware server rendering.",
    },
    {
      title: "Typed validation",
      description: "React Hook Form and Zod enforce the same rules client-side.",
    },
    {
      title: "Route protection",
      description: "Protected dashboard routes are redirected before render.",
    },
  ],
  login: {
    eyebrow: "Merchant access",
    title: "Log in to your dashboard",
    description:
      "Manage payment links, monitor revenue, and keep your merchant workspace secure.",
    altLabel: "Need a merchant account?",
    altAction: "Create one now",
  },
  signup: {
    eyebrow: "Launch PayLink",
    title: "Create your merchant workspace",
    description:
      "Set up your brand, authenticate with Supabase, and prepare the dashboard for payment link creation.",
    altLabel: "Already have an account?",
    altAction: "Log in here",
  },
  fields: {
    businessName: {
      label: "Business name",
      placeholder: "North Star Studio",
    },
    email: {
      label: "Email address",
      placeholder: "merchant@example.com",
    },
    password: {
      label: "Password",
      placeholder: "Create a secure password",
    },
    confirmPassword: {
      label: "Confirm password",
      placeholder: "Re-enter your password",
    },
  },
  actions: {
    login: "Log In",
    loggingIn: "Signing you in...",
    signup: "Create Account",
    creatingAccount: "Creating workspace...",
  },
  feedback: {
    loginSuccess: "You are signed in.",
    loginError: "Unable to sign in with those credentials.",
    signupSuccess: "Your merchant workspace is ready.",
    signupPendingVerification:
      "Check your inbox to verify the account before logging in.",
    signupError: "Unable to create the merchant workspace.",
  },
} as const;

export const dashboardCopy = {
  brandLabel: "Merchant Console",
  nav: {
    overview: "Overview",
    links: "Payment Links",
  },
  sidebar: {
    businessName: "Business",
    fallbackBusinessName: "Unconfigured merchant",
  },
  overview: {
    eyebrow: "Merchant performance",
    title: "Revenue, links, and conversion in one place.",
    description:
      "Track completed payments, monitor link performance, and understand how views convert into paid checkouts.",
    nextStepTitle: "Performance snapshot",
    nextStepDescription:
      "Metrics update from live payment, view, and link records synced from Supabase and Stripe webhooks.",
  },
  stats: {
    revenue: "Total revenue",
    links: "Total links",
    views: "Total views",
    conversion: "Average conversion",
  },
  actions: {
    signOut: "Sign out",
  },
  feedback: {
    signOutSuccess: "Your session has been closed.",
    signOutError: "Unable to sign out right now.",
  },
  errors: {
    loadStats: "Unable to load dashboard stats.",
  },
} as const;

export const linkCopy = {
  overview: {
    eyebrow: "Payment Links",
    title: "Create and manage your checkout links",
    description:
      "Generate branded payment links, share them instantly, and prepare analytics-ready records for your dashboard.",
    createAction: "Create link",
  },
  form: {
    title: "New payment link",
    description:
      "Configure pricing, slug, and branding. Changes are previewed live before publishing.",
    steps: {
      details: "Link details",
      branding: "Branding & publish",
    },
    fields: {
      title: {
        label: "Title",
        placeholder: "Coffee Consultation",
      },
      description: {
        label: "Description",
        placeholder: "45-minute strategy call with follow-up notes.",
      },
      amount: {
        label: "Amount",
        placeholder: "99.00",
      },
      currency: {
        label: "Currency",
      },
      expiresAt: {
        label: "Expiry date",
      },
      slug: {
        label: "Slug",
        placeholder: "coffee-consultation-x7k2",
      },
      isActive: {
        label: "Link is active",
      },
      brandColor: {
        label: "Brand color",
      },
    },
    actions: {
      next: "Next",
      back: "Back",
      backToLinks: "Back to links",
      create: "Create payment link",
      creating: "Creating payment link...",
      save: "Save changes",
      saving: "Saving changes...",
    },
    feedback: {
      slugChecking: "Checking slug availability...",
      slugAvailable: "Slug is available.",
      slugUnavailable: "Slug is taken. Pick another slug.",
      createSuccess: "Payment link created successfully.",
      updateSuccess: "Payment link updated successfully.",
      copySuccess: "Link copied to clipboard.",
      copyError: "Unable to copy right now.",
    },
  },
  preview: {
    titleFallback: "Payment title preview",
    descriptionFallback: "Payment description will appear here for customers.",
    amountLabel: "Amount",
    slugLabel: "Slug",
    statusLabel: "Status",
    expiresLabel: "Expires",
    active: "Active",
    inactive: "Inactive",
    fallbackSlug: "payment-link-x7k2",
  },
  list: {
    emptyTitle: "No links yet",
    emptyDescription: "Create your first payment link to start collecting payments.",
    table: {
      title: "Title",
      amount: "Amount",
      views: "Views",
      payments: "Payments",
      conversion: "Conversion",
      slug: "Slug",
      status: "Status",
      createdAt: "Created",
      actions: "Actions",
    },
    status: {
      active: "Active",
      inactive: "Inactive",
    },
    deleteConfirm: {
      title: "Delete this payment link?",
      description:
        "This permanently removes the link and its slug. Links with payment history can't be deleted — deactivate them instead.",
      confirm: "Delete link",
      deleting: "Deleting...",
      cancel: "Cancel",
    },
  },
  actions: {
    copy: "Copy link",
    edit: "Edit",
    analytics: "View analytics",
    activate: "Activate",
    deactivate: "Deactivate",
    delete: "Delete",
  },
  filters: {
    searchPlaceholder: "Search by title or slug",
    statusAll: "All statuses",
    statusActive: "Active only",
    statusInactive: "Inactive only",
  },
  analytics: {
    title: "Link analytics",
    subtitle: "Views, payment outcomes, and recent customers for this link.",
    viewsChartTitle: "Views over time",
    statusChartTitle: "Payment status breakdown",
    recentPaymentsTitle: "Recent payments",
    noPayments: "No payments recorded yet.",
    shareLabel: "Share URL",
  },
  share: {
    title: "Your payment link is live",
    description: "Share this URL with customers. QR is ready for invoices and social.",
    openAction: "Open link",
    copyAction: "Copy link",
    doneAction: "Done",
    qrAlt: "Payment link QR code",
  },
  errors: {
    unauthorized: "You must be logged in to manage links.",
    generic: "Something went wrong. Please try again.",
    notFound: "Payment link not found.",
    invalidPayload: "Invalid input. Please check the form and try again.",
    loadAnalytics: "Unable to load analytics for this link.",
    deleteBlockedByPayments:
      "This link has payment history. Deactivate it instead of deleting.",
  },
} as const;

export const payCopy = {
  page: {
    eyebrow: "Secure checkout",
    defaultMerchant: "PayLink Merchant",
    payNow: "Pay now",
    creatingSession: "Preparing checkout...",
    amountLabel: "Amount due",
    expiresLabel: "Expires",
    inactiveTitle: "This payment link is inactive",
    inactiveDescription:
      "The merchant has paused this link. Contact them for an updated payment URL.",
    expiredTitle: "This payment link has expired",
    expiredDescription:
      "This payment request is no longer available. Ask the merchant to issue a new one.",
    missingTitle: "Payment link not found",
    missingDescription:
      "This link may have been removed or the URL is incorrect.",
    createAccountCta: "Create your own PayLink account",
    poweredBy: "Powered by PayLink",
    securedByStripe: "Secured by Stripe",
    encryptedNote: "Payments are encrypted and processed securely by Stripe.",
    summaryLabel: "Order summary",
    totalLabel: "Total due",
    secureRedirectDescription:
      "You will be redirected to Stripe Checkout to complete payment securely.",
  },
  success: {
    title: "Payment complete",
    description:
      "Thanks for your payment. A confirmation email from Stripe should arrive shortly.",
    backToPay: "Back to payment page",
  },
  feedback: {
    checkoutError: "Unable to start checkout right now.",
  },
  errors: {
    invalidPayload: "Invalid payment request.",
    notFound: "Payment link not found.",
    inactive: "Payment link is inactive.",
    expired: "Payment link has expired.",
  },
} as const;
