from app.agents.crm_agent import get_llm

def followup(notes: str):

    prompt = f"""
You are an experienced pharmaceutical sales manager.

Interaction:

{notes}

Recommend:

Next Follow-up Date

Priority

Suggested Talking Points

Risk Level

Probability of Conversion

Return JSON.
"""

    response = get_llm().invoke(prompt)

    return response.content