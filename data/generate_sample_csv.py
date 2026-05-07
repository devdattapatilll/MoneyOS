import csv
import random
from datetime import datetime, timedelta
import os

MERCHANT_POOL = [
    ("Swiggy", "Food", 150, 1200),
    ("Zomato", "Food", 180, 1500),
    ("Uber", "Transport", 80, 800),
    ("Ola", "Transport", 90, 900),
    ("Amazon", "Shopping", 200, 8000),
    ("Flipkart", "Shopping", 250, 7500),
    ("Netflix", "Subscription", 199, 649),
    ("Spotify", "Subscription", 99, 199),
    ("Apollo Pharmacy", "Healthcare", 100, 2500),
    ("MedPlus", "Healthcare", 80, 1800),
    ("Paytm", "Transfer", 50, 5000),
    ("Google Pay", "Transfer", 100, 10000),
    ("PhonePe", "Transfer", 50, 8000),
    ("Simpl", "BNPL", 200, 3000),
    ("LazyPay", "BNPL", 150, 2500),
    ("IRCTC", "Travel", 300, 5000),
    ("MakeMyTrip", "Travel", 1500, 25000),
    ("BookMyShow", "Entertainment", 200, 3000),
    ("Jio Recharge", "Bills", 199, 999),
    ("Airtel Recharge", "Bills", 199, 999),
    ("Electricity Board", "Bills", 500, 4500),
    ("Mutual Fund SIP", "Investment", 500, 5000),
    ("Home Loan EMI", "EMI", 15000, 45000),
    ("Car Loan EMI", "EMI", 8000, 25000),
]

def generate_csv(path, count=220):
    headers = ["date", "description", "amount", "type"]
    rows = []
    base = datetime(2024, 1, 1)
    for i in range(count):
        date = base + timedelta(days=random.randint(0, 180), hours=random.randint(0, 23))
        merch, cat, lo, hi = random.choice(MERCHANT_POOL)
        is_credit = False
        if random.random() < 0.05:
            is_credit = True
            merch = "Salary Credit"
            cat = "Salary"
            lo, hi = 35000, 95000
        if is_credit:
            ttype = "credit"
        else:
            ttype = "debit"
        amt = round(random.uniform(lo, hi), 2)
        rows.append([date.strftime("%Y-%m-%d %H:%M:%S"), merch, amt, ttype])
    rows.sort(key=lambda x: x[0])
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(headers)
        w.writerows(rows)
    print(f"Generated {path} with {count} rows")

if __name__ == "__main__":
    generate_csv(os.path.join(os.path.dirname(__file__), "sample_transactions.csv"))
