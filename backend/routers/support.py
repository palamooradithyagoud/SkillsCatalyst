import uuid
import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from backend.services.email_service import send_email

logger = logging.getLogger("skillscatalyst.support")

router = APIRouter(prefix="/api/support", tags=["Customer Support"])

FOUNDER_CONTACT = {
    "name": "Palamoor Adithya Goud",
    "role": "Founder & Chief Grievance Officer",
    "phone": "+91 7330602101",
    "raw_phone": "7330602101",
    "email": "palamooradithyagoud@gmail.com",
    "office_hours": "Monday – Saturday: 9:00 AM – 8:00 PM IST",
    "emergency_support": "24/7 priority response for platform and payment issues",
    "sla_acknowledgement": "Within 2 to 4 hours",
    "sla_resolution": "Within 24 hours (maximum 15 days for formal statutory grievances)"
}


class SupportTicketRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full Name of the user")
    email: str = Field(..., min_length=5, max_length=120, description="Contact email address")
    phone: Optional[str] = Field(default=None, max_length=20, description="Contact phone number")
    category: str = Field(
        default="General Inquiry",
        description="Category: Technical Issue, Roadmaps & Content, Billing & Subscriptions, Feature Request, Feedback, Other"
    )
    subject: str = Field(..., min_length=3, max_length=150, description="Subject of the support ticket")
    message: str = Field(..., min_length=10, max_length=3000, description="Detailed description of the issue or inquiry")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if "@" not in clean or "." not in clean.split("@")[-1] or len(clean) < 5:
            raise ValueError("Invalid email address format.")
        return clean


class SupportTicketResponse(BaseModel):
    success: bool
    ticket_id: str
    message: str
    created_at: str
    contact_support: dict


@router.get("/info", status_code=status.HTTP_200_OK)
def get_support_info():
    """Returns official contact information for SkillsCatalyst support & founder."""
    return {
        "success": True,
        "support_desk": FOUNDER_CONTACT,
        "applicable_policies": [
            "Privacy Policy (DPDP Act 2023 & GDPR Compliant)",
            "Terms of Service & Platform Code of Conduct",
            "Refund & Cancellation Policy (7-Day Pro Pass Guarantee)",
            "Customer Support & Grievance Redressal Policy (IT Intermediary Rules)",
            "Fair Usage & AI Mentor Debugging Policy"
        ]
    }


@router.post("/ticket", response_model=SupportTicketResponse, status_code=status.HTTP_200_OK)
async def submit_support_ticket(payload: SupportTicketRequest):
    """
    Submits a customer support ticket.
    Dispatches a real-time notification to Founder Palamoor Adithya Goud.
    Sends an automated confirmation acknowledging receipt to the user.
    """
    from datetime import timezone
    ticket_id = f"SC-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    created_at = datetime.now(timezone.utc).isoformat()

    logger.info(f"Received support ticket {ticket_id} from {payload.email} [{payload.category}]: {payload.subject}")

    # 1. Format Admin Notification Email
    admin_html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background: #0f172a; padding: 20px 24px; color: #ffffff;">
                <h2 style="margin: 0; font-size: 20px; font-weight: 700;">New Support Ticket [{ticket_id}]</h2>
                <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">SkillsCatalyst Customer Support Desk</p>
            </div>
            <div style="padding: 24px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                    <tr><td style="padding: 6px 0; color: #64748b; width: 120px;"><strong>User Name:</strong></td><td>{payload.name}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;"><strong>Email:</strong></td><td><a href="mailto:{payload.email}">{payload.email}</a></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;"><strong>Phone:</strong></td><td>{payload.phone or 'Not provided'}</td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;"><strong>Category:</strong></td><td><span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 600;">{payload.category}</span></td></tr>
                    <tr><td style="padding: 6px 0; color: #64748b;"><strong>Subject:</strong></td><td><strong>{payload.subject}</strong></td></tr>
                </table>
                <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
{payload.message}
                </div>
                <div style="margin-top: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                    Assigned to: <strong>Palamoor Adithya Goud (Founder & Lead Developer)</strong><br>
                    Direct reply target: <a href="mailto:{payload.email}">{payload.email}</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    # Dispatch email to Founder
    try:
        send_email(
            to="palamooradithyagoud@gmail.com",
            subject=f"[{ticket_id}] New Support Ticket: {payload.subject}",
            html=admin_html,
            reply_to=payload.email,
        )
    except Exception as e:
        logger.warning(f"Unable to dispatch email to admin via Resend: {e}")

    # 2. Format User Auto-Acknowledgement Email
    user_html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #10b981 0%, #0d9488 100%); padding: 24px; color: #ffffff;">
                <h2 style="margin: 0; font-size: 20px; font-weight: 800;">Ticket Received: {ticket_id}</h2>
                <p style="margin: 4px 0 0 0; color: #e6fffa; font-size: 13px;">We're on it! Our team is reviewing your query.</p>
            </div>
            <div style="padding: 24px; font-size: 14px; line-height: 1.6;">
                <p>Hello <strong>{payload.name}</strong>,</p>
                <p>Thank you for reaching out to SkillsCatalyst Customer Support. We have received your query regarding <strong>"{payload.subject}"</strong>.</p>
                
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">Ticket Details:</div>
                    <div style="color: #475569;"><strong>Ticket ID:</strong> {ticket_id}</div>
                    <div style="color: #475569;"><strong>Category:</strong> {payload.category}</div>
                    <div style="color: #475569;"><strong>Target SLA:</strong> Acknowledged within 2 hours • Resolved within 24 hours</div>
                </div>

                <p>If you need urgent assistance, you can also reach our founder directly:</p>
                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px; margin: 16px 0;">
                    <div style="font-weight: 700; color: #065f46;">Direct Founder Contact:</div>
                    <div style="color: #047857;"><strong>Palamoor Adithya Goud</strong> (Founder & Chief Grievance Officer)</div>
                    <div style="color: #047857;">Phone: <a href="tel:+917330602101" style="color: #059669; font-weight: bold;">+91 7330602101</a></div>
                    <div style="color: #047857;">Email: <a href="mailto:palamooradithyagoud@gmail.com" style="color: #059669; font-weight: bold;">palamooradithyagoud@gmail.com</a></div>
                </div>

                <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
                    Best regards,<br>
                    <strong>SkillsCatalyst Support Team</strong><br>
                    <a href="https://www.skillscatalyst.in" style="color: #0d9488;">www.skillscatalyst.in</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        send_email(
            to=payload.email,
            subject=f"[{ticket_id}] Your Support Ticket has been received — SkillsCatalyst",
            html=user_html,
            reply_to="palamooradithyagoud@gmail.com"
        )
    except Exception as e:
        logger.warning(f"Unable to dispatch confirmation to user via Resend: {e}")

    return SupportTicketResponse(
        success=True,
        ticket_id=ticket_id,
        message="Your support ticket has been submitted successfully. Founder Palamoor Adithya Goud will review and respond shortly.",
        created_at=created_at,
        contact_support=FOUNDER_CONTACT
    )
