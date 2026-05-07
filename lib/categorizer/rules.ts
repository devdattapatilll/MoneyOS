export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: [
    "swiggy", "zomato", "dominos", "pizza", "mcdonalds", "kfc", "foodpanda",
    "faasos", "box8", "eatfit", "restraunt", "restaurant", "cafe", "dining",
    "burger king", "subway", "chaayos", "starbucks", "tea", "coffee",
  ],
  Shopping: [
    "amazon", "flipkart", "myntra", "ajio", "nykaa", "meesho", "snapdeal",
    "tatacliq", "shopify", "bigbasket", "grofers", "dmart", "reliance fresh",
    "easyday", "more retail", "spencer", "retail", "mart", "bazaar",
  ],
  Transport: [
    "uber", "ola", "rapido", "namma yatri", "auto", "cab", "taxi",
    "metro", "bus", "train ticket", "irctc", "redbus", "abhibus",
    "fuel", "petrol", "diesel", "hpcl", "bpcl", "iocl", "indian oil",
  ],
  Bills: [
    "electricity", "water", "gas", "broadband", "wifi", "recharge",
    "jio", "airtel", "vodafone", "bsnl", "postpaid", "prepaid",
    "rent", "maintenance", "society", "municipal", "council",
  ],
  Healthcare: [
    "apollo", "medplus", "pharmacy", "hospital", "clinic", "diagnostic",
    "lab", "medical", "doctor", "dr ", "dental", "health", "medicine",
    "1mg", "netmeds", "pharmeasy", "practo", "thyrocare",
  ],
  Entertainment: [
    "bookmyshow", "pvr", "inox", "cinepolis", "carnival", "multiplex",
    "gaming", "pubg", "steam", "playstation", "xbox", "netflix", "prime video",
    "youtube", "hotstar", "sony liv", "zee5", "voot", "mx player",
    "event", "concert", "amusement", "theme park",
  ],
  Subscription: [
    "netflix", "spotify", "youtube premium", "hotstar", "sony liv",
    "zee5", "gaana", "wynk", "jio saavn", "apple music", "amazon prime",
    "kindle", "audible", "norton", "antivirus", "software sub",
    "membership", "monthly sub", "annual sub",
  ],
  Travel: [
    "makemytrip", "goibibo", "cleartrip", "yatra", "ixigo", "airbnb",
    "hotel", "resort", "flight", "airline", "indigo", "air india",
    "vistara", "spicejet", "goair", "holiday", "tour", "trip",
  ],
  Transfer: [
    "paytm", "phonepe", "google pay", "gpay", "bhim", "upi transfer",
    "imps", "neft", "rtgs", "bank transfer", "sent to", "received from",
    "peer to peer", "friend", "family", "roommate",
  ],
  Salary: [
    "salary", "payroll", "wages", "income", "remuneration", "stipend",
    "bonus", "incentive", "commission", "reimbursement", "refund",
  ],
  Investment: [
    "mutual fund", "sip", "stock", "share", "broker", "zerodha",
    "upstox", "groww", "etf", "nps", "ppf", "fd", "rd", "gold",
    "crypto", "bitcoin", "ethereum", "demat", "trading",
  ],
  EMI: [
    "emi", "loan repayment", "home loan", "car loan", "personal loan",
    "education loan", "two wheeler loan", "consumer durable", "hdfc loan",
    "sbi loan", "axis loan", "icici loan", "bajaj finserv",
  ],
  BNPL: [
    "simpl", "lazypay", "zestmoney", "e-paylater", "flipkart paylater",
    "amazon paylater", "postpe", "slice", "uni", "paytm postpaid",
    "credit line", "pay later", "postpaid",
  ],
};

export const NON_ESSENTIAL = new Set(["Food", "Shopping", "Entertainment", "Travel", "Subscription"]);
