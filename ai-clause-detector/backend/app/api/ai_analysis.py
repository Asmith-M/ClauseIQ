# ai_analysis.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils import openrouter_chat

router = APIRouter()

class ClauseRequest(BaseModel):
    clause: str

from app.utils import split_text_into_chunks, synthesize_analysis_results
import logging
import json
import re

@router.post("/analyze-clause/")
async def analyze_clause(req: ClauseRequest):
    print(f"Received clause for analysis: {req.clause[:100]}...")  # Logging received clause
    max_chars = 2000  # Set the chunking threshold
    
    async def process_prompt_with_json(prompt_text):
        """Helper function to process prompt and extract JSON response"""
        try:
            result = await openrouter_chat(prompt_text)
            logging.info(f"AI raw result: {result}")
            # Try to extract the JSON from the model's response
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            logging.info(f"AI model content: {content}")
            # Improved regex to match JSON object more robustly
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if not match:
                logging.error(f"No JSON found in model response: {content}")
                raise HTTPException(status_code=500, detail=f"No JSON found in model response: {content}")
            try:
                json_str = match.group(0)
                # Remove trailing commas or invalid JSON characters
                json_str = json_str.strip().rstrip(",")
                data = json.loads(json_str)
                return data
            except Exception as je:
                logging.error(f"JSON parsing error: {je}, content: {json_str}")
                raise HTTPException(status_code=500, detail=f"JSON parsing error: {je}, content: {json_str}")
        except HTTPException as he:
            raise he
        except Exception as e:
            logging.error(f"AI analysis failed: {e}")
            raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    if len(req.clause) > max_chars:
        # Split the clause into smaller chunks
        chunks = await split_text_into_chunks(req.clause, max_chars)
        results = []
        for chunk in chunks:
            prompt = f'''
You are a legal clause reviewer. Analyze this clause and return:
1. The category (from: NDA, Termination, Confidentiality, Liability, Jurisdiction, Payment Terms, Intellectual Property, Employment Terms, Miscellaneous)
2. Risk Level (Low, Medium, High) with a short reason
3. A simple explanation in plain English

Clause:
"{chunk}"

Respond ONLY in this JSON format:
{{
  "category": "...",
  "risk": "...",
  "reason": "...",
  "explanation": "..."
}}
'''
            result = await process_prompt_with_json(prompt)
            results.append(result)
        # Synthesize the results from all chunks
        final_result = synthesize_analysis_results(results)
        return final_result
    else:
        # Proceed with normal analysis for short clauses
        prompt = f'''
You are a legal clause reviewer. Analyze this clause and return:
1. The category (from: NDA, Termination, Confidentiality, Liability, Jurisdiction, Payment Terms, Intellectual Property, Employment Terms, Miscellaneous)
2. Risk Level (Low, Medium, High) with a short reason
3. A simple explanation in plain English

Clause:
"{req.clause}"

Respond ONLY in this JSON format:
{{
  "category": "...",
  "risk": "...",
  "reason": "...",
  "explanation": "..."
}}
'''
        result = await process_prompt_with_json(prompt)
        return result
