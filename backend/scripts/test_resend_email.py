"""
Test script for sending emails via Resend API.
Can be run with:
python -m backend.scripts.test_resend_email
"""

import sys
import resend
from backend.config import RESEND_API_KEY, RESEND_FROM_EMAIL

def main():
    # Note: Replace 're_xxxxxxxxx' with your real API key or set RESEND_API_KEY in .env
    api_key = RESEND_API_KEY or "re_xxxxxxxxx"
    if api_key == "re_xxxxxxxxx" or not api_key:
        print("[WARNING] Please replace 're_xxxxxxxxx' with your real API key in .env (RESEND_API_KEY=...)")
        sys.exit(1)

    resend.api_key = api_key
    from_addr = RESEND_FROM_EMAIL or "onboarding@resend.dev"
    to_addr = "skillscatalyst5@gmail.com"

    print(f"Sending test email via Resend...")
    print(f"From: {from_addr}")
    print(f"To: {to_addr}")

    try:
        r = resend.Emails.send({
            "from": from_addr,
            "to": to_addr,
            "subject": "Hello World",
            "html": "<p>Congrats on sending your <strong>first email</strong>!</p>"
        })
        print("\n[SUCCESS] Email successfully dispatched via Resend!")
        print("Response:", r)
    except Exception as e:
        print(f"\n[ERROR] Failed to send email via Resend: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
