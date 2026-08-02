import logging
from fastapi import APIRouter, File, UploadFile, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from backend.services.resume_extractor import parse_and_clean_document
from backend.services.rate_limiter import enforce_rate_limit, RATE_LIMIT_RESUME_RPM

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/resume", tags=["resume"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt", ".md"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB Strict Limit

def validate_magic_bytes(content: bytes, ext: str) -> bool:
    """
    Validates file magic bytes against the declared file extension.
    Scans initial 1024 bytes to tolerate leading comments/BOMs in valid files.
    """
    if not content:
        return False

    header_sample = content[:1024]

    if ext == ".pdf":
        return b"%PDF-" in header_sample
    elif ext in (".docx", ".doc"):
        # DOCX is an OpenXML ZIP container (PK\x03\x04). Legacy DOC starts with \xD0\xCF\x11\xE0
        return header_sample.startswith(b"PK\x03\x04") or header_sample.startswith(b"\xd0\xcf\x11\xe0")
    elif ext in (".txt", ".md"):
        # Text/MD files must not contain binary null bytes
        return b"\x00" not in header_sample
    
    return False

@router.post("/extract", dependencies=[Depends(enforce_rate_limit(max_requests=RATE_LIMIT_RESUME_RPM))])
async def extract_resume(file: UploadFile = File(...)):
    """
    Hardened resume extraction endpoint with stream size enforcement and magic bytes validation.
    Extracts plain text from PDF, DOCX, TXT, MD documents without reading oversized payloads into memory.
    """
    if not file or not file.filename:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "message": "No file uploaded."}
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

    # 1. Pre-check Content-Length header if provided by client/proxy
    content_length_header = file.headers.get("content-length")
    if content_length_header and content_length_header.isdigit():
        if int(content_length_header) > MAX_FILE_SIZE_BYTES:
            logger.warning(f"Rejected oversized upload by Content-Length ({content_length_header} bytes): {filename}")
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={
                    "success": False,
                    "message": "File size exceeds the maximum allowed limit of 5MB."
                }
            )

    # 2. Chunked stream reading — stop reading immediately if stream exceeds 5MB
    chunks = []
    total_bytes = 0
    chunk_size = 64 * 1024  # 64 KB

    try:
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            total_bytes += len(chunk)
            if total_bytes > MAX_FILE_SIZE_BYTES:
                logger.warning(f"Aborted oversized upload stream (> 5MB): {filename}")
                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={
                        "success": False,
                        "message": "File size exceeds the maximum allowed limit of 5MB."
                    }
                )
            chunks.append(chunk)

        content = b"".join(chunks)

        if not content:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"success": False, "message": "Uploaded file is empty (0 bytes)."}
            )

        # 3. Magic Bytes Validation
        if not validate_magic_bytes(content, ext):
            logger.warning(f"File magic bytes mismatch for '{filename}' (extension '{ext}').")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "message": f"Invalid file content signature. File headers do not match extension '{ext}'."
                }
            )

        # 4. Delegate to parsing logic
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
            content={"success": False, "message": "Server error while processing resume document."}
        )
