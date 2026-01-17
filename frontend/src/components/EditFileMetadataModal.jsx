import { useState } from 'react';
import { X, Edit } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function EditFileMetadataModal({ isOpen, onClose, file, userAddress, onSuccess }) {
    const [category, setCategory] = useState(file?.category || 'reports');
    const [updating, setUpdating] = useState(false);

    const handleUpdate = async () => {
        try {
            setUpdating(true);
            await axios.put(
                `${API_URL}/file/metadata/${file.cid}`,
                { category },
                { headers: { 'X-Wallet-Address': userAddress } }
            );

            toast.success('Category updated successfully!');
            onSuccess && onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
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
                        <Edit className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Edit File Category
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
                            Current File
                        </label>
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                            <p className="text-sm font-mono text-gray-600 dark:text-gray-400 truncate">
                                {file.cid}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(file.timestampDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

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

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                            Note: Blockchain records are immutable. This updates your local preference only.
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
                        onClick={handleUpdate}
                        disabled={updating || category === file.category}
                        className="btn btn-primary"
                    >
                        {updating ? 'Updating...' : 'Update Category'}
                    </button>
                </div>
            </div>
        </div>
    );
}
