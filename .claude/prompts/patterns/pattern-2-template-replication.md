# Pattern #2: Template Replication

**Use Case**: Implement new component by following an existing template/pattern

**Expected Time**: 30-60 minutes

**Best For**:
- Adding new LLM providers (OpenAI, Anthropic, Cohere)
- Adding new payment processors (Stripe, PayPal, Square)
- Creating new database adapters (MySQL, PostgreSQL, MongoDB)
- Building new API clients (REST, GraphQL)
- Implementing new authentication methods (OAuth, SAML)

---

## Instructions

1. Fill in all `[PLACEHOLDERS]` below
2. Copy the entire filled-in prompt
3. Send to Task tool with `subagent_type="general-purpose"`
4. Review the comprehensive report

---

# Task: Implement [NEW_COMPONENT] Following [TEMPLATE_COMPONENT] Pattern

## Objective

Implement a production-ready [NEW_COMPONENT] for [PROJECT_NAME] by following the existing [TEMPLATE_COMPONENT] pattern. This component must implement the [BASE_INTERFACE] interface and integrate seamlessly with the existing [SYSTEM_NAME] system.

## Context

- **Project**: [PROJECT_NAME]
- **Tech Stack**: [TECH_STACK]
- **Current State**:
  - [EXISTING_COMPONENT_1] and [EXISTING_COMPONENT_2] implemented
  - [NEW_COMPONENT] raises NotImplementedError in factory/router
  - [NEW_COMPONENT] SDK: [SDK_NAME] version [VERSION] (check requirements.txt or package.json)
  - Users cannot use [NEW_COMPONENT] functionality
- **Target State**:
  - Fully functional [NEW_COMPONENT] following same interface
  - Factory/router can instantiate [NEW_COMPONENT]
  - Supports [KEY_FEATURES]
  - [ADDITIONAL_REQUIREMENT] (e.g., accurate pricing, error handling)

## Scope

**Files to analyze:**
- `[PATH_TO_BASE_INTERFACE]` - Interface definition
- `[PATH_TO_TEMPLATE_COMPONENT]` - Template implementation to follow
- `[PATH_TO_FACTORY_OR_ROUTER]` - Factory/router to update

**Files to create:**
- `[PATH_TO_NEW_COMPONENT]` - New [NEW_COMPONENT] implementation

**Files to modify:**
- `[PATH_TO_FACTORY_OR_ROUTER]` - Enable [NEW_COMPONENT] in factory/router
- `[PATH_TO_REQUIREMENTS]` - Add [SDK_NAME] dependency
- `[PATH_TO_ENV_EXAMPLE_1]` - Document environment variables
- `[PATH_TO_ENV_EXAMPLE_2]` - (if multiple services)

## Requirements

### 1. DISCOVERY PHASE

**A. Analyze the Interface**

Read `[PATH_TO_BASE_INTERFACE]` and extract:
- Required methods to implement
- Method signatures (parameters, return types)
- Abstract properties
- Response/return structures
- Error handling expectations

**B. Study the Template**

Read `[PATH_TO_TEMPLATE_COMPONENT]` and understand:
- Initialization pattern
- How each method works
- Error handling approach
- [SPECIFIC_ASPECT_1] (e.g., token counting, request formatting)
- [SPECIFIC_ASPECT_2] (e.g., cost calculation, response parsing)
- [SPECIFIC_ASPECT_3] (e.g., retry logic, timeout handling)
- Logger integration
- Return value structures

**C. Check [NEW_COMPONENT] SDK/API**

Research:
- SDK version: [SDK_NAME]==[VERSION]
- Official documentation: [DOCS_URL]
- API differences from [TEMPLATE_COMPONENT]
- Authentication method
- Rate limits
- Special requirements

### 2. ANALYSIS PHASE

**Extract Implementation Pattern:**

From [TEMPLATE_COMPONENT], identify:

1. **Initialization pattern**:
   - How API key is handled
   - How default configuration is set
   - Client/connection initialization

2. **Core method(s)**:
   - Request building
   - API call execution
   - Response parsing
   - Error handling

3. **[SPECIFIC_FEATURE_1]** (e.g., Cost calculation):
   - Data structure
   - Calculation method
   - Fallback behavior

4. **[SPECIFIC_FEATURE_2]** (e.g., Token tracking):
   - How to extract from response
   - How to count/estimate

5. **Error handling**:
   - What exceptions to catch
   - How to wrap errors
   - Retry logic

6. **Metadata**:
   - What additional info to return
   - How to structure it

**[NEW_COMPONENT]-Specific Considerations:**

Identify API differences:
- [API_DIFFERENCE_1] (e.g., "Anthropic requires max_tokens parameter")
- [API_DIFFERENCE_2] (e.g., "System prompt is separate parameter, not in messages")
- [API_DIFFERENCE_3] (e.g., "Response structure uses content[0].text instead of choices[0].message")

### 3. IMPLEMENTATION PHASE

#### A. Create [NEW_COMPONENT] Implementation

Create `[PATH_TO_NEW_COMPONENT]`:

```[LANGUAGE]
"""[NEW_COMPONENT] implementation."""

from typing import Optional
from [SDK_IMPORT] import [CLIENT_CLASS]

from [BASE_IMPORT] import [BASE_CLASS], [RESPONSE_CLASS]
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


# [CONFIGURATION_DATA] (e.g., pricing, endpoints, models)
# Source: [DATA_SOURCE_URL]
[CONFIG_CONSTANT_NAME] = {
    "[ITEM_1]": {[ITEM_1_CONFIG]},
    "[ITEM_2]": {[ITEM_2_CONFIG]},
    # Add all items here
}


class [NEW_COMPONENT_CLASS]([BASE_CLASS]):
    """[NEW_COMPONENT] implementation."""

    def __init__(self, [INIT_PARAMS]):
        """Initialize [NEW_COMPONENT].

        Args:
            [PARAM_1]: [DESCRIPTION]
            [PARAM_2]: [DESCRIPTION] (default: [DEFAULT])
        """
        super().__init__([SUPER_PARAMS])
        self.[CLIENT_NAME] = [CLIENT_CLASS]([CLIENT_INIT_PARAMS])

    async def [METHOD_1](
        self,
        [METHOD_PARAMS],
        **kwargs,
    ) -> [RETURN_TYPE]:
        """[METHOD_DESCRIPTION].

        Args:
            [PARAM_1]: [DESCRIPTION]
            [PARAM_2]: [DESCRIPTION]
            **kwargs: Additional [NEW_COMPONENT] parameters

        Returns:
            [RETURN_TYPE] with [DESCRIPTION]
        """
        # Build request parameters
        [REQUEST_BUILDING_LOGIC]

        # Call API
        logger.debug(f"Calling [NEW_COMPONENT] API with [PARAMS]")
        [API_CALL_LOGIC]

        # Extract response data
        [RESPONSE_EXTRACTION_LOGIC]

        # Calculate/process additional data
        [ADDITIONAL_PROCESSING]

        logger.debug(
            f"[NEW_COMPONENT] response: [LOG_MESSAGE]"
        )

        return [RESPONSE_CLASS](
            [RESPONSE_FIELDS]
        )

    def [METHOD_2](
        self, [METHOD_PARAMS]
    ) -> [RETURN_TYPE]:
        """[METHOD_DESCRIPTION].

        Args:
            [PARAM_1]: [DESCRIPTION]
            [PARAM_2]: [DESCRIPTION]

        Returns:
            [RETURN_TYPE]
        """
        [METHOD_IMPLEMENTATION]

    @property
    def [PROPERTY_NAME](self) -> [PROPERTY_TYPE]:
        """Get [PROPERTY_DESCRIPTION]."""
        return "[PROPERTY_VALUE]"
```

**NOTE**: This is a skeleton. Fill in all implementation details based on [TEMPLATE_COMPONENT] pattern and [NEW_COMPONENT] API documentation.

#### B. Update Factory/Router

Modify `[PATH_TO_FACTORY_OR_ROUTER]`:

**Find this code block:**
```[LANGUAGE]
[OLD_FACTORY_CODE]
```

**Replace with:**
```[LANGUAGE]
[NEW_FACTORY_CODE]
```

#### C. Update Dependencies

**Add to `[PATH_TO_REQUIREMENTS]`:**
```
[SDK_NAME]==[VERSION]  # [NEW_COMPONENT] SDK
```

#### D. Update Environment Examples

**Add to `[PATH_TO_ENV_EXAMPLE_1]`:**
```bash
# [NEW_COMPONENT] API
[ENV_VAR_NAME]=[EXAMPLE_VALUE]  # From [WHERE_TO_GET]
```

**Add to `[PATH_TO_ENV_EXAMPLE_2]`** (if applicable):
```bash
# [NEW_COMPONENT] API
[ENV_VAR_NAME]=[EXAMPLE_VALUE]  # From [WHERE_TO_GET]
```

### 4. VALIDATION PHASE

Verify:

- [ ] All abstract methods implemented
- [ ] Method signatures match interface exactly
- [ ] Factory/router integration complete
- [ ] NotImplementedError removed
- [ ] Syntax check passed
- [ ] Imports correct
- [ ] Logging integrated throughout
- [ ] [SPECIFIC_VALIDATION_1] (e.g., "Pricing accurate as of [DATE]")
- [ ] [SPECIFIC_VALIDATION_2] (e.g., "All models supported")
- [ ] All [NEW_COMPONENT]-specific requirements handled

## Deliverables

Return a comprehensive report with:

### 1. Discovery Summary
- Interface analysis: [KEY_FINDINGS]
- Template analysis: [PATTERNS_IDENTIFIED]
- [NEW_COMPONENT] SDK version: [VERSION]
- API differences identified: [NUMBER]

### 2. Implementation Summary
- Files created: [LIST_WITH_LINE_COUNTS]
- Files modified: [LIST_WITH_CHANGES]
- Lines of code added: [NUMBER]
- [SPECIFIC_METRIC] (e.g., "Models supported: [NUMBER]")

### 3. [FEATURE_LIST] (e.g., Supported Models)

List all [ITEMS] with [DETAILS]:
- [ITEM_1]: [DETAILS]
- [ITEM_2]: [DETAILS]

### 4. Usage Example

Show how to use the new implementation:

```[LANGUAGE]
[USAGE_EXAMPLE_CODE]
```

### 5. Key Differences from [TEMPLATE_COMPONENT]

Document API/implementation differences:
- [DIFFERENCE_1]
- [DIFFERENCE_2]
- [DIFFERENCE_3]

### 6. Integration Verification

- Factory/router properly instantiates: ✅/❌
- Environment variables documented: ✅/❌
- Dependencies added: ✅/❌
- Syntax valid: ✅/❌

## Success Criteria

- ✅ [NEW_COMPONENT_CLASS] created and implements [BASE_CLASS]
- ✅ Factory/router successfully creates [NEW_COMPONENT] instances
- ✅ NotImplementedError removed from factory/router
- ✅ All methods match interface signature exactly
- ✅ [KEY_METHOD] returns [RESPONSE_CLASS] correctly
- ✅ [SPECIFIC_FEATURE_1] implemented (e.g., "Cost calculation accurate")
- ✅ [SPECIFIC_FEATURE_2] implemented (e.g., "Error handling robust")
- ✅ Logger integrated throughout
- ✅ Environment variables documented
- ✅ No syntax errors

---

**Execute this task autonomously and return the comprehensive report described above.**

---

## Fill-In Guide

Replace these placeholders before sending:

### Component Details
- `[NEW_COMPONENT]`: e.g., "OpenAI", "Stripe", "PostgreSQL"
- `[TEMPLATE_COMPONENT]`: e.g., "Gemini", "PayPal", "MySQL"
- `[NEW_COMPONENT_CLASS]`: e.g., "OpenAIProvider", "StripeProcessor"
- `[PROJECT_NAME]`: Your project name
- `[BASE_INTERFACE]`: e.g., "BaseLLMProvider", "PaymentProcessor"
- `[BASE_CLASS]`: Class name of interface
- `[RESPONSE_CLASS]`: e.g., "LLMResponse", "PaymentResult"
- `[SYSTEM_NAME]`: e.g., "LLM factory", "payment gateway"

### Existing State
- `[EXISTING_COMPONENT_1/2]`: Components already implemented
- `[SDK_NAME]`: Package name (e.g., "openai", "stripe")
- `[VERSION]`: SDK version number
- `[KEY_FEATURES]`: Main features to support
- `[ADDITIONAL_REQUIREMENT]`: Other requirements

### File Paths
- `[PATH_TO_*]`: Actual file paths in your project
- `[PATH_TO_REQUIREMENTS]`: e.g., "requirements.txt", "package.json"
- `[PATH_TO_ENV_EXAMPLE_1/2]`: e.g., "api/.env.example"

### Technical Details
- `[TECH_STACK]`: Technologies used
- `[LANGUAGE]`: Programming language for code blocks
- `[SDK_IMPORT]`: Import path (e.g., "openai", "stripe")
- `[CLIENT_CLASS]`: SDK client class (e.g., "AsyncOpenAI")
- `[BASE_IMPORT]`: Where base class lives
- `[DOCS_URL]`: Official documentation URL

### Implementation Specifics
- `[SPECIFIC_ASPECT_1/2/3]`: Key aspects to study in template
- `[API_DIFFERENCE_1/2/3]`: How new API differs from template
- `[CONFIG_CONSTANT_NAME]`: e.g., "OPENAI_PRICING", "STRIPE_FEES"
- `[INIT_PARAMS]`: Constructor parameters
- `[METHOD_1/2]`: Method names to implement
- `[PROPERTY_NAME]`: Property name
- `[ENV_VAR_NAME]`: e.g., "OPENAI_API_KEY"
- `[EXAMPLE_VALUE]`: Example env var value
- `[WHERE_TO_GET]`: Where to obtain credentials

### Validation
- `[SPECIFIC_VALIDATION_1/2]`: Custom validation items
- `[SPECIFIC_METRIC]`: Metric to report (e.g., "models supported")
- `[FEATURE_LIST]`: e.g., "Supported Models", "Payment Methods"

---

*Created: 2025-11-07*
*Pattern: Template Replication*
*Estimated Time: 30-60 minutes*
