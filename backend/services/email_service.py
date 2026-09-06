"""
Email service using the Resend API.
Provides production-ready email sending for notifications, welcome emails,
and transactional communications across SkillsCatalyst.
"""

import logging
from typing import Optional, Dict, Any, List, Union, cast
import resend
from backend.config import RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_REPLY_TO

logger = logging.getLogger(__name__)

# Configure Resend global API key
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
else:
    logger.warning("RESEND_API_KEY is not set. Email dispatch will fail or run in mockup mode.")


def send_email(
    to: Union[str, List[str]],
    subject: str,
    html: str,
    from_email: Optional[str] = None,
    reply_to: Optional[str] = None,
    text: Optional[str] = None,
    headers: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    """
    Sends an email using the Resend API.

    :param to: Recipient email address or list of email addresses.
    :param subject: Subject line of the email.
    :param html: HTML body of the email.
    :param from_email: Sender email (defaults to RESEND_FROM_EMAIL or 'SkillsCatalyst <welcome@skillscatalyst.in>').
    :param reply_to: Reply-to address (defaults to RESEND_REPLY_TO or 'skillscatalyst5@gmail.com').
    :param text: Optional plaintext fallback.
    :param headers: Optional custom headers (e.g. X-Entity-Ref-ID for provider idempotency).
    :return: Dict containing success boolean, id, or error details.
    """
    api_key = RESEND_API_KEY or resend.api_key
    if not api_key or api_key.startswith("re_xxxx"):
        logger.error("Cannot send email: RESEND_API_KEY is invalid or missing.")
        return {
            "success": False,
            "error": "RESEND_API_KEY is not configured with a valid key.",
        }

    # Ensure api_key is synced
    resend.api_key = api_key

    sender = from_email or RESEND_FROM_EMAIL or "SkillsCatalyst <welcome@skillscatalyst.in>"
    recipients = [to] if isinstance(to, str) else to

    # Resend requires a verified domain or 'onboarding@resend.dev' as the sender.
    # Gmail addresses (@gmail.com) cannot be used directly in 'from' because Google DMARC blocks them.
    # We automatically route via 'SkillsCatalyst <onboarding@resend.dev>' and set reply_to='skillscatalyst5@gmail.com'.
    if "@gmail.com" in sender.lower():
        actual_from = "SkillsCatalyst <onboarding@resend.dev>"
        reply_to_addr = sender
    else:
        actual_from = sender
        reply_to_addr = reply_to or RESEND_REPLY_TO or "skillscatalyst5@gmail.com"

    payload: Dict[str, Any] = {
        "from": actual_from,
        "to": recipients,
        "subject": subject,
        "html": html,
        "reply_to": reply_to_addr,
    }
    if text:
        payload["text"] = text
    if headers:
        payload["headers"] = headers

    try:
        response = resend.Emails.send(cast(resend.Emails.SendParams, payload))
        msg_id = response.get("id") if isinstance(response, dict) else getattr(response, "id", None)
        logger.info(f"Email sent successfully via Resend to {recipients}. ID: {msg_id}")
        return {
            "success": True,
            "id": msg_id,
            "response": response,
        }
    except Exception as exc:
        err_msg = str(exc)
        logger.error(f"Failed to send email via Resend to {recipients}: {err_msg}")

        # Resend Free / Test Mode Domain Restriction Notice
        if "only send testing emails to your own email address" in err_msg:
            logger.warning(
                f"[Resend Test Mode Notice] To send emails to external recipients ({recipients}), "
                "please verify your custom domain (e.g. skillscatalyst.in) at https://resend.com/domains. "
                "In testing mode, Resend only delivers to the account email (skillscatalyst5@gmail.com)."
            )
            # Notify the admin account about the registration
            try:
                admin_notice_html = f"""
                <div style="font-family: sans-serif; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h3 style="color: #4f46e5; margin: 0 0 12px 0;">New User Signup on SkillsCatalyst 🎉</h3>
                    <p>A new user signed up with email: <strong>{recipients}</strong></p>
                    <p style="color: #64748b; font-size: 13px;">
                        <em>Note: The welcome email was held by Resend because your custom domain is not yet verified on resend.com/domains.</em>
                    </p>
                </div>
                """
                resend.Emails.send(cast(resend.Emails.SendParams, {
                    "from": "SkillsCatalyst <welcome@skillscatalyst.in>",
                    "to": "skillscatalyst5@gmail.com",
                    "subject": f"New User Signup: {recipients[0] if recipients else 'New User'}",
                    "html": admin_notice_html,
                    "reply_to": "skillscatalyst5@gmail.com",
                }))
            except Exception:
                pass

        return {
            "success": False,
            "error": err_msg,
        }


def send_welcome_email(
    to: str,
    full_name: Optional[str] = None,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Sends a beautifully formatted welcome email to a newly signed up user.
    Uses 'SkillsCatalyst <welcome@skillscatalyst.in>' with reply-to 'skillscatalyst5@gmail.com'.
    Passes X-Entity-Ref-ID header for provider-level idempotency if user_id is provided.
    """
    name = full_name or "Learner"
    subject = "Welcome to SkillsCatalyst — Learn Faster. Grow Smarter! 🚀"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SkillsCatalyst</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <!-- Header Banner -->
            <tr>
                <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 36px 32px; text-align: left;">
                    <div style="font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                        Skills<span style="color: #67e8f9;">Catalyst</span>
                    </div>
                    <div style="color: #e0e7ff; font-size: 14px; font-weight: 600; margin-top: 6px;">
                        Learn Faster. Grow Smarter.
                    </div>
                </td>
            </tr>

            <!-- Body Content -->
            <tr>
                <td style="padding: 32px 32px 24px 32px;">
                    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0;">
                        Welcome aboard, {name}! 🎉
                    </h2>
                    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
                        We're thrilled to have you join <strong>SkillsCatalyst</strong>. Whether you're mastering Data Structures & Algorithms, sharpening your coding patterns, or prepping for top tech interviews, we've got you covered.
                    </p>

                    <!-- Feature Box -->
                    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                            Here's what you can do right away:
                        </div>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td style="padding: 6px 0; font-size: 14px; color: #334155;">
                                    🎯 <strong>Company 30-Day Question Banks</strong> — Practice verified questions for Google, Microsoft, Amazon, and TCS.
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-size: 14px; color: #334155;">
                                    ⚡ <strong>LeetCode Profile Sync</strong> — Connect your handle in Settings to track your solved problems & live contest rating.
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-size: 14px; color: #334155;">
                                    🧠 <strong>Foundation Tracks</strong> — Pick C, C++, Java, Python, or DSA to begin step-by-step learning modules.
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 32px 0 24px 0;">
                        <a href="https://www.skillscatalyst.in/dashboard" 
                           style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
                            Go to Your Dashboard →
                        </a>
                    </div>

                    <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 24px 0 0 0;">
                        Have questions or suggestions? Simply reply to this email at <a href="mailto:skillscatalyst5@gmail.com" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">skillscatalyst5@gmail.com</a>. We'd love to help!
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="padding: 20px 32px 28px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="font-size: 12px; color: #94a3b8; margin: 0 0 4px 0; font-weight: 600;">
                        © 2026 SkillsCatalyst. All rights reserved.
                    </p>
                    <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                        Support & Contact: <a href="mailto:skillscatalyst5@gmail.com" style="color: #64748b; text-decoration: none;">skillscatalyst5@gmail.com</a>
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    custom_headers = None
    if user_id:
        custom_headers = {"X-Entity-Ref-ID": f"welcome_{user_id}"}

    return send_email(
        to=to,
        subject=subject,
        html=html,
        from_email=RESEND_FROM_EMAIL or "SkillsCatalyst <welcome@skillscatalyst.in>",
        reply_to=RESEND_REPLY_TO or "skillscatalyst5@gmail.com",
        headers=custom_headers,
    )
