import Fuse from "fuse.js";

const MERCHANT_ALIASES: Record<string, string[]> = {
  zomato: ["zomato limited", "zomato pay", "zomato online", "zomato order"],
  swiggy: ["swiggy", "swiggy instamart", "swiggy delivery"],
  uber: ["uber india", "uber trip", "uber eats", "ubergo"],
  ola: ["ola cabs", "ola auto", "ola electric", "ola money"],
  amazon: ["amazon pay", "amazon india", "amazon.in", "amzn"],
  flipkart: ["flipkart internet", "flipkart.com", "fkart"],
  netflix: ["netflix.com", "netflix subscription"],
  spotify: ["spotify india", "spotify.com"],
  apollo: ["apollo pharmacy", "apollo hospitals", "apollo clinic"],
  medplus: ["medplus online", "medplus mart"],
  paytm: ["paytm payments", "paytm bank", "paytm upi"],
  googlepay: ["google pay", "gpay", "tez"],
  phonepe: ["phonepe", "phone pe"],
  simpl: ["simpl technologies", "simpl pay"],
  lazypay: ["lazypay", "lazy pay"],
  irctc: ["irctc rail", "irctc nextgen"],
  makemytrip: ["makemytrip", "mmt"],
  bookmyshow: ["bookmyshow", "bms"],
  jio: ["reliance jio", "jio recharge", "jio payments"],
  airtel: ["bharti airtel", "airtel payments", "airtel recharge"],
  electricity: ["electricity board", "power bill", "bescom", "msedcl", "tsspdcl"],
  sip: ["mutual fund sip", "mf sip", "camsonline"],
  "home loan": ["home loan emi", "hdfc home loan", "sbi home loan"],
  "car loan": ["car loan emi", "auto loan", "vehicle loan"],
  salary: ["salary credit", "payroll", "wages", "monthly salary"],
};

const allNames: { name: string; canonical: string }[] = [];
for (const [canonical, aliases] of Object.entries(MERCHANT_ALIASES)) {
  allNames.push({ name: canonical, canonical });
  aliases.forEach((a) => allNames.push({ name: a, canonical }));
}

const fuse = new Fuse(allNames, { keys: ["name"], threshold: 0.35, includeScore: true });

export function cleanMerchantName(desc: string): string {
  const cleaned = desc.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const res = fuse.search(cleaned);
  if (res.length && (res[0].score ?? 1) < 0.35) {
    return res[0].item.canonical;
  }
  return desc.trim();
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
