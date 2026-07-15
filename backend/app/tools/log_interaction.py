from app.agents.crm_agent import llm


def log_interaction(notes: str):

    prompt = f"""
You are an AI CRM assistant for pharmaceutical field representatives.

Convert the following interaction into structured JSON.

Interaction:

{notes}

Return JSON with:

Doctor Name
Hospital
Products Discussed
Summary
Sentiment
Follow-up Action
"""

    response = llm.invoke(prompt)

    return response.content