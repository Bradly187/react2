import { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        // Show a preview (for images)
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => setPreview(event.target.result);
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Upload successful!');
            console.log(response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="file" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Preview" style={{ width: '100px', marginTop: '10px' }} />}
            <button type="submit">Upload</button>
        </form>
    );
};

export default UploadForm;
