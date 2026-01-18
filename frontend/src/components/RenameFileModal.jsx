import { useState } from 'react';
import { X, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function RenameFileModal({ isOpen, onClose, file, userAddress, onSuccess }) {
    const [filename, setFilename] = useState(file?.metadata?.filename || '');
    const [updating, setUpdating] = useState(false);

    const handleRename = async () => {
        if (!filename.trim()) {
            toast.error('Filename cannot be empty');
            return;
        }

        try {
            setUpdating(true);

            // Store custom filename in localStorage
            const customNames = JSON.parse(localStorage.getItem('customFileNames') || '{}');
            customNames[file.cid] = filename.trim();
            localStorage.setItem('customFileNames', JSON.stringify(customNames));

            toast.success('File renamed successfully!');
            onSuccess && onSuccess();
            onClose();
        } catch (error) {
            toast.error('Rename failed');
        } finally {
            setUpdating(false);
        }
    };

    if (!isOpen || !file) return null;

    return (
        <div className="fixed inset-0 bg-[#001A05]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#F7EFE6] rounded-lg max-w-md w-full shadow-2xl border border-[#001A05]/20">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#001A05]/10 bg-white/50">
                    <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-[#042B0B]" />
                        <h2 className="text-xl font-bold text-[#001A05]">
                            Rename File
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#001A05]/50 hover:text-[#001A05] transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#001A05] mb-2 uppercase tracking-wide">
                            File Name
                        </label>
                        <input
                            type="text"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            placeholder="Enter filename..."
                            className="input bg-white border-[#001A05]/20 focus:border-[#042B0B] text-[#001A05] placeholder-[#001A05]/30 w-full"
                            autoFocus
                        />
                        <p className="text-xs text-[#001A05]/60 mt-2 font-medium">
                            Give this file a meaningful name for easy identification
                        </p>
                    </div>

                    <div className="bg-[#042B0B]/5 border border-[#042B0B]/10 rounded-lg p-3">
                        <p className="text-xs text-[#001A05]/80">
                            <strong className="text-[#042B0B]">CID:</strong> {file.cid.slice(0, 12)}...{file.cid.slice(-8)}
                        </p>
                        <p className="text-xs text-[#001A05]/80 mt-1">
                            <strong className="text-[#042B0B]">Category:</strong> {file.category}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-[#001A05]/10 bg-white/50">
                    <button
                        onClick={onClose}
                        disabled={updating}
                        className="px-5 py-2 rounded-lg border border-[#001A05]/20 text-[#001A05] hover:bg-[#001A05]/5 font-medium transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRename}
                        disabled={updating || !filename.trim() || filename === file?.metadata?.filename}
                        className="btn bg-[#042B0B] text-[#F7EFE6] hover:bg-[#042B0B]/90 px-5 py-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updating ? 'Renaming...' : 'Rename'}
                    </button>
                </div>
            </div>
        </div>
    );
}
