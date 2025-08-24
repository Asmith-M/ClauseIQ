from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from app.utils import analyze_clause_with_openrouter, explain_clause_plain_english, verify_clause_risk_with_openrouter
import fitz  # PyMuPDF
import tempfile
import re

router = APIRouter()

# Filtering and grouping logic (same as improved clause_extraction)
def extract_meaningful_clauses(text: str):
    lines = [line.strip() for line in text.splitlines()]
    filtered = []
    seen = set()
    ignore_patterns = [
        re.compile(r"^Page \d+$", re.IGNORECASE),
        re.compile(r"^Signed by:.*", re.IGNORECASE),
        re.compile(r"^Date:.*", re.IGNORECASE),
    ]
    for line in lines:
        if len(line) < 10:
            continue
        if line.isupper():
            continue
        if any(pat.match(line) for pat in ignore_patterns):
            continue
        if line in seen:
            continue
        seen.add(line)
        filtered.append(line)
    # Group lines into paragraphs/clauses by newlines (empty lines)
    clauses = []
    current = []
    for line in filtered:
        if line == "":
            if current:
                clause = " ".join(current).strip()
                if clause:
                    clauses.append(clause)
                current = []
        else:
            current.append(line)
    if current:
        clause = " ".join(current).strip()
        if clause:
            clauses.append(clause)
    if not clauses:
        clauses = filtered
    return clauses

@router.post("/full-analyze/")
async def full_analyze(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        doc = fitz.open(tmp_path)
        text = "\n".join(page.get_text() for page in doc)
        doc.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")
    clauses = extract_meaningful_clauses(text)
    results = []
    for clause in clauses:
        try:
            print(f"Analyzing clause: {clause}")  # Logging clause being analyzed
            # Ranker
            ranker_result = await analyze_clause_with_openrouter(clause)
            # Parse JSON from LLM
            import json, re as regex
            content = ranker_result.get("choices", [{}])[0].get("message", {}).get("content", "")
            print(f"AI raw result: {content}")  # Logging raw AI response
            match = regex.search(r'\{[\s\S]*\}', content)
            if match:
                ranker_json = json.loads(match.group(0))
            else:
                ranker_json = {"error": "No JSON found in model response.", "raw": content}
            # Explainer
            explainer_result = await explain_clause_plain_english(clause)
            explainer_content = explainer_result.get("choices", [{}])[0].get("message", {}).get("content", "")
            # Verifier
            risk = ranker_json.get("risk", "")
            reason = ranker_json.get("reason", "")
            verifier_result = await verify_clause_risk_with_openrouter(clause, risk, reason)
            verifier_content = verifier_result.get("choices", [{}])[0].get("message", {}).get("content", "")
            results.append({
                "clause": clause,
                "ranker": ranker_json,
                "explainer": explainer_content,
                "verifier": verifier_content
            })
        except Exception as e:
            results.append({
                "clause": clause,
                "error": str(e)
            })
    return JSONResponse(content={"results": results})
