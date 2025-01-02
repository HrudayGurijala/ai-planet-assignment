# ai-planet Assignment

## Brief
This fullstack application allows users to upload PDF documents and ask questions related to their content. The backend processes the documents using FastAPI and LangChain, while the React-based frontend ensures an intuitive user experience.

## Features
- **PDF Upload**: Users can upload PDF documents to the application.
- **Question Answering**: Users can ask questions based on the content of uploaded PDFs, with answers generated using OpenAI API through LangChain.
- **Follow-Up Questions**: Ability to ask follow-up or new questions on the same document.
- **Database Management**: PostgreSQL database to store metadata like filename and upload date.
- **Interactive Frontend**: Modern UI built with React and styled using Tailwind CSS with ShadCN UI components.

## Project Structure
```
client/
  ├── node_modules/         # Node.js dependencies
  ├── public/               # Public static assets like CSS and images
  │   ├── index.html        # Main HTML file
  │   └── favicon.ico       # Application favicon
  ├── src/                  # Source code for the application
  │   ├── assets/           # Static assets (e.g., images, icons)
  │   ├── components/       # Components for the UI
  │   │   ├── ui/           # UI-specific components
  │   │   │   ├── ChatQA.tsx      # Chat question and answer component
  │   │   │   └── FileUpload.tsx  # File upload component
  │   ├── lib/              # Utility libraries
  │   ├── App.tsx           # Root component
  │   ├── main.tsx          # Entry point
  │   ├── index.css         # Global styles
  │   └── vite-env.d.ts     # TypeScript environment definitions
  ├── dist/                 # Build output directory
  └── .gitignore            # Git ignore file

server/
  ├── main.py               # Entry point for the FastAPI server
  ├── models.py             # Database models
  ├── routes.py             # API endpoints
  ├── utils.py              # Helper functions
  └── requirements.txt      # Python dependencies
  └── .env                  # Environment variables for sensitive data
```

## Setup Instructions

### Backend Setup
1. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Up PostgreSQL**:
   - Install PostgreSQL.
   - Create a new database for the project.
   - Retrieve the PostgreSQL connection string (format: `postgresql://<username>:<password>@<host>:<port>/<database>`).

3. **Run the Backend Server**:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. **Install Node.js and npm**:
   Ensure you have Node.js installed (check using `node -v` and `npm -v`).

2. **Install Frontend Dependencies**:
   Navigate to the `client` folder and run:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

### Connect Frontend and Backend
- Update the API endpoint in the frontend configuration to point to the backend server (e.g., `http://localhost:8000`).

### Day 1
 Configured the client and servers
 File uploads and extract text from the uploaded pdf
### Day 2
 work on the NLP preocessing 
 Q&A 
### day 3
 database part remaining 

# day 4
 deployment

## Contact
For any queries, reach out at: **gurijalahruday@gmail.com**




