from app.agents.crm_agent import llm

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

    response = llm.invoke(prompt)

    return response.content