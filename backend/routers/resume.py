import logging
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse
from backend.services.resume_extractor import parse_and_clean_document

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/resume", tags=["resume"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt", ".md"}

@router.post("/extract")
async def extract_resume(file: UploadFile = File(...)):
    """
    Extracts and cleans plain text from an uploaded resume document (PDF, DOCX, TXT, MD).
    Returns JSON containing the clean text payload without binary artifacts.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "No file uploaded."}
        )

    filename = file.filename
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""

    if ext not in ALLOWED_EXTENSIONS:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "message": f"Unsupported file type '{ext}'. Supported formats: PDF, DOCX, TXT, MD."
            }
        )

    try:
        content = await file.read()
        cleaned_text = parse_and_clean_document(content, filename)

        return {
            "success": True,
            "filename": filename,
            "text": cleaned_text,
            "char_count": len(cleaned_text)
        }
    except ValueError as ve:
        logger.warning(f"Resume extraction validation error for {filename}: {str(ve)}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "message": str(ve)}
        )
    except Exception as e:
        logger.error(f"Unexpected error parsing resume {filename}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "message": f"Server error while processing resume: {str(e)}"}
        )
