"""Prompt fixtures for testing."""


SAMPLE_PROMPTS = {
    "meetings": [
        {
            "task_name": "Summary",
            "prompt": "Provide a concise summary of the meeting transcript, highlighting the main topics discussed and key outcomes.",
        },
        {
            "task_name": "Action Items",
            "prompt": "Extract all action items from the meeting. Format as a numbered list with assignee and deadline if mentioned.",
        },
        {
            "task_name": "Decisions",
            "prompt": "List all decisions made during the meeting. Be specific about what was decided and who made the decision.",
        },
        {
            "task_name": "Next Steps",
            "prompt": "Identify the next steps and follow-up actions mentioned in the meeting.",
        },
        {
            "task_name": "Participants",
            "prompt": "List all participants in the meeting based on the speaker labels in the transcript.",
        },
    ],
    "presentations": [
        {
            "task_name": "Key Points",
            "prompt": "Extract the key points from the presentation. Format as bullet points.",
        },
        {
            "task_name": "Q&A Summary",
            "prompt": "Summarize the questions asked and answers provided during the Q&A session.",
        },
        {
            "task_name": "Main Message",
            "prompt": "What is the main message or thesis of this presentation?",
        },
    ],
}


def get_prompt_by_name(task_name: str, category: str = "meetings") -> dict:
    """Get a specific prompt by task name and category."""
    prompts = SAMPLE_PROMPTS.get(category, [])
    for prompt in prompts:
        if prompt["task_name"] == task_name:
            return prompt
    return None
