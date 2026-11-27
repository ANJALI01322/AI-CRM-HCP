from app.agents.crm_agent import get_llm

def interaction_insights(history: str):

    prompt = f"""
Analyze the following interaction history.

{history}

Generate:

Overall Relationship

Product Interest

Objections

Risk

Best Next Action

Summary

Return JSON.
"""

    response = get_llm().invoke(prompt)

    return response.content