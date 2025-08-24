# utils.py
# Utility for calling OpenRouter's chat API from FastAPI
import os
import httpx
from fastapi import HTTPException
from dotenv import load_dotenv
import json
from json.decoder import JSONDecodeError
import spacy
from typing import List

load_dotenv()

import logging

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "mistralai/mistral-small-3.2-24b-instruct"

async def openrouter_chat(user_message: str):
    if not OPENROUTER_API_KEY:
        logging.error("OpenRouter API key not set.")
        raise HTTPException(status_code=500, detail="OpenRouter API key not set.")
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "user", "content": user_message}
        ],
        "temperature": 0
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(OPENROUTER_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            try:
                return response.json()
            except json.JSONDecodeError as json_err:
                logging.error(f"JSON decode error: {json_err}")
                logging.error(f"Raw response status: {response.status_code}")
                logging.error(f"Raw response headers: {response.headers}")
                logging.error(f"Raw response body: {response.text}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to parse JSON response from OpenRouter: {json_err}. Raw response: {response.text}"
                )
        except httpx.HTTPStatusError as http_err:
            logging.error(f"HTTP error during OpenRouter API call: {http_err}")
            if http_err.response is not None:
                logging.error(f"Response status: {http_err.response.status_code}")
                logging.error(f"Response headers: {http_err.response.headers}")
                logging.error(f"Response body: {http_err.response.text}")
                raise HTTPException(
                    status_code=http_err.response.status_code,
                    detail=f"OpenRouter API returned error: {http_err.response.text}"
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"OpenRouter API HTTP error without response: {str(http_err)}"
                )
        except Exception as e:
            logging.error(f"Unexpected exception during OpenRouter API call: {e}")
            raise HTTPException(status_code=500, detail=f"OpenRouter API call failed: {str(e)}")


async def analyze_clause_with_openrouter(clause_text: str):
    """
    Sends a legal clause to OpenRouter (Mistral 7B Instruct) with a legal risk prompt and returns the model's JSON response.
    """
    prompt = f'''
You are a legal risk ranker.

Analyze this clause:
"{clause_text}"

Return:
- The clause’s legal category (e.g., NDA, Liability, Payment, Jurisdiction, etc.)
- The risk level (Low/Medium/High)
- A one-line reason for this risk
Return it in JSON format.
'''
    return await openrouter_chat(prompt)

async def explain_clause_plain_english(clause_text: str):
    """
    Sends a clause to OpenRouter and asks for a plain English explanation as a paragraph.
    """
    prompt = f'''
Explain this legal clause in simple, plain English so a non-lawyer can understand it:
"{clause_text}"
Return only a clear paragraph explanation.
'''
    return await openrouter_chat(prompt)

async def verify_clause_risk_with_openrouter(clause_text: str, original_risk: str, original_reason: str):
    """
    Sends the clause and the original risk/rationale to OpenRouter for verification by a second agent.
    """
    prompt = f'''
You are a verifier. Double-check the risk level and reason given for this clause:

Clause:
"{clause_text}"

Original risk: {original_risk}
Original reason: {original_reason}

Do you agree? If not, what should the correct risk level and reason be?
'''
    return await openrouter_chat(prompt)

async def split_text_into_chunks(text: str, max_chars: int = 2000) -> List[str]:
    """
    Splits the input text into chunks that do not exceed the specified character limit.
    The splitting is done at sentence boundaries using spaCy.
    """
    nlp = spacy.load("en_core_web_sm")
    doc = nlp(text)
    chunks = []
    current_chunk = []

    for sent in doc.sents:
        if len(" ".join(current_chunk)) + len(sent.text) > max_chars:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sent.text]
        else:
            current_chunk.append(sent.text)

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

def synthesize_analysis_results(results: List[dict]) -> dict:
    """
    Synthesizes the results from multiple AI analyses into a single response.
    Uses majority voting for category and risk, and concatenates explanations.
    """
    if not results:
        return {}

    explanation = "\n---\n".join(result.get("explanation", "") for result in results)
    
    categories = [result.get("category") for result in results]
    risks = [result.get("risk") for result in results]

    # Majority voting for category and risk
    final_category = max(set(categories), key=categories.count)
    final_risk = max(set(risks), key=risks.count)

    return {
        "category": final_category,
        "risk": final_risk,
        "explanation": explanation
    }
