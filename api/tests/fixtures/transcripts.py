"""Transcript fixtures for testing."""


SAMPLE_MEETING_TRANSCRIPT = """
[00:00] Alice: Good morning everyone, let's start today's stand-up.
[00:05] Bob: Morning! I finished the authentication module yesterday.
[00:10] Alice: Great work, Bob. Any blockers?
[00:15] Bob: No blockers. I'll be working on the API tests today.
[00:20] Carol: I'm still working on the UI components. Should be done by EOD.
[00:25] Alice: Perfect. Let's sync again tomorrow. Meeting adjourned.
"""


SAMPLE_PRESENTATION_TRANSCRIPT = """
[00:00] Speaker: Thank you for joining today's product launch presentation.
[00:10] Speaker: Our new product, ScriptRipper, analyzes transcripts using AI.
[00:20] Speaker: Key features include batch processing and custom prompts.
[00:30] Speaker: We've seen 90% accuracy in our beta tests.
[00:40] Speaker: Pricing starts at $9.99 per month for the Pro tier.
[00:50] Speaker: Thank you. Questions?
[01:00] Audience: How does it handle multiple speakers?
[01:10] Speaker: Great question. It uses speaker diarization to identify speakers.
"""


LONG_TRANSCRIPT = """
[00:00] Project Manager: Welcome to our quarterly planning meeting.
[00:10] PM: Today we'll discuss our roadmap for Q4 2024.
[00:20] Tech Lead: We have three major initiatives planned.
[00:30] TL: First, improving our API performance by 50%.
[00:40] TL: Second, launching the mobile app.
[00:50] TL: Third, implementing real-time collaboration features.
[01:00] PM: Excellent. What's the timeline for each?
[01:10] TL: API improvements - 4 weeks. Mobile app - 8 weeks. Real-time features - 12 weeks.
[01:20] Marketing Lead: We need to align our marketing campaigns with these launches.
[01:30] ML: I propose a soft launch for the mobile app in week 6.
[01:40] ML: Then a full marketing push in week 8.
[01:50] PM: Sounds good. Any concerns from the team?
[02:00] Developer: The real-time features might need more time.
[02:10] Developer: We're dealing with some WebSocket scaling issues.
[02:20] TL: Good point. Let's add a 2-week buffer.
[02:30] PM: Agreed. Let's make it 14 weeks for real-time features.
[02:40] PM: Any other concerns?
[02:50] Designer: I'd like to review the mobile app designs with everyone.
[03:00] PM: Great idea. Let's schedule a design review next week.
[03:10] PM: Anything else? No? Okay, meeting adjourned. Thanks everyone!
"""
