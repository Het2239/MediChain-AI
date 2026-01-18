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
        <div className="fixed inset-0 bg-[#001A05]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#F7EFE6] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#001A05]/20">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#001A05]/10 bg-white/50">
                    <h2 className="text-2xl font-bold text-[#001A05] flex items-center space-x-2">
                        <Upload className="w-6 h-6 text-[#042B0B]" />
                        <span>Upload Medical Record</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[#001A05]/50 hover:text-[#001A05] transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8">
                    {/* File Drop Zone */}
                    <div>
                        <label className="block text-sm font-bold text-[#001A05] mb-2 uppercase tracking-wide">
                            Select File
                        </label>
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragActive
                                ? 'border-[#042B0B] bg-[#042B0B]/5 scale-[1.02]'
                                : 'border-[#001A05]/20 hover:border-[#042B0B]/50 hover:bg-white/50'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="w-16 h-16 text-[#001A05]/30 mx-auto mb-6" />
                            {selectedFile ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center space-x-3 text-[#042B0B] bg-white/80 p-3 rounded-lg border border-[#001A05]/10 inline-block px-6">
                                        <FileText className="w-6 h-6" />
                                        <span className="font-bold text-lg">{selectedFile.name}</span>
                                    </div>
                                    <p className="text-sm text-[#001A05]/60 font-mono">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                        className="text-sm text-red-600 hover:text-red-700 font-bold hover:underline"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            ) : isDragActive ? (
                                <p className="text-[#001A05] text-lg font-medium">Drop the file here...</p>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-[#001A05] text-xl font-medium">
                                        Drag and drop a file here, or click to browse
                                    </p>
                                    <p className="text-sm text-[#001A05]/50">
                                        Supported: PDF, JPG, PNG, DOC, DOCX, TXT (Max 50MB)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-bold text-[#001A05] mb-2 uppercase tracking-wide">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-white border border-[#001A05]/20 rounded-lg px-4 py-3 text-[#001A05] focus:outline-none focus:ring-2 focus:ring-[#042B0B] focus:border-transparent transition-all"
                        >
                            <option value="reports">Medical Reports</option>
                            <option value="prescriptions">Prescriptions</option>
                            <option value="scans">Scans & Images</option>
                        </select>
                    </div>

                    {/* Security Info */}
                    <div className="bg-[#042B0B]/5 border border-[#042B0B]/10 rounded-lg p-5">
                        <div className="flex items-start space-x-4">
                            <Lock className="w-6 h-6 text-[#042B0B] mt-0.5" />
                            <div className="text-sm text-[#001A05]">
                                <p className="font-bold mb-2 text-base">Secure Upload Process:</p>
                                <ul className="space-y-1.5 text-[#001A05]/70 list-disc ml-4">
                                    <li>File encrypted with AES-256</li>
                                    <li>Stored on decentralized IPFS network</li>
                                    <li>Metadata recorded on blockchain</li>
                                    <li>Only authorized users can access</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-4 p-6 border-t border-[#001A05]/10 bg-white/50">
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className="px-6 py-2 rounded-lg border border-[#001A05]/20 text-[#001A05] hover:bg-[#001A05]/5 font-medium transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        className="btn bg-[#042B0B] text-[#F7EFE6] hover:bg-[#042B0B]/90 flex items-center space-x-2 px-6 py-3 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <>
                                <div className="spinner w-5 h-5 border-[#F7EFE6]/30 border-t-[#F7EFE6]"></div>
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                <span>Upload & Encrypt</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
