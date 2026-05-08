import Fuse from "fuse.js";

const MERCHANT_ALIASES: Record<string, string[]> = {
  // Food delivery
  zomato: [
    "zomato", "zomato limited", "zomato pay", "zomato online", "upi-zomato",
    "zomato order", "zomato food", "upi zomato", "zomato upi"
  ],
  swiggy: [
    "swiggy", "swiggy instamart", "swiggy*", "upi-swiggy", "swiggy limited",
    "swiggy delivery", "swiggy online",
    "swiggy*store", "swiggy*instamart", "swiggy*delivery", "swiggy*food",
    "upi swiggy", "swiggy upi", "swiggy*order", "swiggy-dineout", "swiggy genie"
  ],
  dominos: ["dominos pizza", "dominos online", "dominos*"],
  mcdonalds: ["mcdonalds", "mcd", "mcdonald"],
  kfc: ["kfc india", "kfc online", "kfc*"],
  starbucks: ["starbucks coffee", "tata starbucks", "starbucks*"],
  chaayos: ["chaayos", "chai point"],
  
  // Transport
  uber: [
    "uber", "uber india", "uber trip", "uber eats", "ubergo", "upi-uber",
    "uber auto", "uber*trip", "uber*eats", "uber upi", "uber*india"
  ],
  ola: [
    "ola", "ola cabs", "ola auto", "ola electric", "ola money", "upi-ola", "ola*",
    "ola upi", "upi-ola", "ola bike", "ola share"
  ],
  rapido: ["rapido bike", "rapido auto", "rapido*"],
  
  // Shopping
  amazon: [
    "amazon", "amazon pay", "amazon india", "amazon.in", "amzn",
    "amazon seller", "upi-amazon", "amazon*", "amazon prime",
    "amazon shopping", "amazon upi", "amazon marketplace"
  ],
  flipkart: [
    "flipkart internet", "flipkart.com", "fkart", "flipkart*",
    "flipkart pay", "flipkart supermart", "upi-flipkart"
  ],
  myntra: ["myntra designs", "myntra*", "myntra online"],
  ajio: ["ajio", "reliance ajio"],
  nykaa: ["nykaa", "nykaa fashion", "nykaa*"],
  bigbasket: [
    "bigbasket", "bb daily", "bb instant", "bigbasket*",
    "tata bigbasket"
  ],
  blinkit: ["blinkit", "grofers", "blinkit*"],
  dmoji: ["dmart", "dmart ready", "avenue supermart"],
  
  // Entertainment
  netflix: [
    "netflix", "netflix.com", "netflix subscription", "upi-netflix", "netflix*",
    "netflix india", "netflix entertainment"
  ],
  spotify: [
    "spotify", "spotify india", "spotify.com", "upi-spotify", "spotify*",
    "spotify subscription"
  ],
  primevideo: ["prime video", "amazon prime video"],
  hotstar: ["disney hotstar", "hotstar*", "hotstar subscription"],
  sonyliv: ["sony liv", "sonyliv*"],
  youtube: ["youtube premium", "youtube*", "yt music"],
  bookmyshow: ["bookmyshow", "bms", "book my show"],
  pvr: ["pvr cinemas", "pvr*"],
  
  // Healthcare
  apollo: [
    "apollo pharmacy", "apollo hospitals", "apollo clinic", "apollo*"
  ],
  medplus: ["medplus online", "medplus mart", "medplus*"],
  pharmeasy: ["pharmeasy", "pharmeasy*"],
  netmeds: ["netmeds", "netmeds*"],
  
  // Payments
  paytm: [
    "paytm", "paytm payments", "paytm bank", "paytm upi", "upi-paytm",
    "one97", "paytm*", "paytm money", "paytm first"
  ],
  googlepay: [
    "google pay", "gpay", "tez", "upi-googlepay", "google payment",
    "google*tez", "upi-google", "google*upi"
  ],
  phonepe: [
    "phonepe", "phone pe", "upi-phonepe", "phonepe*", "phonepe insurance"
  ],
  
  // BNPL
  simpl: ["simpl technologies", "simpl pay", "simpl*"],
  lazypay: ["lazypay", "lazy pay", "lazypay*"],
  zestmoney: ["zestmoney", "zest money"],
  slice: ["slice", "slice*"],
  uni: ["uni cards", "uni*"],
  
  // Travel
  makemytrip: ["makemytrip", "mmt", "mmt*"],
  goibibo: ["goibibo", "goibibo*"],
  cleartrip: ["cleartrip", "cleartrip*"],
  irctc: ["irctc rail", "irctc nextgen", "irctc*"],
  redbus: ["redbus", "redbus*"],
  airbnb: ["airbnb", "airbnb*"],
  
  // Telecom
  jio: [
    "jio", "reliance jio", "jio recharge", "jio payments", "jio fiber",
    "upi-jio", "jio*", "jio postpaid", "jio prepaid"
  ],
  airtel: [
    "airtel", "bharti airtel", "airtel payments", "airtel recharge",
    "upi-airtel", "airtel*", "airtel broadband", "airtel dth", "airtel postpaid"
  ],
  vi: ["vodafone idea", "vi recharge", "vodafone", "idea cellular"],
  
  // Utilities
  electricity: [
    "electricity board", "power bill", "bescom", "msedcl", "tsspdcl",
    "tneb", "mpeb", "upepcl", "kseb"
  ],
  water: ["water board", "water bill", "municipal water"],
  gas: ["gas bill", "hp gas", "indane", "bharat gas"],
  broadband: ["broadband", "wifi bill", "act fibernet", "excitel"],
  
  // Financial
  sip: ["mutual fund sip", "mf sip", "camsonline", "cams"],
  zerodha: ["zerodha", "kite zerodha"],
  groww: ["groww", "groww*"],
  upstox: ["upstox", "upstox*"],
  "home loan": ["home loan emi", "hdfc home loan", "sbi home loan", "lic housing"],
  "car loan": ["car loan emi", "auto loan", "vehicle loan"],
  "personal loan": ["personal loan emi", "pl emi"],
  
  // Income
  salary: [
    "salary credit", "payroll", "wages", "monthly salary",
    "salary credited", "net salary"
  ],
  
  // Other common merchants
  cred: ["cred", "cred pay", "cred*"],
  urbancompany: ["urban company", "urbanclap"],
  dunzo: ["dunzo", "dunzo*"],
  instamart: ["instamart", "swiggy instamart"],
};

const allNames: { name: string; canonical: string }[] = [];
for (const [canonical, aliases] of Object.entries(MERCHANT_ALIASES)) {
  allNames.push({ name: canonical, canonical });
  aliases.forEach((a) => allNames.push({ name: a, canonical }));
}

const fuse = new Fuse(allNames, { keys: ["name"], threshold: 0.35, includeScore: true });

function normalizeMerchantLookup(desc: string): string {
  return desc
    .toUpperCase()
    .replace(/\b(?:UPI|IMPS)[-/]/g, " ")
    .replace(/\b(?:UPI|IMPS)\b/g, " ")
    .replace(/\b(?:REF|RRN|UTR|TXN|TRANSACTION|NO)\b[:\-/]?\s*[A-Z0-9]{6,}\b/g, " ")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+/g, " ")
    .replace(/\b[A-Z0-9]{10,}\b/g, " ")
    .replace(/[^\w\s.*-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanMerchantName(desc: string): string {
  const normalized = normalizeMerchantLookup(desc);
  const cleaned = normalized.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const res = fuse.search(cleaned);
  if (res.length && (res[0].score ?? 1) < 0.35) {
    return res[0].item.canonical;
  }
  return normalized || desc.trim();
}

export function enrichTransaction(t: any) {
  const d = new Date(t.date);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const dayOfWeek = dayNames[d.getDay()];
  const hour = d.getHours();
  return {
    ...t,
    merchant_clean: cleanMerchantName(t.description),
    month,
    day_of_week: dayOfWeek,
    hour,
    is_weekend: dayOfWeek === "Saturday" || dayOfWeek === "Sunday",
    is_night: hour >= 23 || hour < 5,
  };
}

export function cleanDataframe(rows: any[]) {
  return rows.map(enrichTransaction);
}
