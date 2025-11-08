# Ready-to-Use: Add New LLM Provider

**Pattern**: Template Replication (Pattern #2)
**Expected Time**: 30-40 minutes
**Use For**: Adding Cohere, Mistral, Together AI, etc.

## Instructions

1. Fill in all `[PLACEHOLDERS]` below
2. Copy the entire filled-in prompt
3. Send to Task tool with `subagent_type="general-purpose"`
4. Review the comprehensive report

---

# Task: Implement [PROVIDER_NAME] LLM Provider

## Objective

Implement a production-ready [PROVIDER_NAME] provider for [PROJECT_NAME] by following the existing [TEMPLATE_PROVIDER] provider pattern. This provider must implement the BaseLLMProvider interface and integrate seamlessly with the existing LLM factory system.

## Context

- **Project**: [PROJECT_NAME]
- **Tech Stack**: FastAPI, Python 3.11+, async/await
- **Current State**:
  - [EXISTING_PROVIDER_1] and [EXISTING_PROVIDER_2] providers implemented
  - [PROVIDER_NAME] raises NotImplementedError in factory
  - [PROVIDER_NAME] SDK: [SDK_NAME version VERSION] (check requirements.txt)
  - Users cannot select [PROVIDER_NAME] models
- **Target State**:
  - Fully functional [PROVIDER_NAME] provider following same interface
  - Factory can instantiate [PROVIDER_NAME] provider
  - Supports multiple [PROVIDER_NAME] models
  - Accurate cost calculation based on current pricing

## Scope

**Files to analyze:**
- `[PATH_TO_BASE_INTERFACE]` - Interface definition
- `[PATH_TO_TEMPLATE_PROVIDER]` - Template implementation
- `[PATH_TO_FACTORY]` - Factory to update

**Files to create:**
- `[PATH_TO_NEW_PROVIDER]` - New [PROVIDER_NAME] provider

**Files to modify:**
- `[PATH_TO_FACTORY]` - Enable [PROVIDER_NAME] in factory
- `api/requirements.txt` - Add [SDK_NAME]
- `api/.env.example` - Document [PROVIDER_NAME]_API_KEY
- `worker/.env.example` - Document [PROVIDER_NAME]_API_KEY

## Requirements

### 1. DISCOVERY PHASE

**A. Analyze the Interface**
Read `[PATH_TO_BASE_INTERFACE]` and extract:
- Required methods to implement
- LLMResponse structure
- Method signatures
- Abstract properties

**B. Study the Template**
Read `[PATH_TO_TEMPLATE_PROVIDER]` and understand:
- Initialization pattern
- How generate() method works
- Token counting approach
- Cost calculation implementation
- Error handling patterns
- Return value structure
- Logger integration

**C. Check [PROVIDER_NAME] SDK**
- SDK version: [SDK_NAME]==[VERSION]
- Use official [PROVIDER_NAME] Python SDK async API
- Latest version: Check for newer stable version

### 2. ANALYSIS PHASE

**Extract Implementation Pattern:**

From [TEMPLATE_PROVIDER], identify:
1. **Constructor pattern**: API key, default model, client initialization
2. **Generate method**: Async, returns LLMResponse
3. **Cost calculation**: Per-model pricing lookup
4. **Error handling**: What exceptions to catch
5. **Token tracking**: How to extract from response
6. **Metadata**: What additional info to return

**[PROVIDER_NAME]-Specific Considerations:**
- [API_SPECIFIC_NOTE_1]
- [API_SPECIFIC_NOTE_2]
- [API_SPECIFIC_NOTE_3]

### 3. IMPLEMENTATION PHASE

#### A. Create [PROVIDER_NAME] Provider File

Create `[PATH_TO_NEW_PROVIDER]`:

```python
"""[PROVIDER_NAME] LLM provider."""

from typing import Optional
from [SDK_IMPORT] import [CLIENT_CLASS]

from app.services.llm.base import BaseLLMProvider, LLMResponse
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


# [PROVIDER_NAME] pricing per 1M tokens (as of [DATE])
# Source: [PRICING_URL]
[PROVIDER_NAME_UPPER]_PRICING = {
    "[MODEL_1]": {"input": [PRICE], "output": [PRICE]},
    "[MODEL_2]": {"input": [PRICE], "output": [PRICE]},
    # Add all models here
}


class [PROVIDER_NAME]Provider(BaseLLMProvider):
    """[PROVIDER_NAME] provider implementation."""

    def __init__(self, api_key: str, model: Optional[str] = None):
        """Initialize [PROVIDER_NAME] provider.

        Args:
            api_key: [PROVIDER_NAME] API key
            model: Model to use (default: [DEFAULT_MODEL])
        """
        super().__init__(api_key, model or "[DEFAULT_MODEL]")
        self.client = [CLIENT_CLASS](api_key=self.api_key)

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs,
    ) -> LLMResponse:
        """Generate completion using [PROVIDER_NAME].

        Args:
            prompt: User prompt
            system_prompt: System instruction
            temperature: Sampling temperature
            max_tokens: Maximum output tokens
            **kwargs: Additional [PROVIDER_NAME] parameters

        Returns:
            LLMResponse with generated content
        """
        # [IMPLEMENTATION NOTES - CUSTOMIZE BASED ON API STRUCTURE]

        # Build messages/parameters
        # Call API
        # Extract response
        # Calculate cost
        # Return LLMResponse

        pass  # Replace with actual implementation

    def calculate_cost(
        self, input_tokens: int, output_tokens: int, model: str
    ) -> float:
        """Calculate cost for [PROVIDER_NAME] usage.

        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            model: Model name

        Returns:
            Cost in USD
        """
        pricing = [PROVIDER_NAME_UPPER]_PRICING.get(
            model, [PROVIDER_NAME_UPPER]_PRICING["[DEFAULT_MODEL]"]
        )

        input_cost = (input_tokens / 1_000_000) * pricing["input"]
        output_cost = (output_tokens / 1_000_000) * pricing["output"]

        return round(input_cost + output_cost, 6)

    @property
    def provider_name(self) -> str:
        """Get provider name."""
        return "[PROVIDER_NAME_LOWER]"
```

**NOTE**: This is a skeleton. Agent should fill in the generate() method based on [TEMPLATE_PROVIDER] pattern and [PROVIDER_NAME] API docs.

#### B. Update Factory

Modify `[PATH_TO_FACTORY]`:

**Find this code block:**
```python
elif provider.lower() == "[PROVIDER_NAME_LOWER]":
    # TODO: Implement [PROVIDER_NAME] provider
    raise NotImplementedError("[PROVIDER_NAME] provider not yet implemented")
```

**Replace with:**
```python
elif provider.lower() == "[PROVIDER_NAME_LOWER]":
    from [IMPORT_PATH] import [PROVIDER_NAME]Provider
    key = api_key or settings.[PROVIDER_NAME_UPPER]_API_KEY
    if not key:
        raise ValueError("[PROVIDER_NAME] API key not configured")
    return [PROVIDER_NAME]Provider(api_key=key, model=model)
```

#### C. Update Requirements

**Add to `api/requirements.txt`**:
```
[SDK_NAME]==[VERSION]  # [PROVIDER_NAME] SDK
```

#### D. Update Environment Examples

**Add to `api/.env.example`:**
```bash
# [PROVIDER_NAME] API
[PROVIDER_NAME_UPPER]_API_KEY=[API_KEY_PREFIX]...  # From [API_KEY_URL]
```

**Add to `worker/.env.example`:**
```bash
# [PROVIDER_NAME] API
[PROVIDER_NAME_UPPER]_API_KEY=[API_KEY_PREFIX]...  # From [API_KEY_URL]
```

### 4. VALIDATION PHASE

- [ ] All abstract methods implemented
- [ ] Factory integration complete
- [ ] NotImplementedError removed
- [ ] Syntax check passed
- [ ] Imports correct
- [ ] Logging integrated
- [ ] Pricing accurate (as of [DATE])
- [ ] All [PROVIDER_NAME]-specific requirements handled

## Deliverables

Return a comprehensive report with:

### 1. Discovery Summary
- Interface analysis
- Template analysis
- [PROVIDER_NAME] SDK version

### 2. Implementation Summary
- Files created
- Files modified
- Lines of code added

### 3. Supported Models
List all [PROVIDER_NAME] models with pricing

### 4. Usage Example
Show how to use the new provider

### 5. Key Differences from [TEMPLATE_PROVIDER]
Document API differences

## Success Criteria

- ✅ [PROVIDER_NAME]Provider class created and implements BaseLLMProvider
- ✅ Factory successfully creates [PROVIDER_NAME] instances
- ✅ NotImplementedError removed from factory
- ✅ All methods match interface signature exactly
- ✅ Async generate() returns LLMResponse correctly
- ✅ Cost calculation accurate per current pricing
- ✅ Logger integrated throughout
- ✅ Environment variables documented
- ✅ No syntax errors

---

**Execute this task autonomously and return the comprehensive report described above.**

---

## Fill-In Guide

Replace these placeholders before sending:

- `[PROVIDER_NAME]`: e.g., "Cohere", "Mistral", "TogetherAI"
- `[PROJECT_NAME]`: Your project name
- `[TEMPLATE_PROVIDER]`: e.g., "OpenAI", "Anthropic" (which to copy)
- `[EXISTING_PROVIDER_1/2]`: e.g., "Gemini", "OpenAI"
- `[SDK_NAME]`: e.g., "cohere", "mistralai"
- `[VERSION]`: SDK version number
- `[PATH_TO_*]`: Actual file paths in your project
- `[API_SPECIFIC_NOTE_*]`: Important API quirks
- `[SDK_IMPORT]`: e.g., "cohere", "mistralai"
- `[CLIENT_CLASS]`: e.g., "AsyncCohere", "MistralClient"
- `[MODEL_1/2]`: Model names
- `[PRICE]`: Pricing per 1M tokens
- `[DEFAULT_MODEL]`: Default model name
- `[DATE]`: Current date
- `[PRICING_URL]`: Provider's pricing page
- `[API_KEY_PREFIX]`: e.g., "sk-", "co-"
- `[API_KEY_URL]`: Where to get API key
- `[PROVIDER_NAME_UPPER]`: e.g., "COHERE", "MISTRAL"
- `[PROVIDER_NAME_LOWER]`: e.g., "cohere", "mistral"
- `[IMPORT_PATH]`: e.g., "app.services.llm.cohere"
