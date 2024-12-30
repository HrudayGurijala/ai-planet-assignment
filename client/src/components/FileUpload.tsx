import React , { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";


const FileUpload:React.FC=()=> {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [responseMessage, setResponseMessage] = useState<string>("");

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setSelectedFile(file);
        } else {
            alert("Please upload a valid PDF file.");
            setSelectedFile(null);
        }
    };

    const handleFileUpload = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        if (!selectedFile) {
            alert("No file selected or invalid file type.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await axios.post<{ message: string }>(
                "http://127.0.0.1:8000/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setResponseMessage(response.data.message);
        } catch (error) {
            console.error("Error uploading file:", error);
            setResponseMessage("Failed to upload the file.");
        }
    };

  return (
    <div >
            <h1>Upload a PDF File</h1>
            <form onSubmit={handleFileUpload}>
                <input type="file" accept=".pdf" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
            {responseMessage && <p>{responseMessage}</p>}
    </div>
  )
}

export default FileUpload