import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { FileText, Upload, Download, Filter, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import FileUploadModal from '../../components/FileUploadModal';
import FileDownloadModal from '../../components/FileDownloadModal';
import RenameFileModal from '../../components/RenameFileModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function PatientRecords() {
    const { address } = useAccount();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [downloadModalOpen, setDownloadModalOpen] = useState(false);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        loadRecords();
    }, [address, selectedCategory]);

    const loadRecords = async () => {
        try {
            setLoading(true);
            const endpoint = selectedCategory === 'all'
                ? `${API_URL}/patient/records`
                : `${API_URL}/patient/records/category/${selectedCategory}`;

            const res = await axios.get(endpoint, {
                headers: { 'X-Wallet-Address': address }
            });

            // Get deleted files and custom names from localStorage
            const deletedFiles = JSON.parse(localStorage.getItem('deletedFiles') || '[]');
            const customNames = JSON.parse(localStorage.getItem('customFileNames') || '{}');

            // Filter out deleted files and apply custom names
            const recordsWithCustomNames = (res.data.records || [])
                .filter(record => !deletedFiles.includes(record.cid))
                .map(record => ({
                    ...record,
                    metadata: {
                        ...record.metadata,
                        filename: customNames[record.cid] || record.metadata?.filename || `Untitled ${record.fileType?.toUpperCase() || 'FILE'}`
                    }
                }));

            setRecords(recordsWithCustomNames);
        } catch (error) {
            toast.error('Failed to load records');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadClick = (record) => {
        setSelectedFile(record);
        setDownloadModalOpen(true);
    };

    const handleRenameClick = (record) => {
        setSelectedFile(record);
        setRenameModalOpen(true);
    };

    const handleDeleteClick = async (record) => {
        if (!confirm(`Are you sure you want to delete "${record.metadata?.filename || 'this file'}"?`)) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/file/${record.cid}`, {
                headers: { 'X-Wallet-Address': address }
            });

            // Track deleted file in localStorage
            const deletedFiles = JSON.parse(localStorage.getItem('deletedFiles') || '[]');
            if (!deletedFiles.includes(record.cid)) {
                deletedFiles.push(record.cid);
                localStorage.setItem('deletedFiles', JSON.stringify(deletedFiles));
            }

            // Remove from localStorage custom names
            const customNames = JSON.parse(localStorage.getItem('customFileNames') || '{}');
            delete customNames[record.cid];
            localStorage.setItem('customFileNames', JSON.stringify(customNames));

            toast.success('File deleted successfully!');
            loadRecords(); // Reload records
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete file');
        }
    };

    const categories = [
        { value: 'all', label: 'All Records', icon: FileText },
        { value: 'reports', label: 'Medical Reports', icon: FileText },
        { value: 'prescriptions', label: 'Prescriptions', icon: FileText },
        { value: 'scans', label: 'Scans & Images', icon: FileText }
    ];

    const getCategoryBadge = (category) => {
        const colors = {
            reports: 'badge-info',
            prescriptions: 'badge-success',
            scans: 'badge-warning'
        };
        return colors[category] || 'badge-info';
    };

    const getCategoryColor = (category) => {
        const colors = {
            reports: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
            prescriptions: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
            scans: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
        };
        return colors[category] || 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Medical Records
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {records.length} record{records.length !== 1 ? 's' : ''} stored securely
                    </p>
                </div>
                <button
                    onClick={() => setUploadModalOpen(true)}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <Upload className="w-4 h-4" />
                    <span>Upload Record</span>
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="card-body">
                    <div className="flex items-center space-x-2 overflow-x-auto">
                        <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
                            Filter:
                        </span>
                        <div className="flex space-x-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${selectedCategory === cat.value
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <cat.icon className="w-4 h-4" />
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Records List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="spinner w-10 h-10"></div>
                </div>
            ) : records.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Records Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {selectedCategory === 'all'
                                ? 'Upload your first medical record to get started'
                                : `No records in the ${selectedCategory} category`}
                        </p>
                        <button
                            onClick={() => setUploadModalOpen(true)}
                            className="btn btn-primary"
                        >
                            Upload Record
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {records.map((record, index) => (
                        <div key={index} className="card hover:shadow-lg transition-shadow">
                            <div className="card-body">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(record.category)}`}>
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {record.metadata?.filename || `Untitled ${record.fileType.toUpperCase()} File`}
                                                </h3>
                                                <span className={`badge ${getCategoryBadge(record.category)}`}>
                                                    {record.category}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Uploaded {new Date(record.timestampDate).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1 truncate">
                                                CID: {record.cid}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => handleRenameClick(record)}
                                            className="btn btn-secondary btn-sm flex items-center space-x-1"
                                            title="Rename File"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDownloadClick(record)}
                                            className="btn btn-primary btn-sm flex items-center space-x-1"
                                            title="Download & Decrypt"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(record)}
                                            className="btn btn-danger btn-sm flex items-center space-x-1"
                                            title="Delete File"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <FileUploadModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onSuccess={loadRecords}
                patientAddress={address}
            />

            <FileDownloadModal
                isOpen={downloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
                file={selectedFile}
                patientAddress={address}
                userAddress={address}
            />

            <RenameFileModal
                isOpen={renameModalOpen}
                onClose={() => setRenameModalOpen(false)}
                file={selectedFile}
                userAddress={address}
                onSuccess={loadRecords}
            />
        </div>
    );
}
