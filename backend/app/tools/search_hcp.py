from app.agents.crm_agent import llm

def search_hcp(query: str):

    prompt = f"""
You are an AI Healthcare CRM.

Search the HCP database.

Doctor:

{query}

Generate an intelligent profile.

Include:

Doctor Name
Specialization
Hospital
City
Last Interaction
Frequently Discussed Products
Priority
"""

    response = llm.invoke(prompt)

    return response.content