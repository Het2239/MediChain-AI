import { useState } from 'react';
import { Download, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function FileDownloadModal({ isOpen, onClose, file, patientAddress, userAddress }) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (!password) {
            toast.error('Please enter the decryption password');
            return;
        }

        try {
            setDownloading(true);

            const response = await axios.post(
                `${API_URL}/file/download/${file.cid}`,
                { patientAddress },
                {
                    headers: {
                        'X-Wallet-Address': userAddress,
                        'X-Password': password
                    },
                    responseType: 'blob'
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `medical-record-${file.cid.substring(0, 10)}.${file.fileType}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('File downloaded successfully!');
            setPassword('');
            onClose();
        } catch (error) {
            console.error('Download error:', error);
            if (error.response?.status === 403) {
                toast.error('Access denied or incorrect password');
            } else {
                toast.error(error.response?.data?.message || 'Download failed');
            }
        } finally {
            setDownloading(false);
        }
    };

    if (!isOpen || !file) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <Download className="w-5 h-5 text-indigo-600" />
                        <span>Download File</span>
                    </h2>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* File Info */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                                    {file.category}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white uppercase">
                                    {file.fileType}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Uploaded:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">
                                    {new Date(file.timestampDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Decryption Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
                                placeholder="Enter password to decrypt file"
                                className="input pl-10 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Enter the password used when uploading this file
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                            ⚠️ This file will be decrypted on your device. Make sure you're on a secure connection.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button
                        onClick={onClose}
                        disabled={downloading}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={!password || downloading}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        {downloading ? (
                            <>
                                <div className="spinner w-4 h-4"></div>
                                <span>Downloading...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                <span>Download & Decrypt</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
