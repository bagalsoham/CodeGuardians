import React, { useState } from 'react';
import '../../index.css';

function PreviousCFR() {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedItems, setSelectedItems] = useState([0]); // First row selected by default
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - you would replace this with your actual data
  const [files, setFiles] = useState([
    { id: 1, name: 'Sample File 1', status: 'Complete', collaboration: 'High', dateModified: '2025-03-20' },
    { id: 2, name: 'Sample File 2', status: 'Pending', collaboration: 'Medium', dateModified: '2025-03-19' },
    { id: 3, name: 'Sample File 3', status: 'In Progress', collaboration: 'Low', dateModified: '2025-03-18' },
    { id: 4, name: 'Sample File 4', status: 'Complete', collaboration: 'Medium', dateModified: '2025-03-17' },
    { id: 5, name: 'Sample File 5', status: 'Pending', collaboration: 'High', dateModified: '2025-03-16' },
    { id: 6, name: 'Sample File 6', status: 'In Progress', collaboration: 'Low', dateModified: '2025-03-15' },
    { id: 7, name: 'Sample File 7', status: 'Complete', collaboration: 'Medium', dateModified: '2025-03-14' },
    { id: 8, name: 'Sample File 8', status: 'Pending', collaboration: 'Low', dateModified: '2025-03-13' }
  ]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCheckboxChange = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(item => item !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  // Sort the files based on current sort field and direction
  const sortedFiles = [...files].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="previous-cfr-page">
      <header className="page-header">
        <h1 style={{color: "#37377D"}}>Previous CFR Files</h1>
        <p>Select a file to view or edit</p>
      </header>

      <div className="search-and-filters">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search files..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-button">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        
        <div className="filter-buttons">
          <button className="filter-button text-primary">All Files</button>
          <button className="filter-button">Recent</button>
          <button className="filter-button">Shared</button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="checkbox-column"></th>
              <th 
                className="sortable-column"
                onClick={() => handleSort('name')}
              >
                <div className="column-header">
                  File/Batch Name
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </th>
              <th 
                className="sortable-column"
                onClick={() => handleSort('status')}
              >
                <div className="column-header">
                  Status
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </th>
              <th 
                className="sortable-column"
                onClick={() => handleSort('collaboration')}
              >
                <div className="column-header">
                  Collaboration Suggestion
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </th>
              <th 
                className="sortable-column"
                onClick={() => handleSort('dateModified')}
              >
                <div className="column-header">
                  Date Modified
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedFiles.map((file, index) => (
              <tr 
                key={file.id} 
                className={selectedItems.includes(index) ? 'selected-row' : index % 2 === 0 ? 'even-row' : 'odd-row'}
              >
                <td className="checkbox-cell">
                  <div 
                    className="checkbox" 
                    onClick={() => handleCheckboxChange(index)}
                  >
                    {selectedItems.includes(index) && (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                </td>
                <td>
                  <div className={`file-name-placeholder ${selectedItems.includes(index) ? 'selected' : ''}`}></div>
                </td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="pagination-button" disabled>Previous</button>
        <span className="page-info">Page 1 of 1</span>
        <button className="pagination-button" disabled>Next</button>
      </div>

      <div className="action-buttons">
        <button className="action-button ">Open Selected</button>
        <button className="action-button">Delete</button>
      </div>
    </div>
  );
}

export default PreviousCFR;