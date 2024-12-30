from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import pymupdf

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to save uploaded files
UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Ensure the file is a PDF
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    # Save the file to the server
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
        
    # Parse the PDF text
    text = parsePdf(file_path)
    print(text)

    return {"message": f"File '{file.filename}' uploaded successfully!"}

def parsePdf(file_path: str):
    # Open the PDF file using pymupdf
    with pymupdf.open(file_path) as doc:
        text = "\n".join([page.get_text() for page in doc])  # Concatenate text from all pages with newlines
    return text

