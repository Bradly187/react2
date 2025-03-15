import { useEffect, useState } from 'react';
import axios from 'axios';

const DataDisplay = () => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/data')
            .then(response => setFiles(response.data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
<div className="data-display">
  <h2>Uploaded Files</h2>
  <ul>
    {files.map((file, index) => (
      <li key={index}>
        <a href={`http://localhost:5000${file.filePath}`} target="_blank" rel="noopener noreferrer">
          {file.filePath.split('/').pop()}
        </a>
      </li>
    ))}
  </ul>
</div>
    );
};

export default DataDisplay;
