from app.agents.crm_agent import llm


def edit_interaction(old_notes: str, changes: str):

    prompt = f"""
You are an AI CRM assistant.

Existing Interaction:

{old_notes}

User wants these edits:

{changes}

Return the updated interaction in structured JSON.

Include:
Doctor Name
Hospital
Products Discussed
Summary
Sentiment
Follow-up Action
"""

    response = llm.invoke(prompt)

    return response.content