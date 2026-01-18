import { useState } from 'react';
import { Download, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function FileDownloadModal({ isOpen, onClose, file, patientAddress, userAddress }) {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setDownloading(true);

            const response = await axios.post(
                `${API_URL}/file/download/${file.cid}`,
                { patientAddress },
                {
                    headers: {
                        'X-Wallet-Address': userAddress
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
            onClose();
        } catch (error) {
            console.error('Download error:', error);
            if (error.response?.status === 403) {
                toast.error('Access denied');
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

                    {/* Info Message */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                            ✔️ This file will be decrypted automatically and downloaded to your device.
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
                        disabled={downloading}
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
