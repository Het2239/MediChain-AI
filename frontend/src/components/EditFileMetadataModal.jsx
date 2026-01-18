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
        <div className="fixed inset-0 bg-[#001A05]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#F7EFE6] rounded-lg max-w-md w-full shadow-2xl border border-[#001A05]/20">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#001A05]/10 bg-white/50">
                    <div className="flex items-center space-x-2">
                        <Edit className="w-5 h-5 text-[#042B0B]" />
                        <h2 className="text-xl font-bold text-[#001A05]">
                            Edit File Category
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
                            Current File
                        </label>
                        <div className="bg-white rounded-lg p-4 border border-[#001A05]/10">
                            <p className="text-sm font-mono text-[#001A05] truncate font-medium">
                                {file.cid}
                            </p>
                            <p className="text-xs text-[#001A05]/60 mt-1">
                                {new Date(file.timestampDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

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

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-800 font-medium">
                            Note: Blockchain records are immutable. This updates your local preference only.
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
                        onClick={handleUpdate}
                        disabled={updating || category === file.category}
                        className="btn bg-[#042B0B] text-[#F7EFE6] hover:bg-[#042B0B]/90 px-5 py-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updating ? 'Updating...' : 'Update Category'}
                    </button>
                </div>
            </div>
        </div>
    );
}
