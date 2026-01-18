import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Lock, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function FileUploadModal({ isOpen, onClose, onSuccess, patientAddress }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [category, setCategory] = useState('reports');
    const [uploading, setUploading] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                setSelectedFile(acceptedFiles[0]);
            }
        },
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        },
        maxSize: 50 * 1024 * 1024, // 50MB
        multiple: false
    });

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file');
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('category', category);

            const response = await axios.post(`${API_URL}/file/upload`, formData, {
                headers: {
                    'X-Wallet-Address': patientAddress,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('File uploaded successfully!');
            setSelectedFile(null);
            onSuccess && onSuccess(response.data);
            onClose();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <Upload className="w-6 h-6 text-indigo-600" />
                        <span>Upload Medical Record</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* File Drop Zone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select File
                        </label>
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            {selectedFile ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                                        <FileText className="w-5 h-5" />
                                        <span className="font-medium">{selectedFile.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                        className="text-sm text-red-600 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : isDragActive ? (
                                <p className="text-gray-600 dark:text-gray-300">Drop the file here...</p>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Drag and drop a file here, or click to browse
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Supported: PDF, JPG, PNG, DOC, DOCX, TXT (Max 50MB)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="input"
                        >
                            <option value="reports">Medical Reports</option>
                            <option value="prescriptions">Prescriptions</option>
                            <option value="scans">Scans & Images</option>
                        </select>
                    </div>

                    {/* Security Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div className="text-sm text-blue-800 dark:text-blue-300">
                                <p className="font-medium mb-1">Secure Upload Process:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• File encrypted with AES-256</li>
                                    <li>• Stored on decentralized IPFS network</li>
                                    <li>• Metadata recorded on blockchain</li>
                                    <li>• Only authorized users can access</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        {uploading ? (
                            <>
                                <div className="spinner w-4 h-4"></div>
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                <span>Upload & Encrypt</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
