/**
 * File Upload Component
 * Handles drag & drop file uploads for code comparison.
 */

import { useState, useRef } from 'react';

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  selectedFile?: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onFileSelect,
  acceptedTypes = '.py,.cpp,.h,.hpp',
  selectedFile
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.name.match(/\.(py|cpp|h|hpp)$/i)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragging
              ? 'border-teal-500 bg-teal-50'
              : selectedFile
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 bg-white hover:border-teal-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="hidden"
        />
        
        {selectedFile ? (
          <div className="text-green-700">
            <svg
              className="mx-auto h-12 w-12 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-xs mt-1">Click to change file</p>
          </div>
        ) : (
          <div className="text-gray-600">
            <svg
              className="mx-auto h-12 w-12 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="font-medium">Drag & drop a file</p>
            <p className="text-sm mt-1">or click to browse</p>
            <p className="text-xs mt-2 text-gray-500">Accepts: {acceptedTypes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;


