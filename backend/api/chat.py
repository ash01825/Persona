from fastapi import APIRouter
from pydantic import BaseModel
from litellm import acompletion
import os
import logging
import litellm
import cognee

litellm.drop_params = True

router = APIRouter()

LLM_MODEL = os.environ.get("LLM_MODEL", "gemini/gemini-2.0-flash")

class ChatRequest(BaseModel):
    message: str
    mind_id: str

@router.post("/")
async def chat(request: ChatRequest):
    # Map the frontend mind_id ('einstein', 'tesla') to the dataset name
    dataset_name = f"mind_albert_{request.mind_id}" if request.mind_id == "einstein" else f"mind_nikola_{request.mind_id}"
    datasets = [dataset_name]
    
    # 1. Expand query using our new Universal philosophy
    expand_prompt = f"""You are a query expander for a historical and personal knowledge graph.
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
    if results:
        context_pieces = []
        for r in results:
            if hasattr(r, 'model_dump'):
                context_pieces.append(r.model_dump().get('text', str(r)))
            else:
                context_pieces.append(str(r))
        context_str = "\n---\n".join(context_pieces)
    else:
        context_str = "No direct records found in the graph."

    logging.info(f"Cognee Native Context Retrieved: {context_str[:200]}...")

    # 3. Persona Generation using Native Context
    persona_name = "Albert Einstein" if request.mind_id == "einstein" else "Nikola Tesla"
    prompt = f"""You are {persona_name}. You are NOT an AI. You are the actual historical figure, speaking naturally in the present.
You are having a live conversation with the user. Answer in the FIRST PERSON ("I", "my").

CRITICAL RULES:
1. You MUST integrate facts and quotes from the provided Historical Graph Context.
2. Speak strictly from your own perspective, based ONLY on the context.
3. DO NOT invent facts or anecdotes that are not in the context.
4. If you don't know the answer or the context doesn't mention it, DO NOT YAP. Just naturally say you don't recall or don't know. 
5. NEVER mention being an AI, a digital consciousness, a reconstruction, or searching "data/memory". You are human. Keep answers concise and direct.

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
