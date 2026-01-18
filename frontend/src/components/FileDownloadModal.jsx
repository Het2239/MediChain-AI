import { useState } from 'react';
import { Download, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
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
        <div className="fixed inset-0 bg-[#001A05]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#F7EFE6] rounded-lg max-w-md w-full shadow-2xl border border-[#001A05]/20">
                {/* Header */}
                <div className="p-6 border-b border-[#001A05]/10 bg-white/50">
                    <h2 className="text-xl font-bold text-[#001A05] flex items-center space-x-2">
                        <Download className="w-5 h-5 text-[#042B0B]" />
                        <span>Download File</span>
                    </h2>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* File Info */}
                    <div className="bg-white rounded-lg p-5 border border-[#001A05]/10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#042B0B]/5 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none"></div>

                        <div className="space-y-3 text-sm relative z-10">
                            <div className="flex justify-between items-center border-b border-[#001A05]/5 pb-2">
                                <span className="text-[#001A05]/60">Category:</span>
                                <span className="font-bold text-[#001A05] capitalize bg-[#042B0B]/5 px-2 py-0.5 rounded">
                                    {file.category}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[#001A05]/5 pb-2">
                                <span className="text-[#001A05]/60">Type:</span>
                                <span className="font-bold text-[#001A05] uppercase">
                                    {file.fileType}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#001A05]/60">Uploaded:</span>
                                <span className="font-medium text-[#001A05]">
                                    {new Date(file.timestampDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Info Message */}
                    <div className="bg-[#042B0B]/5 border border-[#042B0B]/10 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                            <p className="text-sm text-[#001A05]/80">
                                This file will be <strong>automatically decrypted</strong> and downloaded to your device securely.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-[#001A05]/10 bg-white/50">
                    <button
                        onClick={onClose}
                        disabled={downloading}
                        className="px-5 py-2 rounded-lg border border-[#001A05]/20 text-[#001A05] hover:bg-[#001A05]/5 font-medium transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="btn bg-[#042B0B] text-[#F7EFE6] hover:bg-[#042B0B]/90 flex items-center space-x-2 px-5 py-2 shadow-md hover:shadow-lg transition-all"
                    >
                        {downloading ? (
                            <>
                                <div className="spinner w-4 h-4 border-[#F7EFE6]/30 border-t-[#F7EFE6]"></div>
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
