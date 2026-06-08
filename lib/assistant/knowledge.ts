// AfroSmart AI Assistant knowledge base. These are the seeded defaults; admins
// can override/extend them in Firestore (collection `assistantKnowledge`) via
// the admin editor, so the bot can be updated without a deploy.

export interface KBEntry {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
  quickReplies?: string[];
}

export const DEFAULT_KB: KBEntry[] = [
  {
    id: "create-account",
    title: "How to create an account",
    keywords: ["create account", "sign up", "register", "new account", "join", "get started"],
    answer:
      "Creating an account is free and takes seconds:\n1. Tap *Sign in* (top right).\n2. Choose Liberia (+231) and enter your phone number.\n3. We text you a 6-digit code — enter it.\n4. Add your name and you're in!\nNo email or password needed.",
    quickReplies: ["How do I log in?", "How do I post an item?", "Login not working"],
  },
  {
    id: "login",
    title: "How to log in",
    keywords: ["log in", "login", "sign in", "verification code", "otp", "code", "verify"],
    answer:
      "To log in:\n1. Tap *Sign in*.\n2. Enter your phone number (Liberia +231).\n3. Enter the 6-digit code we text you.\nThe same step creates your account if you're new.",
    quickReplies: ["I didn't get a code", "Login not working", "How to create an account"],
  },
  {
    id: "login-trouble",
    title: "Login & verification troubleshooting",
    keywords: ["didn't get code", "no code", "not working", "cant login", "can't log in", "verification failed", "messenger", "facebook browser", "too many attempts"],
    answer:
      "If your code doesn't arrive:\n• If you opened AfroSmart from *Facebook/Messenger*, tap *Open in Chrome/Safari* — in-app browsers block verification.\n• Check the number is correct (e.g. 77 000 0000).\n• Wait 30 seconds, then tap *Resend code*.\n• If you tried many times, wait a few minutes (anti-spam lockout).",
    quickReplies: ["How to log in", "How to create an account"],
  },
  {
    id: "post-item",
    title: "How to post an item",
    keywords: ["post", "sell", "create listing", "add listing", "post item", "upload", "list something"],
    answer:
      "Posting is free:\n1. Tap *+ Post*.\n2. Add photos (camera or gallery).\n3. Pick a category.\n4. Add title, price, county/town & details.\n5. Review and tap *Publish*.\nYour listing goes live right away — share it on WhatsApp to sell faster.",
    quickReplies: ["Which category should I use?", "How to edit a listing", "Safety tips"],
  },
  {
    id: "edit-listing",
    title: "How to edit a listing",
    keywords: ["edit", "change listing", "update listing", "edit post", "change price"],
    answer:
      "To edit a listing:\n1. Go to *My Account → My Listings*.\n2. Tap the *⋮* menu on the listing.\n3. Tap *Edit* to change the title, price, location or details.",
    quickReplies: ["How to delete a listing", "How to mark as sold", "How to post an item"],
  },
  {
    id: "delete-listing",
    title: "How to delete or mark a listing sold",
    keywords: ["delete", "remove listing", "mark sold", "sold", "take down", "pause listing"],
    answer:
      "In *My Account → My Listings*, tap the *⋮* menu on a listing:\n• *Mark as Sold* — best choice; keeps your history and lets you relist later.\n• *Pause* — hide it temporarily.\n• *Delete* — remove it (asks you to confirm).",
    quickReplies: ["How to edit a listing", "How to post an item"],
  },
  {
    id: "contact-seller",
    title: "How to contact a seller",
    keywords: ["contact", "message seller", "call seller", "talk to seller", "reach seller", "phone number"],
    answer:
      "Open any listing and tap *Message seller* to chat in-app. If the seller chose to show their number, you'll also see a *Call* button. For your safety, keep first contact inside AfroSmart chat.",
    quickReplies: ["Safety tips", "Find a product", "Platform rules"],
  },
  {
    id: "categories",
    title: "Marketplace categories",
    keywords: ["categories", "category", "what can i buy", "what can i sell", "sections"],
    answer:
      "AfroSmart covers: Cars, Real Estate, Rentals, Land, Phones, Shops & Restaurants, Services, Fashion, Sports, Food & Agriculture — plus a Community board: *Free Stuff*, *Wanted / Looking For*, *Events*, *Lost & Found*, *Donations* and *Volunteers*. Tell me what you're looking for and I'll point you to it.",
    quickReplies: ["Free stuff near me", "Post a 'Looking for' request", "Find an event", "Report a lost item"],
  },
  {
    id: "community-board",
    title: "Free Stuff, Wanted, Events, Lost & Found, Donations & Volunteers",
    keywords: [
      "free", "free stuff", "giveaway", "give away", "wanted", "looking for",
      "i need", "request", "event", "events", "concert", "church program", "school activity",
      "lost", "found", "lost and found", "missing", "donation", "donations", "charity",
      "fundraiser", "fundraising", "volunteer", "volunteers", "community",
    ],
    answer:
      "Besides buying and selling, AfroSmart has a free Community board — and posting to it never needs a price:\n• *Free Stuff* — give away items for free (shown with a green FREE badge).\n• *Wanted / Looking For* — request a car, land, house, job, or a worker like a carpenter.\n• *Events* — community events, church programs, concerts, school activities, business events.\n• *Lost & Found* — report lost phones/documents or post items you found.\n• *Donations* — charity requests, fundraisers, community support.\n• *Volunteers* — volunteer opportunities and nonprofit projects.\nTo post: tap *+ Post*, then pick the matching category — no price required.",
    quickReplies: ["How to post an item", "Free stuff near me", "Find an event"],
  },
  {
    id: "safety",
    title: "Basic safety tips",
    keywords: ["safety", "safe", "scam", "fraud", "secure", "protect", "trust"],
    answer:
      "Stay safe:\n• Meet in a public place during the day.\n• Inspect the item before paying.\n• Don't send money in advance to people you haven't met.\n• Keep chats inside AfroSmart.\n• Report anything suspicious with the *Report* button.",
    quickReplies: ["Platform rules", "How to contact a seller"],
  },
  {
    id: "rules",
    title: "AfroSmart platform rules",
    keywords: ["rules", "policy", "allowed", "not allowed", "banned", "prohibited", "terms"],
    answer:
      "Quick rules:\n• Post real items with honest prices and clear photos.\n• Choose the correct category.\n• No illegal, stolen, or counterfeit goods.\n• No spam or duplicate posts.\n• Be respectful in chat.\nBreaking rules can get a listing or account removed.",
    quickReplies: ["Safety tips", "How to post an item"],
  },
];

export const GREETING_QUICK_REPLIES = [
  "Find a product",
  "How to post an item",
  "How to log in",
  "Safety tips",
];
