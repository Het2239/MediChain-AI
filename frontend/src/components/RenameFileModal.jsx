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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Rename File
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            File Name
                        </label>
                        <input
                            type="text"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            placeholder="Enter filename..."
                            className="input"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Give this file a meaningful name for easy identification
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            <strong>CID:</strong> {file.cid.slice(0, 12)}...{file.cid.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <strong>Category:</strong> {file.category}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button
                        onClick={onClose}
                        disabled={updating}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRename}
                        disabled={updating || !filename.trim() || filename === file?.metadata?.filename}
                        className="btn btn-primary"
                    >
                        {updating ? 'Renaming...' : 'Rename'}
                    </button>
                </div>
            </div>
        </div>
    );
}
