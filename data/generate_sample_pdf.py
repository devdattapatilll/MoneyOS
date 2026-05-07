import random
from datetime import datetime, timedelta
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import os

MERCHANTS = [
    ("Swiggy", "Food"),
    ("Zomato", "Food"),
    ("Uber", "Transport"),
    ("Ola", "Transport"),
    ("Amazon", "Shopping"),
    ("Flipkart", "Shopping"),
    ("Netflix", "Subscription"),
    ("Spotify", "Subscription"),
    ("Apollo Pharmacy", "Healthcare"),
    ("MedPlus", "Healthcare"),
    ("Paytm", "Transfer"),
    ("Google Pay", "Transfer"),
    ("PhonePe", "Transfer"),
    ("Simpl", "BNPL"),
    ("LazyPay", "BNPL"),
    ("IRCTC", "Travel"),
    ("MakeMyTrip", "Travel"),
    ("BookMyShow", "Entertainment"),
    ("Jio Recharge", "Bills"),
    ("Airtel Recharge", "Bills"),
    ("Electricity Board", "Bills"),
    ("Mutual Fund SIP", "Investment"),
    ("Home Loan EMI", "EMI"),
    ("Car Loan EMI", "EMI"),
]

def generate_rows(count=80):
    rows = []
    base = datetime(2024, 1, 1)
    for i in range(count):
        date = base + timedelta(days=random.randint(0, 180), hours=random.randint(0, 23))
        merch, cat = random.choice(MERCHANTS)
        is_credit = cat in ("Salary",)
        if random.random() < 0.05:
            is_credit = True
            merch = "Salary Credit"
        if is_credit:
            amount = round(random.uniform(15000, 85000), 2)
            ttype = "Cr"
        else:
            amount = round(random.uniform(50, 12000), 2)
            ttype = "Dr"
        rows.append([
            date.strftime("%d-%b-%Y"),
            date.strftime("%H:%M"),
            merch,
            f"UPI/{random.randint(100000000000, 999999999999)}",
            f"{amount:,.2f}",
            ttype,
            f"{random.uniform(20000, 150000):,.2f}",
        ])
    rows.sort(key=lambda x: datetime.strptime(x[0], "%d-%b-%Y"))
    return rows


def build():
    rows = generate_rows(80)
    headers = ["Date", "Time", "Description", "Ref No", "Amount", "Type", "Balance"]
    data = [headers] + rows

    path = os.path.join(os.path.dirname(__file__), "sample_statement.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()
    elements.append(Paragraph("<b>Account Statement</b>", styles["Heading1"]))
    elements.append(Paragraph("Account: XXXX1234 | Jan 2024 - Jun 2024", styles["Normal"]))
    elements.append(Spacer(1, 12))

    t = Table(data, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f3f4f6")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
    ]))
    elements.append(t)
    doc.build(elements)
    print(f"Generated {path}")


if __name__ == "__main__":
    build()
