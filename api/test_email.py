"""Test email sending with Purelymail SMTP."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent))

from app.utils.email_purelymail import send_email, send_welcome_email, send_password_reset_email


async def test_simple_email():
    """Test simple email sending."""
    print("Testing simple email...")
    result = await send_email(
        to_email="admin@scriptripper.com",  # Send to your admin email
        subject="ScriptRipper Email Test",
        html_content="<h1>Test Email</h1><p>This is a test email from ScriptRipper using Purelymail SMTP.</p>",
        text_content="Test Email\n\nThis is a test email from ScriptRipper using Purelymail SMTP.",
    )
    print(f"Simple email result: {'✅ Success' if result else '❌ Failed'}")
    return result


async def test_welcome_email():
    """Test welcome email template."""
    print("\nTesting welcome email...")
    result = await send_welcome_email(
        email="admin@scriptripper.com",
        name="Test User"
    )
    print(f"Welcome email result: {'✅ Success' if result else '❌ Failed'}")
    return result


async def test_password_reset_email():
    """Test password reset email template."""
    print("\nTesting password reset email...")
    result = await send_password_reset_email(
        email="admin@scriptripper.com",
        reset_token="test-token-123456789"
    )
    print(f"Password reset email result: {'✅ Success' if result else '❌ Failed'}")
    return result


async def main():
    """Run all tests."""
    print("=" * 60)
    print("ScriptRipper Email Testing")
    print("=" * 60)

    # Test simple email
    simple_ok = await test_simple_email()

    # Test welcome email
    welcome_ok = await test_welcome_email()

    # Test password reset email
    reset_ok = await test_password_reset_email()

    # Summary
    print("\n" + "=" * 60)
    print("Test Summary:")
    print("=" * 60)
    print(f"Simple Email:        {'✅ PASS' if simple_ok else '❌ FAIL'}")
    print(f"Welcome Email:       {'✅ PASS' if welcome_ok else '❌ FAIL'}")
    print(f"Password Reset Email: {'✅ PASS' if reset_ok else '❌ FAIL'}")
    print("=" * 60)

    if all([simple_ok, welcome_ok, reset_ok]):
        print("\n🎉 All tests passed! Email system is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the logs above for details.")

    print("\nCheck admin@scriptripper.com inbox for test emails.")


if __name__ == "__main__":
    asyncio.run(main())
