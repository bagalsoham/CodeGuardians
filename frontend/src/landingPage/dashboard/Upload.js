import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { uploadPDF, getFiles, deleteFile } from "../../services/api.js";

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    if (files[0].size > 10 * 1024 * 1024) {
      showNotification("File is too large. Max size is 10MB.", "error");
      return;
    }
    setSelectedFile(files[0]);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showNotification('Please select a file', 'error');
      return;
    }

    setIsUploading(true);
    
    try {
      const data = await uploadPDF(selectedFile);
      
      if (data) {
        setSelectedFile(null);
        showNotification('File uploaded successfully!');
        fetchFiles();
        
        // Navigate to results page with the uploaded filename
        navigate('/results', { 
          state: { 
            filename: data.filename 
          } 
        });
      } else {
        showNotification('Upload failed', 'error');
      }
    } catch (error) {
      showNotification(error.message || 'Error uploading file', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const data = await getFiles();
      setPdfFiles(data);
    } catch (error) {
      setPdfFiles([]);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      const data = await deleteFile(fileId);
      if (data.success) {
        showNotification("File deleted successfully!");
        fetchFiles(); // Refresh the list after deletion
      } else {
        showNotification("Failed to delete file", "error");
      }
    } catch (error) {
      showNotification("Error deleting file", "error");
    }
  };

  const handleViewResults = (file) => {
    navigate('/results', { 
      state: { 
        filename: file.filename 
      } 
    });
  };

  return (
    <div className="container mt-5 mb-5">
      <div
        className="border border-2 border-secondary rounded p-4 text-center"
        style={{ cursor: 'pointer', minHeight: '200px' }}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInput} 
          className="d-none" 
          accept="application/pdf" 
        />
        <h5>Click to Upload PDF</h5>
        {selectedFile && <p>{selectedFile.name}</p>}
        <Button 
          variant="primary" 
          className="mt-2" 
          onClick={(e) => {
            e.stopPropagation();
            handleUpload();
          }} 
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>

      <div className="mt-4">
        <h5 className="mb-3">Uploaded PDFs</h5>
        <Table hover bordered className="shadow-sm">
          <thead className="bg-light">
            <tr>
              <th className="text-center" style={{ width: '50px' }}>
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...Array(pdfFiles.length).keys()]);
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  checked={selectedItems.length === pdfFiles.length && pdfFiles.length > 0}
                />
              </th>
              <th>File Name</th>
              <th>Status</th>
              <th>Date Modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pdfFiles.length > 0 ? (
              pdfFiles.map((file, index) => (
                <tr 
                  key={file._id}
                  className={selectedItems.includes(index) ? 'table-primary' : ''}
                >
                  <td className="text-center">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      checked={selectedItems.includes(index)}
                      onChange={() => {
                        if (selectedItems.includes(index)) {
                          setSelectedItems(selectedItems.filter(i => i !== index));
                        } else {
                          setSelectedItems([...selectedItems, index]);
                        }
                      }}
                    />
                  </td>
                  <td>
                    <a 
                      href={`http://localhost:5000${file.filePath}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      {file.filename}
                    </a>
                  </td>
                  <td>
                    <span className="badge bg-success">Uploaded</span>
                  </td>
                  <td>{new Date(file.uploadDate).toLocaleDateString()}</td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleViewResults(file)}
                    >
                      Analyze
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="me-2"
                      href={`http://localhost:5000${file.filePath}`}
                      target="_blank"
                    >
                      View PDF
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(file._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No files uploaded yet</td>
              </tr>
            )}
          </tbody>
        </Table>

        <div className="d-flex gap-2 mt-3">
          <Button 
            variant="primary" 
            disabled={selectedItems.length === 0}
            onClick={() => {
              const selectedFile = pdfFiles[selectedItems[0]];
              if (selectedFile) {
                handleViewResults(selectedFile);
              }
            }}
          >
            Analyze Selected
          </Button>
          <Button 
            variant="danger" 
            disabled={selectedItems.length === 0}
            onClick={async () => {
              if (!window.confirm(`Delete ${selectedItems.length} selected file(s)?`)) return;
              
              for (const index of selectedItems) {
                await deleteFile(pdfFiles[index]._id);
              }
              setSelectedItems([]);
              fetchFiles();
              showNotification("Selected files deleted successfully!");
            }}
          >
            Delete Selected
          </Button>
        </div>
      </div>

      {notification.show && (
        <div className={`alert alert-${notification.type === 'error' ? 'danger' : 'success'} position-fixed top-0 end-0 m-3`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default Upload;