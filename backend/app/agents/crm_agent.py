import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv(override=True)

model_name = os.getenv("MODEL_NAME") or "qwen/qwen3.8-27b"
if model_name in ["llama-3.3-70b-versatile", "gemma2-9b-it", "llama-3.1-8b-instant"]:
    model_name = "qwen/qwen3.8-27b"

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model=model_name,
    temperature=0.2,
)