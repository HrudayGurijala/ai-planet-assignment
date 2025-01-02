from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import pymupdf
import psycopg2
from datetime import datetime
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv



load_dotenv()

app = FastAPI()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
DATABASE_URL = os.getenv('DATABASE_URL')
port = int(os.environ.get("PORT", 8000))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Store the current document text in memory
current_document_text = None

class QuestionRequest(BaseModel):
    question: str

def extract_text_from_pdf(file_path: str) -> str:
    try:
        # Open the PDF file using pymupdf
        with pymupdf.open(file_path) as doc:
            # Extract text from all pages
            text = "\n".join([page.get_text() for page in doc])
        return text
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")


def connect_to_db():
    """Connect to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        raise Exception(f"Error connecting to the database: {str(e)}")


@app.on_event("startup")
async def startup():
    """Create table if it doesn't exist."""
    try:
        conn = connect_to_db()
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS uploaded_files (
            id SERIAL PRIMARY KEY,
            filename TEXT NOT NULL,
            uploaded_date DATE NOT NULL
        );
        """)
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error during startup: {str(e)}")
        
def get_answer(question: str, context: str) -> str:
    # Initialize ChatOpenAI
    llm = ChatOpenAI(temperature=0)
    
    # Create prompt template
    prompt_template = """Using the following document content, answer the question. 
    If you cannot find the answer in the document, say "I cannot find the answer in the document."
    
    Document content:
    {context}
    
    Question: {question}
    Answer: """
    
    PROMPT = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"]
    )
    
    # Generate the prompt
    formatted_prompt = PROMPT.format(context=context, question=question)
    
    # Get response from ChatGPT using invoke
    response = llm.invoke(formatted_prompt)
    res = response.content
    
    return res


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global current_document_text

    # Ensure the file is a PDF
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    try:
        # Save the file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Extract text from PDF (in memory only, not stored in DB)
        current_document_text = extract_text_from_pdf(file_path)
        print(f"Extracted text: {current_document_text[:100]}")  # Print the first 100 characters for debugging

        # Store metadata in the database
        conn = connect_to_db()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO uploaded_files (filename, uploaded_date)
            VALUES (%s, %s)
            """,
            (file.filename, datetime.now().date()),
        )
        conn.commit()
        cursor.close()
        conn.close()

        # Clean up the file after extracting text
        os.remove(file_path)

        return {"message": f"File '{file.filename}' processed and metadata stored successfully!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")



@app.websocket("/ask")
async def websocket_endpoint(websocket: WebSocket):
    global current_document_text

    await websocket.accept()
    print("WebSocket connected and waiting for questions.")

    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received message: {data}")

            if not current_document_text:
                print("No document text found, asking user to upload a PDF file.")
                await websocket.send_text("Error: Please upload a PDF file first.")
                continue

            try:
                print("Processing the question...")
                answer = get_answer(data, current_document_text)
                print(f"Answer generated: {answer}")
                await websocket.send_text(answer)
            except Exception as e:
                await websocket.send_text(f"Error processing question: {str(e)}")
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"Unexpected error in WebSocket handling: {str(e)}")



# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

