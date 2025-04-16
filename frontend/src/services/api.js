// Base URL of the Flask application
const BASE_URL = "http://localhost:5000";

/**
 * Upload a PDF file to the server
 * @param {File} file - The PDF file to upload
 * @returns {Promise<Object>} - Response from the server
 */
export const uploadPDF = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

/**
 * Analyze the uploaded document
 * @returns {Promise<Object>} - Document analysis resultsx  x
 */
export const analyzeDocument = async () => {
  try {
    const response = await fetch(`${BASE_URL}/analyze_document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Analysis failed');
    }

    return response.json();
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw error;
  }
};

/**
 * Reset the system (clear all uploaded documents)
 * @returns {Promise<boolean>} - Success status
 */
export const resetSystem = async () => {
  try {
    const response = await fetch(`${BASE_URL}/reset`, {
      method: 'POST',
    });

    return response.ok;
  } catch (error) {
    console.error('Error resetting system:', error);
    throw error;
  }
};

/**
 * Get list of uploaded files
 * @returns {Promise<Array>} - List of files
 */
export const getFiles = async () => {
  try {
    const response = await fetch(`${BASE_URL}/files`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
};

/**
 * Delete a file by ID
 * @param {string} fileId - ID of the file to delete
 * @returns {Promise<Object>} - Response from the server
 */
export const deleteFile = async (fileId) => {
  try {
    const response = await fetch(`${BASE_URL}/delete/${fileId}`, {
      method: 'DELETE',
    });
    
    return response.json();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};