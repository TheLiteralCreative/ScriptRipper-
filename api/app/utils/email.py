"""Email utilities for sending transactional emails."""

import logging
from typing import Optional

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

from app.config.settings import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
) -> bool:
    """
    Send an email using SendGrid.

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
        text_content: Plain text content (optional)

    Returns:
        True if email was sent successfully, False otherwise
    """
    if not settings.SENDGRID_API_KEY:
        logger.warning("SendGrid API key not configured, email not sent")
        logger.info(f"Would send email to {to_email}: {subject}")
        logger.info(f"Content: {text_content or html_content}")
        return False

    try:
        message = Mail(
            from_email=Email(settings.FROM_EMAIL, "ScriptRipper"),
            to_emails=To(to_email),
            subject=subject,
            html_content=Content("text/html", html_content),
        )

        if text_content:
            message.add_content(Content("text/plain", text_content))

        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)

        if response.status_code >= 200 and response.status_code < 300:
            logger.info(f"Email sent successfully to {to_email}")
            return True
        else:
            logger.error(f"Failed to send email: {response.status_code} - {response.body}")
            return False

    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {str(e)}")
        return False


async def send_password_reset_email(email: str, reset_token: str) -> bool:
    """
    Send password reset email with token.

    Args:
        email: User's email address
        reset_token: Password reset token

    Returns:
        True if email was sent successfully
    """
    # Construct reset URL
    reset_url = f"{settings.STRIPE_CANCEL_URL.rsplit('/', 2)[0]}/reset-password?token={reset_token}"

    subject = "Reset Your ScriptRipper Password"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 30px;
                margin: 20px 0;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .header h1 {{
                color: #111827;
                font-size: 28px;
                font-weight: bold;
                margin: 0;
            }}
            .content {{
                background-color: white;
                border-radius: 8px;
                padding: 30px;
                margin-bottom: 20px;
            }}
            .button {{
                display: inline-block;
                background-color: #111827;
                color: white;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-weight: 600;
                text-align: center;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                color: #6b7280;
                font-size: 14px;
                margin-top: 30px;
            }}
            .warning {{
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 ScriptRipper</h1>
            </div>

            <div class="content">
                <h2>Reset Your Password</h2>
                <p>Hi there,</p>
                <p>We received a request to reset your password for your ScriptRipper account. Click the button below to create a new password:</p>

                <div style="text-align: center;">
                    <a href="{reset_url}" class="button">Reset Password</a>
                </div>

                <p>Or copy and paste this link into your browser:</p>
                <p style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">
                    {reset_url}
                </p>

                <div class="warning">
                    <strong>⚠️ Security Notice:</strong> This link will expire in 15 minutes. If you didn't request this password reset, you can safely ignore this email.
                </div>
            </div>

            <div class="footer">
                <p>This email was sent by ScriptRipper</p>
                <p>Questions? Contact us at support@scriptripper.dev</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Reset Your ScriptRipper Password

    Hi there,

    We received a request to reset your password for your ScriptRipper account.

    Click this link to create a new password:
    {reset_url}

    This link will expire in 15 minutes.

    If you didn't request this password reset, you can safely ignore this email.

    Questions? Contact us at support@scriptripper.dev
    """

    return await send_email(email, subject, html_content, text_content)


async def send_welcome_email(email: str, name: Optional[str] = None) -> bool:
    """
    Send welcome email to new user.

    Args:
        email: User's email address
        name: User's name (optional)

    Returns:
        True if email was sent successfully
    """
    subject = "Welcome to ScriptRipper! 🎉"

    greeting = f"Hi {name}," if name else "Hi there,"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ScriptRipper</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 30px;
                margin: 20px 0;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .header h1 {{
                color: #111827;
                font-size: 32px;
                font-weight: bold;
                margin: 0;
            }}
            .content {{
                background-color: white;
                border-radius: 8px;
                padding: 30px;
                margin-bottom: 20px;
            }}
            .feature {{
                margin: 15px 0;
                padding-left: 25px;
                position: relative;
            }}
            .feature:before {{
                content: "✓";
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
            }}
            .button {{
                display: inline-block;
                background-color: #111827;
                color: white;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-weight: 600;
                text-align: center;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                color: #6b7280;
                font-size: 14px;
                margin-top: 30px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to ScriptRipper!</h1>
            </div>

            <div class="content">
                <h2>Thanks for joining us!</h2>
                <p>{greeting}</p>
                <p>We're excited to have you on board. ScriptRipper helps you extract insights from transcripts with AI-powered analysis.</p>

                <h3>What you can do with your free account:</h3>
                <div class="feature">1 rip per day (analyze up to 5 prompts on a single transcript)</div>
                <div class="feature">Access to all standard analysis prompts</div>
                <div class="feature">Custom prompt support</div>
                <div class="feature">Multi-format export (.md, .txt, .json)</div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="{settings.STRIPE_CANCEL_URL.rsplit('/', 2)[0]}" class="button">Start Ripping!</a>
                </div>

                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <strong>Want unlimited access?</strong> Upgrade to Pro for just $5/month to unlock unlimited rips and priority processing.
                </p>
            </div>

            <div class="footer">
                <p>Questions? We're here to help!</p>
                <p>Contact us at support@scriptripper.dev</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Welcome to ScriptRipper!

    {greeting}

    We're excited to have you on board. ScriptRipper helps you extract insights from transcripts with AI-powered analysis.

    What you can do with your free account:
    - 1 rip per day (analyze up to 5 prompts on a single transcript)
    - Access to all standard analysis prompts
    - Custom prompt support
    - Multi-format export (.md, .txt, .json)

    Want unlimited access? Upgrade to Pro for just $5/month to unlock unlimited rips and priority processing.

    Questions? Contact us at support@scriptripper.dev
    """

    return await send_email(email, subject, html_content, text_content)
