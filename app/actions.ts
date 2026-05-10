"use server";

import { parseCSV } from "@/lib/parsers/csvParser";
import { cleanDataframe } from "@/lib/cleaner";
import { categorizeTransactions } from "@/lib/categorizer/engine";
import { uploadStatement, createUpload, storeTransactions } from "@/lib/supabase";

export async function processCSV(csvText: string, uploadToSupabase = false, filename?: string) {
  const raw = parseCSV(csvText);
  const cleaned = cleanDataframe(raw);
  const categorized = categorizeTransactions(cleaned);
  
  if (uploadToSupabase && filename) {
    // Create upload record and store transactions
    const upload = await createUpload({
      filename,
      filetype: "csv",
      storage_path: "",
    });
    
    const transactions = categorized.map((t) => ({
      upload_id: upload.id!,
      date: t.date,
      description: t.description,
      merchant_clean: t.merchant_clean,
      category: t.category,
      amount: t.amount,
      type: t.type,
      month: t.month,
      day_of_week: t.day_of_week,
      hour: t.hour,
      is_weekend: t.is_weekend,
      is_night: t.is_night,
    }));
    
    await storeTransactions(transactions);
  }
  
  return categorized;
}

// Embedded sample data for serverless compatibility
const SAMPLE_CSV_DATA = `date,description,amount,type
2024-01-05 20:00:00,Netflix,437.62,debit
2024-01-06 22:00:00,MedPlus,1243.09,debit
2024-01-08 08:00:00,Flipkart,8802.93,debit
2024-01-09 06:00:00,Swiggy,521.13,debit
2024-01-09 10:00:00,Spotify,118.72,debit
2024-01-09 21:00:00,Spotify,161.66,debit
2024-01-10 18:00:00,Flipkart,7496.93,debit
2024-01-11 01:00:00,Uber,647.5,debit
2024-01-11 11:00:00,Car Loan EMI,17924.23,debit
2024-01-12 06:00:00,Jio Recharge,463.82,debit
2024-01-13 05:00:00,Home Loan EMI,39732.88,debit
2024-01-13 10:00:00,Amazon,5460.49,debit
2024-01-14 06:00:00,Apollo Pharmacy,669.67,debit
2024-01-14 13:00:00,Simpl,2539.78,debit
2024-01-15 04:00:00,Spotify,141.96,debit
2024-01-15 21:00:00,Flipkart,5051.96,debit
2024-01-16 09:00:00,Electricity Board,2816.13,debit
2024-01-17 14:00:00,Swiggy,604.59,debit
2024-01-18 00:00:00,Paytm,1278.38,debit
2024-01-19 17:00:00,Mutual Fund SIP,1872.89,debit
2024-01-19 21:00:00,Airtel Recharge,665.04,debit
2024-01-20 18:00:00,Spotify,160.75,debit
2024-01-20 23:00:00,Netflix,530.9,debit
2024-01-22 04:00:00,Spotify,148.35,debit
2024-01-22 19:00:00,PhonePe,7154.27,debit
2024-01-23 07:00:00,Home Loan EMI,15341.76,debit
2024-01-24 08:00:00,Airtel Recharge,442.05,debit
2024-01-24 21:00:00,Apollo Pharmacy,1340.99,debit
2024-01-25 02:00:00,Google Pay,8410.9,debit
2024-01-26 11:00:00,Spotify,161.11,debit
2024-01-27 16:00:00,Mutual Fund SIP,3256.47,debit
2024-01-28 06:00:00,Electricity Board,1678.29,debit
2024-01-28 18:00:00,Flipkart,1539.42,debit
2024-01-28 21:00:00,Jio Recharge,460.29,debit
2024-01-29 04:00:00,Google Pay,2770.3,debit
2024-01-29 08:00:00,Swiggy,1331.44,debit
2024-01-29 13:00:00,Zomato,1433.9,debit
2024-01-30 00:00:00,PhonePe,3065.12,debit
2024-01-31 16:00:00,Amazon,9162.75,debit
2024-02-01 06:00:00,Electricity Board,1595.53,debit
2024-02-01 20:00:00,BookMyShow,1601.02,debit
2024-02-02 05:00:00,PhonePe,7360.96,debit
2024-02-03 00:00:00,PhonePe,1549.51,debit
2024-02-03 06:00:00,Airtel Recharge,815.35,debit
2024-02-04 05:00:00,Apollo Pharmacy,1120.86,debit
2024-02-04 09:00:00,Paytm,1153.13,debit
2024-02-05 00:00:00,Ola,852.7,debit
2024-02-05 10:00:00,Airtel Recharge,722.23,debit
2024-02-05 22:00:00,Swiggy,1373.63,debit
2024-02-06 01:00:00,Swiggy,1049.42,debit
2024-02-07 00:00:00,Spotify,115.41,debit
2024-02-07 17:00:00,Home Loan EMI,15924.53,debit
2024-02-08 04:00:00,Home Loan EMI,15532.71,debit
2024-02-08 09:00:00,Electricity Board,2399.49,debit
2024-02-09 11:00:00,Airtel Recharge,597.51,debit
2024-02-09 16:00:00,Jio Recharge,361.07,debit
2024-02-10 09:00:00,Simpl,2220.56,debit
2024-02-10 12:00:00,Netflix,580.09,debit
2024-02-10 15:00:00,Airtel Recharge,683.14,debit
2024-02-12 00:00:00,Spotify,128.69,debit
2024-02-14 02:00:00,Jio Recharge,897.13,debit
2024-02-15 04:00:00,BookMyShow,1591.24,debit
2024-02-15 14:00:00,Electricity Board,1151.7,debit
2024-02-15 17:00:00,Airtel Recharge,261.2,debit
2024-02-16 18:00:00,Car Loan EMI,22613.02,debit
2024-02-17 22:00:00,Paytm,4764.59,debit
2024-02-18 08:00:00,Spotify,137.7,debit
2024-02-19 10:00:00,Spotify,110.69,debit
2024-02-20 07:00:00,IRCTC,2870.34,debit
2024-02-24 14:00:00,Salary Credit,74103.28,credit
2024-02-25 12:00:00,Apollo Pharmacy,348.43,debit
2024-02-26 16:00:00,Jio Recharge,974.47,debit
2024-02-27 02:00:00,Apollo Pharmacy,466.59,debit
2024-02-28 06:00:00,Spotify,130.5,debit
2024-02-29 16:00:00,Car Loan EMI,24900.49,debit
2024-03-02 08:00:00,PhonePe,7894.18,debit
2024-03-03 15:00:00,Google Pay,2126.98,debit
2024-03-05 18:00:00,PhonePe,3375.33,debit
2024-03-06 15:00:00,Home Loan EMI,18340.25,debit
2024-03-08 00:00:00,Amazon,3273.4,debit
2024-03-08 00:00:00,Amazon,6645.14,debit
2024-03-08 18:00:00,BookMyShow,544.39,debit
2024-03-09 15:00:00,Electricity Board,2232.06,debit
2024-03-09 20:00:00,BookMyShow,2170.06,debit
2024-03-11 17:00:00,Salary Credit,89886.51,credit
2024-03-12 16:00:00,Apollo Pharmacy,1654.28,debit
2024-03-14 00:00:00,Zomato,1426.7,debit
2024-03-14 09:00:00,Jio Recharge,300.27,debit
2024-03-16 13:00:00,Salary Credit,83093.1,credit
2024-03-18 07:00:00,Jio Recharge,443.62,debit
2024-03-19 14:00:00,Netflix,244.84,debit
2024-03-19 20:00:00,MedPlus,897.9,debit
2024-03-20 12:00:00,LazyPay,1035.15,debit
2024-03-20 22:00:00,Airtel Recharge,717.83,debit
2024-03-21 07:00:00,Salary Credit,94710.22,credit
2024-03-22 03:00:00,Salary Credit,41136.9,credit
2024-03-22 08:00:00,Paytm,2922.18,debit
2024-03-22 12:00:00,MedPlus,426.9,debit
2024-03-22 13:00:00,MakeMyTrip,10950.39,debit
2024-03-23 02:00:00,Paytm,2618.45,debit
2024-03-23 11:00:00,IRCTC,623.08,debit
2024-03-23 19:00:00,Apollo Pharmacy,276.81,debit
2024-03-23 20:00:00,Jio Recharge,226.66,debit
2024-03-24 05:00:00,Home Loan EMI,44326.78,debit
2024-03-25 13:00:00,Airtel Recharge,925.03,debit
2024-03-26 02:00:00,Uber,201.01,debit
2024-03-26 15:00:00,Home Loan EMI,25437.13,debit
2024-03-28 05:00:00,Apollo Pharmacy,1133.9,debit
2024-03-29 14:00:00,Apollo Pharmacy,741.29,debit
2024-03-30 08:00:00,MedPlus,1603.58,debit
2024-03-30 17:00:00,Mutual Fund SIP,4135.83,debit
2024-03-30 19:00:00,Zomato,1210.71,debit
2024-03-30 20:00:00,Apollo Pharmacy,611.73,debit
2024-03-31 08:00:00,Ola,296.93,debit
2024-04-01 11:00:00,MedPlus,1794.21,debit
2024-04-01 19:00:00,Ola,475.11,debit
2024-04-03 07:00:00,Jio Recharge,256.4,debit
2024-04-03 18:00:00,Swiggy,587.31,debit
2024-04-04 09:00:00,Jio Recharge,339.95,debit
2024-04-05 02:00:00,Netflix,510.99,debit
2024-04-05 07:00:00,Airtel Recharge,488.8,debit
2024-04-06 01:00:00,Spotify,138.88,debit
2024-04-06 08:00:00,Swiggy,1199.02,debit
2024-04-07 02:00:00,Google Pay,8846.29,debit
2024-04-07 16:00:00,PhonePe,1468.2,debit
2024-04-08 16:00:00,Paytm,1562.88,debit
2024-04-08 16:00:00,MedPlus,1658.52,debit
2024-04-10 06:00:00,Zomato,580.15,debit
2024-04-11 06:00:00,Mutual Fund SIP,1897.65,debit
2024-04-11 22:00:00,PhonePe,1158.24,debit
2024-04-14 07:00:00,LazyPay,2413.36,debit
2024-04-15 11:00:00,Netflix,270.01,debit
2024-04-15 14:00:00,Netflix,585.44,debit
2024-04-17 18:00:00,Car Loan EMI,23667.94,debit
2024-04-18 22:00:00,Flipkart,7207.88,debit
2024-04-19 05:00:00,Car Loan EMI,15521.36,debit
2024-04-20 09:00:00,Spotify,153.62,debit
2024-04-20 14:00:00,Google Pay,5333.39,debit
2024-04-21 05:00:00,MedPlus,355.91,debit
2024-04-22 04:00:00,Jio Recharge,243.62,debit
2024-04-22 17:00:00,LazyPay,1642.56,debit
2024-04-22 17:00:00,Simpl,2161.4,debit
2024-04-24 10:00:00,Amazon,2691.64,debit
2024-04-26 00:00:00,Spotify,148.23,debit
2024-04-26 06:00:00,MedPlus,775.51,debit
2024-04-26 23:00:00,Uber,776.29,debit
2024-04-29 00:00:00,PhonePe,246.3,debit
2024-04-29 00:00:00,LazyPay,565.47,debit
2024-04-29 16:00:00,Amazon,4554.57,debit
2024-04-30 05:00:00,Swiggy,661.93,debit
2024-05-01 10:00:00,Electricity Board,2793.08,debit
2024-05-02 12:00:00,Google Pay,5435.78,debit
2024-05-02 18:00:00,IRCTC,3688.82,debit
2024-05-03 10:00:00,Netflix,315.01,debit
2024-05-05 15:00:00,Uber,797.39,debit
2024-05-05 21:00:00,Simpl,976.29,debit
2024-05-06 11:00:00,Jio Recharge,583.47,debit
2024-05-07 14:00:00,Mutual Fund SIP,3795.45,debit
2024-05-08 12:00:00,BookMyShow,1883.9,debit
2024-05-09 13:00:00,PhonePe,3545.39,debit
2024-05-09 14:00:00,MakeMyTrip,21229.79,debit
2024-05-09 21:00:00,Paytm,3482.32,debit
2024-05-11 19:00:00,Electricity Board,1664.99,debit
2024-05-12 02:00:00,Amazon,4642.27,debit
2024-05-12 07:00:00,Electricity Board,4365.71,debit
2024-05-12 11:00:00,BookMyShow,987.52,debit
2024-05-12 14:00:00,Mutual Fund SIP,1792.53,debit
2024-05-13 08:00:00,Amazon,3946.58,debit
2024-05-14 07:00:00,Flipkart,2416.96,debit
2024-05-14 10:00:00,Simpl,701.35,debit
2024-05-14 16:00:00,Airtel Recharge,945.83,debit
2024-05-15 20:00:00,Netflix,562.78,debit
2024-05-16 22:00:00,Swiggy,631.38,debit
2024-05-17 08:00:00,PhonePe,4721.23,debit
2024-05-17 09:00:00,Jio Recharge,802.19,debit
2024-05-18 21:00:00,MedPlus,1306.61,debit
2024-05-19 07:00:00,Salary Credit,53663.07,credit
2024-05-20 20:00:00,PhonePe,7255.64,debit
2024-05-20 21:00:00,IRCTC,2537.65,debit
2024-05-21 02:00:00,Paytm,1348.06,debit
2024-05-21 20:00:00,LazyPay,979.07,debit
2024-05-23 01:00:00,Google Pay,671.55,debit
2024-05-25 03:00:00,Apollo Pharmacy,1373.82,debit
2024-05-25 21:00:00,Paytm,2497.15,debit
2024-05-25 23:00:00,Electricity Board,947.28,debit
2024-05-26 11:00:00,Simpl,268.11,debit
2024-05-26 13:00:00,Spotify,165.62,debit
2024-05-26 23:00:00,IRCTC,658.43,debit
2024-05-27 12:00:00,Electricity Board,2279.87,debit
2024-05-29 21:00:00,Swiggy,887.07,debit
2024-05-31 19:00:00,Mutual Fund SIP,4887.15,debit
2024-06-01 19:00:00,Car Loan EMI,15893.17,debit
2024-06-02 02:00:00,Flipkart,1393.55,debit
2024-06-02 10:00:00,Jio Recharge,380.19,debit
2024-06-03 02:00:00,Amazon,5787.79,debit
2024-06-03 03:00:00,Airtel Recharge,277.77,debit
2024-06-05 18:00:00,Spotify,151.01,debit
2024-06-05 19:00:00,Amazon,699.04,debit
2024-06-05 23:00:00,LazyPay,760.91,debit
2024-06-06 05:00:00,Home Loan EMI,31958.53,debit
2024-06-06 20:00:00,Spotify,159.58,debit
2024-06-06 21:00:00,Spotify,120.66,debit
2024-06-07 15:00:00,Zomato,651.22,debit
2024-06-07 21:00:00,PhonePe,2618.4,debit
2024-06-08 00:00:00,Amazon,2639.41,debit
2024-06-08 05:00:00,Simpl,1271.79,debit
2024-06-08 09:00:00,Spotify,178.49,debit
2024-06-09 04:00:00,Home Loan EMI,24925.87,debit
2024-06-09 09:00:00,Apollo Pharmacy,1751.33,debit
2024-06-10 00:00:00,Airtel Recharge,416.32,debit
2024-06-11 00:00:00,Home Loan EMI,42645.89,debit
2024-06-11 16:00:00,Flipkart,6358.1,debit
2024-06-12 23:00:00,Amazon,6573.9,debit
2024-06-13 07:00:00,MakeMyTrip,21219.41,debit
2024-06-14 08:00:00,MedPlus,1612.38,debit
2024-06-14 10:00:00,Jio Recharge,392.55,debit
2024-06-14 12:00:00,Salary Credit,76231.41,credit
2024-06-15 20:00:00,Uber,390.85,debit
2024-06-16 15:00:00,MakeMyTrip,19679.11,debit
2024-06-17 15:00:00,Uber,613.75,debit
2024-06-18 02:00:00,Spotify,189.94,debit
2024-06-18 03:00:00,Uber,696.08,debit
2024-06-19 03:00:00,Netflix,529.62,debit
2024-06-19 18:00:00,PhonePe,1459.22,debit
2024-06-21 08:00:00,PhonePe,3262.51,debit
2024-06-22 05:00:00,Netflix,617.41,debit
2024-06-23 07:00:00,Uber,345.37,debit
2024-06-23 17:00:00,MedPlus,1624.29,debit
2024-06-24 19:00:00,BookMyShow,2085.79,debit
2024-06-25 15:00:00,IRCTC,4973.92,debit
2024-06-25 18:00:00,Google Pay,1596.51,debit
2024-06-25 22:00:00,Google Pay,3161.28,debit
2024-06-25 23:00:00,Jio Recharge,867.33,debit
2024-06-27 03:00:00,Airtel Recharge,796.13,debit
2024-06-27 05:00:00,MedPlus,144.94,debit
2024-06-29 03:00:00,Ola,789.66,debit
2024-06-29 13:00:00,Swiggy,1062.46,debit
2024-06-29 16:00:00,Mutual Fund SIP,555.95,debit`;

export async function loadSampleData() {
  return processCSV(SAMPLE_CSV_DATA);
}

export async function saveToSupabase(rows: any[], filename: string, filetype: string) {
  // Create upload record
  const upload = await createUpload({
    filename,
    filetype,
    storage_path: "",
  });
  
  // Store transactions
  const transactions = rows.map((t) => ({
    upload_id: upload.id!,
    date: t.date,
    description: t.description,
    merchant_clean: t.merchant_clean,
    category: t.category,
    amount: t.amount,
    type: t.type,
    month: t.month,
    day_of_week: t.day_of_week,
    hour: t.hour,
    is_weekend: t.is_weekend,
    is_night: t.is_night,
  }));
  
  await storeTransactions(transactions);
  
  return { success: true, uploadId: upload.id };
}
