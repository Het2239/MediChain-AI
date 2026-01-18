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
                localStorage.setItem('deleted Files', JSON.stringify(deletedFiles));
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

    return (
        <div className="w-full">
            <div className="section section-light">
                <div className="container-opella space-y-8">
                    {/* Header - Opella Style */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="heading-opella text-3xl md:text-4xl font-bold text-[#001A05]">
                                Medical Records
                            </h1>
                            <p className="mt-3 text-lg text-[#001A05]/80">
                                {records.length} record{records.length !== 1 ? 's' : ''} stored securely
                            </p>
                        </div>
                        <button
                            onClick={() => setUploadModalOpen(true)}
                            className="btn bg-[#042B0B] text-[#F7EFE6] border-[#F7EFE6] hover:bg-[#042B0B]/90 flex items-center space-x-2"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Upload Record</span>
                        </button>
                    </div>

                    {/* Filters - Opella Clean Style */}
                    <div className="card-light p-6">
                        <div className="flex items-center space-x-3 flex-wrap gap-2">
                            <Filter className="w-5 h-5 text-[#001A05] flex-shrink-0" />
                            <span className="text-sm font-semibold text-[#001A05] flex-shrink-0">
                                Filter:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setSelectedCategory(cat.value)}
                                        className={`px-4 py-2 rounded-[4px] text-sm font-medium transition-all flex items-center space-x-2 ${selectedCategory === cat.value
                                            ? 'bg-[#042B0B] text-[#F7EFE6] shadow-md'
                                            : 'bg-[#042B0B]/10 text-[#001A05] hover:bg-[#042B0B]/20'
                                            }`}
                                    >
                                        <cat.icon className="w-4 h-4" />
                                        <span>{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Records List */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="spinner w-12 h-12"></div>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="card-light p-12 text-center">
                            <FileText className="w-20 h-20 text-[#001A05]/20 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-[#001A05] mb-2">
                                No Records Found
                            </h3>
                            <p className="text-[#001A05]/70 mb-6">
                                {selectedCategory === 'all'
                                    ? 'Upload your first medical record to get started'
                                    : `No records in the ${selectedCategory} category`}
                            </p>
                            <button
                                onClick={() => setUploadModalOpen(true)}
                                className="btn bg-[#042B0B] text-[#F7EFE6] border-[#F7EFE6] hover:bg-[#042B0B]/90"
                            >
                                Upload Record
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {records.map((record, index) => (
                                <div key={index} className="card-light p-6">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                                            <div className="w-12 h-12 bg-[#042B0B] rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-6 h-6 text-[#F7EFE6]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1 flex-wrap">
                                                    <h3 className="font-bold text-[#001A05] text-lg truncate">
                                                        {record.metadata?.filename || `Untitled ${record.fileType?.toUpperCase()} File`}
                                                    </h3>
                                                    <span className={`badge ${getCategoryBadge(record.category)}`}>
                                                        {record.category}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-[#001A05]/70 mb-1">
                                                    Uploaded {new Date(record.timestampDate).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-[#001A05]/50 font-mono truncate">
                                                    CID: {record.cid}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleRenameClick(record)}
                                                className="btn btn-sm bg-[#042B0B]/10 text-[#001A05] border-[#042B0B]/20 hover:bg-[#042B0B]/20 flex items-center space-x-1"
                                                title="Rename File"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDownloadClick(record)}
                                                className="btn btn-sm bg-[#042B0B] text-[#F7EFE6] border-[#F7EFE6] hover:bg-[#042B0B]/90 flex items-center space-x-1"
                                                title="Download & Decrypt"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>Download</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(record)}
                                                className="btn btn-sm bg-red-600 text-white border-red-700 hover:bg-red-700 flex items-center space-x-1"
                                                title="Delete File"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

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
