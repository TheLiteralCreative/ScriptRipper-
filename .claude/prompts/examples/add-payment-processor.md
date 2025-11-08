# Ready-to-Use: Add Payment Processor

**Pattern**: Template Replication (Pattern #2)
**Expected Time**: 40-60 minutes
**Use For**: Adding PayPal, Square, Paddle, etc.

## Instructions

1. Fill in all `[PLACEHOLDERS]` below
2. Copy the entire filled-in prompt
3. Send to Task tool with `subagent_type="general-purpose"`
4. Review the comprehensive report

---

# Task: Implement [PROVIDER_NAME] Payment Processor

## Objective

Implement a production-ready [PROVIDER_NAME] payment processor for [PROJECT_NAME] by following the existing [TEMPLATE_PROVIDER] provider pattern. This processor must implement the BasePaymentProcessor interface and integrate seamlessly with the existing payment gateway system.

## Context

- **Project**: [PROJECT_NAME]
- **Tech Stack**: [FRAMEWORK], [LANGUAGE], async/await
- **Current State**:
  - [EXISTING_PROVIDER_1] and [EXISTING_PROVIDER_2] processors implemented
  - [PROVIDER_NAME] raises NotImplementedError in factory
  - [PROVIDER_NAME] SDK: [SDK_NAME] version [VERSION] (check requirements)
  - Users cannot use [PROVIDER_NAME] for payments
- **Target State**:
  - Fully functional [PROVIDER_NAME] processor following same interface
  - Factory can instantiate [PROVIDER_NAME] processor
  - Supports payment creation, capture, refund operations
  - Webhook signature verification
  - Accurate fee calculation based on current pricing

## Scope

**Files to analyze:**
- `[PATH_TO_BASE_INTERFACE]` - Interface definition (BasePaymentProcessor)
- `[PATH_TO_TEMPLATE_PROVIDER]` - Template implementation (e.g., StripeProcessor)
- `[PATH_TO_FACTORY]` - Factory to update

**Files to create:**
- `[PATH_TO_NEW_PROCESSOR]` - New [PROVIDER_NAME] processor
- `[PATH_TO_WEBHOOK_HANDLER]` - Webhook handler (if separate)

**Files to modify:**
- `[PATH_TO_FACTORY]` - Enable [PROVIDER_NAME] in factory
- `[PATH_TO_ROUTES]` - Add webhook endpoint
- `api/requirements.txt` - Add [SDK_NAME]
- `api/.env.example` - Document [PROVIDER_NAME] keys
- `worker/.env.example` - Document [PROVIDER_NAME] keys (if needed)

## Requirements

### 1. DISCOVERY PHASE

**A. Analyze the Interface**

Read `[PATH_TO_BASE_INTERFACE]` and extract:
- Required methods to implement
- `create_payment()` signature
- `capture_payment()` signature
- `refund_payment()` signature
- `verify_webhook()` signature
- PaymentResult structure
- Method signatures and return types
- Error handling expectations

**B. Study the Template**

Read `[PATH_TO_TEMPLATE_PROVIDER]` and understand:
- Initialization pattern (API key, secret key, environment)
- How create_payment() works
- How capture_payment() works (if applicable)
- How refund_payment() works
- Webhook signature verification approach
- Fee calculation implementation
- Error handling patterns
- Return value structures (PaymentResult)
- Logger integration

**C. Check [PROVIDER_NAME] SDK**

Research:
- SDK version: [SDK_NAME]==[VERSION]
- Official documentation: [API_DOCS_URL]
- Authentication method (API key, secret, OAuth)
- Payment flow (one-step vs. two-step)
- Webhook signature verification method
- Fee structure and pricing

### 2. ANALYSIS PHASE

**Extract Implementation Pattern:**

From [TEMPLATE_PROVIDER], identify:

1. **Constructor pattern**:
   - API key handling
   - Secret key handling
   - Environment (sandbox/production)
   - Client initialization

2. **create_payment() method**:
   - How to build payment request
   - Required parameters
   - Optional parameters
   - Response parsing
   - Error handling

3. **capture_payment() method** (if two-step):
   - How to capture authorized payment
   - Response handling

4. **refund_payment() method**:
   - Full vs. partial refund support
   - Request structure
   - Response parsing

5. **verify_webhook() method**:
   - Signature verification algorithm
   - Payload validation
   - Event type extraction

6. **Fee calculation**:
   - Fee structure (percentage + fixed)
   - Currency considerations
   - Calculation method

**[PROVIDER_NAME]-Specific Considerations:**

Identify API differences:
- [API_DIFFERENCE_1] (e.g., "PayPal uses OAuth instead of API key")
- [API_DIFFERENCE_2] (e.g., "Square requires location_id parameter")
- [API_DIFFERENCE_3] (e.g., "Paddle uses vendor_id and vendor_auth_code")
- Payment flow differences (one-step vs. authorize/capture)
- Webhook format differences
- Fee structure differences

### 3. IMPLEMENTATION PHASE

#### A. Create [PROVIDER_NAME] Processor File

Create `[PATH_TO_NEW_PROCESSOR]`:

```python
"""[PROVIDER_NAME] payment processor."""

from typing import Optional, Dict, Any
from [SDK_IMPORT] import [CLIENT_CLASS]

from app.services.payment.base import BasePaymentProcessor, PaymentResult
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


# [PROVIDER_NAME] fee structure (as of [DATE])
# Source: [PRICING_URL]
[PROVIDER_NAME_UPPER]_FEES = {
    "percentage": [PERCENTAGE],  # e.g., 2.9 for 2.9%
    "fixed_usd": [FIXED_FEE],    # e.g., 0.30 for $0.30
    # Add currency-specific fees if needed
}


class [PROVIDER_NAME]Processor(BasePaymentProcessor):
    """[PROVIDER_NAME] payment processor implementation."""

    def __init__(
        self,
        api_key: str,
        secret_key: Optional[str] = None,
        environment: str = "production"
    ):
        """Initialize [PROVIDER_NAME] processor.

        Args:
            api_key: [PROVIDER_NAME] API key
            secret_key: [PROVIDER_NAME] secret key (for webhooks)
            environment: "sandbox" or "production"
        """
        super().__init__(api_key, secret_key, environment)

        # Initialize client based on environment
        [CLIENT_INITIALIZATION]

    async def create_payment(
        self,
        amount: float,
        currency: str = "usd",
        customer_email: Optional[str] = None,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs,
    ) -> PaymentResult:
        """Create a payment with [PROVIDER_NAME].

        Args:
            amount: Amount in currency units (e.g., 10.00 for $10)
            currency: Currency code (e.g., "usd")
            customer_email: Customer email
            description: Payment description
            metadata: Additional metadata
            **kwargs: Additional [PROVIDER_NAME] parameters

        Returns:
            PaymentResult with payment details
        """
        # [IMPLEMENTATION NOTES - CUSTOMIZE BASED ON API]

        # Build payment request
        # Convert amount to cents/smallest unit if needed
        # Call API
        # Extract response
        # Calculate fees
        # Return PaymentResult

        pass  # Replace with actual implementation

    async def capture_payment(
        self,
        payment_id: str,
        amount: Optional[float] = None,
        **kwargs,
    ) -> PaymentResult:
        """Capture a previously authorized payment.

        Args:
            payment_id: Payment ID to capture
            amount: Amount to capture (None for full amount)
            **kwargs: Additional parameters

        Returns:
            PaymentResult with capture details
        """
        # [IMPLEMENTATION - ONLY IF PROVIDER SUPPORTS TWO-STEP]
        pass

    async def refund_payment(
        self,
        payment_id: str,
        amount: Optional[float] = None,
        reason: Optional[str] = None,
        **kwargs,
    ) -> PaymentResult:
        """Refund a payment.

        Args:
            payment_id: Payment ID to refund
            amount: Amount to refund (None for full refund)
            reason: Refund reason
            **kwargs: Additional parameters

        Returns:
            PaymentResult with refund details
        """
        # [IMPLEMENTATION]
        pass

    def verify_webhook(
        self,
        payload: bytes,
        signature: str,
        **kwargs,
    ) -> Dict[str, Any]:
        """Verify webhook signature and parse event.

        Args:
            payload: Raw webhook payload
            signature: Webhook signature header
            **kwargs: Additional verification parameters

        Returns:
            Parsed event data

        Raises:
            ValueError: If signature verification fails
        """
        # [IMPLEMENTATION - BASED ON PROVIDER'S VERIFICATION METHOD]
        pass

    def calculate_fees(
        self,
        amount: float,
        currency: str = "usd"
    ) -> float:
        """Calculate [PROVIDER_NAME] fees.

        Args:
            amount: Payment amount
            currency: Currency code

        Returns:
            Fee amount
        """
        fees = [PROVIDER_NAME_UPPER]_FEES

        # Calculate percentage fee
        percentage_fee = amount * (fees["percentage"] / 100)

        # Add fixed fee
        fixed_fee = fees.get(f"fixed_{currency.lower()}", fees["fixed_usd"])

        total_fee = percentage_fee + fixed_fee

        return round(total_fee, 2)

    @property
    def provider_name(self) -> str:
        """Get provider name."""
        return "[PROVIDER_NAME_LOWER]"
```

**NOTE**: This is a skeleton. Agent should fill in all method implementations based on [TEMPLATE_PROVIDER] pattern and [PROVIDER_NAME] API docs.

#### B. Update Factory

Modify `[PATH_TO_FACTORY]`:

**Find this code block:**
```python
elif provider.lower() == "[PROVIDER_NAME_LOWER]":
    # TODO: Implement [PROVIDER_NAME] processor
    raise NotImplementedError("[PROVIDER_NAME] processor not yet implemented")
```

**Replace with:**
```python
elif provider.lower() == "[PROVIDER_NAME_LOWER]":
    from [IMPORT_PATH] import [PROVIDER_NAME]Processor
    api_key = api_key or settings.[PROVIDER_NAME_UPPER]_API_KEY
    secret_key = settings.[PROVIDER_NAME_UPPER]_SECRET_KEY
    if not api_key:
        raise ValueError("[PROVIDER_NAME] API key not configured")
    return [PROVIDER_NAME]Processor(
        api_key=api_key,
        secret_key=secret_key,
        environment=settings.ENVIRONMENT
    )
```

#### C. Add Webhook Route

Modify `[PATH_TO_ROUTES]`:

```python
@router.post("/webhooks/[PROVIDER_NAME_LOWER]")
async def [PROVIDER_NAME_LOWER]_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle [PROVIDER_NAME] webhooks."""
    payload = await request.body()
    signature = request.headers.get("[SIGNATURE_HEADER]")

    # Get processor
    processor = get_payment_processor("[PROVIDER_NAME_LOWER]")

    try:
        # Verify webhook
        event = processor.verify_webhook(payload, signature)

        # Process event
        logger.info(f"[PROVIDER_NAME] webhook received: {event.get('type')}")

        # Handle different event types
        # [EVENT_HANDLING_LOGIC]

        return {"status": "success"}

    except ValueError as e:
        logger.error(f"[PROVIDER_NAME] webhook verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        logger.error(f"[PROVIDER_NAME] webhook error: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")
```

#### D. Update Requirements

**Add to `api/requirements.txt`**:
```
[SDK_NAME]==[VERSION]  # [PROVIDER_NAME] SDK
```

**Add to `worker/requirements.txt`** (if needed):
```
[SDK_NAME]==[VERSION]  # [PROVIDER_NAME] SDK
```

#### E. Update Environment Examples

**Add to `api/.env.example`:**
```bash
# [PROVIDER_NAME] Payment Processor
[PROVIDER_NAME_UPPER]_API_KEY=[API_KEY_PREFIX]...  # From [API_KEY_URL]
[PROVIDER_NAME_UPPER]_SECRET_KEY=[SECRET_PREFIX]...  # For webhook verification
```

**Add to `worker/.env.example`** (if needed):
```bash
# [PROVIDER_NAME] Payment Processor
[PROVIDER_NAME_UPPER]_API_KEY=[API_KEY_PREFIX]...
```

### 4. VALIDATION PHASE

Verify:

- [ ] All abstract methods implemented
- [ ] Factory integration complete
- [ ] NotImplementedError removed
- [ ] Webhook route added
- [ ] Syntax check passed
- [ ] Imports correct
- [ ] Logging integrated
- [ ] Fee calculation accurate (as of [DATE])
- [ ] Webhook signature verification implemented
- [ ] All [PROVIDER_NAME]-specific requirements handled

## Deliverables

Return a comprehensive report with:

### 1. Discovery Summary
- Interface analysis: [KEY_FINDINGS]
- Template analysis: [PATTERNS_IDENTIFIED]
- [PROVIDER_NAME] SDK version: [VERSION]
- API differences identified: [NUMBER]

### 2. Implementation Summary
- Files created: [LIST_WITH_LINE_COUNTS]
- Files modified: [LIST_WITH_CHANGES]
- Lines of code added: [NUMBER]
- Payment operations supported: [LIST]

### 3. Supported Operations

- **Payment Creation**: ✅ Implemented
- **Payment Capture**: ✅/❌ Implemented (if applicable)
- **Refunds**: ✅ Implemented
- **Webhook Verification**: ✅ Implemented
- **Fee Calculation**: ✅ Implemented

### 4. Fee Structure

- Percentage fee: [PERCENTAGE]%
- Fixed fee: $[AMOUNT] USD
- Other fees: [IF_APPLICABLE]

### 5. Usage Example

**Create a payment**:
```python
[USAGE_EXAMPLE_CREATE]
```

**Process refund**:
```python
[USAGE_EXAMPLE_REFUND]
```

**Handle webhook**:
```python
[USAGE_EXAMPLE_WEBHOOK]
```

### 6. Key Differences from [TEMPLATE_PROVIDER]

- [DIFFERENCE_1]
- [DIFFERENCE_2]
- [DIFFERENCE_3]

### 7. Webhook Configuration

- Webhook URL: `[WEBHOOK_URL]`
- Signature header: `[SIGNATURE_HEADER]`
- Supported events: [EVENT_LIST]

## Success Criteria

- ✅ [PROVIDER_NAME]Processor class created and implements BasePaymentProcessor
- ✅ Factory successfully creates [PROVIDER_NAME] instances
- ✅ NotImplementedError removed from factory
- ✅ All payment operations implemented
- ✅ Webhook signature verification works
- ✅ Fee calculation accurate per current pricing
- ✅ Webhook endpoint added to routes
- ✅ Logger integrated throughout
- ✅ Environment variables documented
- ✅ No syntax errors

---

**Execute this task autonomously and return the comprehensive report described above.**

---

## Fill-In Guide

Replace these placeholders before sending:

- `[PROVIDER_NAME]`: e.g., "PayPal", "Square", "Paddle"
- `[PROJECT_NAME]`: Your project name
- `[TEMPLATE_PROVIDER]`: e.g., "Stripe", "Braintree" (which to copy)
- `[EXISTING_PROVIDER_1/2]`: e.g., "Stripe", "Braintree"
- `[SDK_NAME]`: e.g., "paypal-checkout-serversdk", "squareup"
- `[VERSION]`: SDK version number
- `[FRAMEWORK]`: e.g., "FastAPI", "Express", "Django"
- `[LANGUAGE]`: e.g., "Python", "TypeScript"
- `[PATH_TO_*]`: Actual file paths in your project
- `[SDK_IMPORT]`: e.g., "paypalcheckoutsdk", "square.client"
- `[CLIENT_CLASS]`: e.g., "PayPalHttpClient", "Client"
- `[API_DOCS_URL]`: Official API documentation URL
- `[API_DIFFERENCE_1/2/3]`: Important API quirks
- `[DATE]`: Current date
- `[PRICING_URL]`: Provider's pricing page
- `[PERCENTAGE]`: Fee percentage (e.g., 2.9)
- `[FIXED_FEE]`: Fixed fee per transaction (e.g., 0.30)
- `[PROVIDER_NAME_UPPER]`: e.g., "PAYPAL", "SQUARE"
- `[PROVIDER_NAME_LOWER]`: e.g., "paypal", "square"
- `[IMPORT_PATH]`: e.g., "app.services.payment.paypal"
- `[API_KEY_PREFIX]`: e.g., "pk_", "sq_"
- `[SECRET_PREFIX]`: e.g., "sk_", "whsec_"
- `[API_KEY_URL]`: Where to get API keys
- `[SIGNATURE_HEADER]`: Webhook signature header name
- `[WEBHOOK_URL]`: Your webhook endpoint

---

*Created: 2025-11-07*
*Last Updated: 2025-11-07*
*Pattern: Template Replication (#2)*
