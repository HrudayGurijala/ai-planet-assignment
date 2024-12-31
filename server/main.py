from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import pymupdf
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to save uploaded files
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
        
        # Extract text from PDF
        current_document_text = extract_text_from_pdf(file_path)
        
        # Clean up the file after extracting text
        os.remove(file_path)
        
        return {"message": f"File '{file.filename}' processed successfully!"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
