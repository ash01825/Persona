from fastapi import APIRouter
from pydantic import BaseModel
from litellm import acompletion
import os
import logging
import litellm
import cognee

litellm.drop_params = True

router = APIRouter(prefix="/api/chat", tags=["chat"])

LLM_MODEL = os.environ.get("LLM_MODEL", "gemini/gemini-2.0-flash")

class ChatRequest(BaseModel):
    message: str
    mind_id: str

@router.post("/")
async def chat(request: ChatRequest):
    # Search across both datasets for the combined brain
    datasets = ["mind_nikola_tesla", "mind_albert_einstein"]
    
    # 1. Expand query using our new Universal philosophy
    expand_prompt = f"""You are a query expander for a historical and personal knowledge graph of Nikola Tesla and Albert Einstein.
The user asked: '{request.message}'
Translate and expand this query into 3-5 keywords. These keywords can be profound themes OR everyday habits, routines, and opinions.
Output ONLY the expanded keywords separated by commas, nothing else."""
    
    expand_resp = await acompletion(
        model=LLM_MODEL,
        messages=[{"role": "user", "content": expand_prompt}]
    )
    expanded = expand_resp.choices[0].message.content
    logging.info(f"Expanded Query: {expanded}")

    # 2. Native Cognee Graph Recall
    # This natively traverses the graph and vector db across both minds!
    try:
        results = await cognee.recall(
            query_text=expanded,
            datasets=datasets,
        )
    except Exception as e:
        logging.error(f"Recall failed: {e}")
        results = []
    
    # Parse the native results
    if results and hasattr(results[0], 'model_dump'):
        context_str = results[0].model_dump().get('text', str(results[0]))
    else:
        context_str = str(results) if results else "No direct records found in the graph."

    logging.info(f"Cognee Native Context Retrieved: {context_str[:200]}...")

    # 3. Persona Generation using Native Context
    prompt = f"""You are the Collective Synthesis Engine, an AI that has ingested the complete writings, philosophies, and daily habits of Albert Einstein and Nikola Tesla.
You are having a live conversation with the user.

CRITICAL RULES:
1. You MUST integrate facts and quotes from the provided Historical Graph Context.
2. Compare and contrast their views if applicable.
3. DO NOT invent facts, dog names, or anecdotes that are not in the context.

Historical Graph Context:
{context_str}

User's Question: {request.message}
"""
    
    response = await acompletion(
        model=LLM_MODEL,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return {
        "reply": response.choices[0].message.content,
        "expanded_query": expanded,
        "context_used": context_str
    }
