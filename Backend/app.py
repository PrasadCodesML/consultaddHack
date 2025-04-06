from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import os
import re
from datetime import datetime
from flask_cors import CORS
app = Flask(__name__)

# Remove all other CORS configurations and just use this simple setup
CORS(app, 
     origins=["http://localhost:3000"],
     allow_headers=["Content-Type"],
     supports_credentials=True)

def parse_company_text(text):
    def extract(field, is_list=False):
        try:
            match = re.search(rf"{re.escape(field)}\s*:\s*(.+)", text, re.IGNORECASE)
            if match:
                return [x.strip() for x in match.group(1).split(",")] if is_list else match.group(1).strip()
        except:
            pass
        return None

    def safe_int(val):
        try:
            return int(re.search(r"\d+", val).group())
        except:
            return 0

    return {
        "Business Structure": extract("Business Structure"),
        "Years in Business": safe_int(extract("Company Length of Existence") or "0"),
        "Staffing Experience": safe_int(extract("Years of Experience in Temporary Staffing") or "0"),
        "Phone Number": extract("Phone Number"),
        "Email Address": extract("Email Address"),
        "SAM Registration Date": extract("SAM.gov Registration Date"),
        "NAICS Codes": extract("NAICS Codes", is_list=True),
        "W-9 Form": extract("W-9 Form"),
        "Insurance Certificate": extract("Certificate of Insurance"),
        "DBE Certification": extract("Historically Underutilized Business/DBE Status"),
    }

def extract_rfp_requirements(text):
    try:
        return {
            "Business Structure": "LLC" if "LLC" in text else None,
            "Min Years in Business": int(re.search(r"(?:at least|min(?:imum)?)\s+(\d+)\s+years? (?:of existence|in business)", text, re.I).group(1)) if re.search(r"(?:at least|min(?:imum)?)\s+(\d+)\s+years? (?:of existence|in business)", text, re.I) else 0,
            "Min Staffing Experience": int(re.search(r"(?:at least|min(?:imum)?)\s+(\d+)\s+years? of experience", text, re.I).group(1)) if re.search(r"(?:at least|min(?:imum)?)\s+(\d+)\s+years? of experience", text, re.I) else 0,
            "Requires SAM Registration Before": re.search(r"SAM(?:\.gov)? registration.*?([0-9]{2}/[0-9]{2}/[0-9]{4})", text, re.I).group(1) if re.search(r"SAM(?:\.gov)? registration.*?([0-9]{2}/[0-9]{2}/[0-9]{4})", text, re.I) else None,
            "NAICS Codes Allowed": re.findall(r"\b(541611|541612|561320)\b", text),
            "Requires W-9 Form": "w-9" in text.lower(),
            "Requires Certificate of Insurance": "certificate of insurance" in text.lower(),
            "Requires DBE Certification": "dbe certified" in text.lower()
        }
    except:
        return {}

def compare(company, rfp):
    def check(val, req, match=True):
        symbol = "✅ Match" if match else "❌ Mismatch"
        return f"{val} | RFP: {req} | {symbol}"

    lines = ["--- COMPLIANCE REPORT ---"]
    lines.append(f"Business Structure             | {check(company['Business Structure'], rfp['Business Structure'], company['Business Structure'] == rfp['Business Structure'])}")
    lines.append(f"Years in Business              | Company: {company['Years in Business']} | RFP: >= {rfp['Min Years in Business']} | {'✅ Match' if company['Years in Business'] >= rfp['Min Years in Business'] else '❌ Mismatch'}")
    lines.append(f"Staffing Experience            | Company: {company['Staffing Experience']} | RFP: >= {rfp['Min Staffing Experience']} | {'✅ Match' if company['Staffing Experience'] >= rfp['Min Staffing Experience'] else '❌ Mismatch'}")

    # Phone check
    phone = company.get("Phone Number")
    phone_pattern = r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
    phone_match = bool(re.search(phone_pattern, phone)) if phone else False
    lines.append(f"Phone Format                   | Company: {phone} | RFP: Valid US format | {'✅ Match' if phone_match else '❌ Mismatch'}")

    # Email check
    email = company.get("Email Address")
    email_pattern = r"[^@]+@[^@]+\.[^@]+"
    email_match = bool(re.match(email_pattern, email)) if email else False
    lines.append(f"Email Format                   | Company: {email} | RFP: Valid format | {'✅ Match' if email_match else '❌ Mismatch'}")

    # SAM Registration
    sam_date_str = company.get("SAM Registration Date")
    rfp_date_str = rfp.get("Requires SAM Registration Before")
    try:
        sam_date = datetime.strptime(sam_date_str, "%m/%d/%Y") if sam_date_str else None
        rfp_date = datetime.strptime(rfp_date_str, "%m/%d/%Y") if rfp_date_str else None
        sam_match = sam_date and rfp_date and sam_date <= rfp_date
    except:
        sam_match = False
    lines.append(f"SAM Registration Date          | Company: {sam_date_str} | RFP: Before {rfp_date_str} | {'✅ Match' if sam_match else '❌ Mismatch'}")

    # NAICS comparison
    company_naics = company.get("NAICS Codes") or []
    rfp_naics = rfp.get("NAICS Codes Allowed") or []
    naics_match = any(code in rfp_naics for code in company_naics)
    lines.append(f"NAICS Codes                    | Company: {company_naics} | RFP: {rfp_naics} | {'✅ Match' if naics_match else '❌ Mismatch'}")

    lines.append(f"W-9 Form                       | Company: {company['W-9 Form']} | RFP: Required | {'✅ Match' if rfp.get('Requires W-9 Form') else '❌ Mismatch'}")
    lines.append(f"Insurance Certificate          | Company: {company['Insurance Certificate']} | RFP: Required | {'✅ Match' if rfp.get('Requires Certificate of Insurance') else '❌ Mismatch'}")
    lines.append(f"DBE/HUB Certification          | Company: {company['DBE Certification']} | RFP: Optional | {'✅ Match' if not rfp.get('Requires DBE Certification') else '❌ Mismatch'}")

    return "\n".join(lines)

@app.route("/", methods=["POST", "OPTIONS"])
def index():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"})

    if "company_pdf" not in request.files or "rfp_pdf" not in request.files:
        return jsonify({"error": "Both 'company_pdf' and 'rfp_pdf' files are required."}), 400

    company_pdf = request.files["company_pdf"]
    rfp_pdf = request.files["rfp_pdf"]

    os.makedirs("uploads", exist_ok=True)
    company_path = os.path.join("uploads", company_pdf.filename)
    rfp_path = os.path.join("uploads", rfp_pdf.filename)

    company_pdf.save(company_path)
    rfp_pdf.save(rfp_path)

    company_doc = fitz.open(company_path)
    rfp_doc = fitz.open(rfp_path)

    company_text = "\n".join([page.get_text() for page in company_doc])
    rfp_text = "\n".join([page.get_text() for page in rfp_doc])

    company_data = parse_company_text(company_text)
    rfp_data = extract_rfp_requirements(rfp_text)

    report = compare(company_data, rfp_data)

    return jsonify({"report": report})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860, debug=True)
