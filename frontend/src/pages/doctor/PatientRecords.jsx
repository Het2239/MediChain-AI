import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { FileText, Download, ArrowLeft, Lock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import FileDownloadModal from '../../components/FileDownloadModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function DoctorPatientRecords() {
    const { patientAddress } = useParams();
    const navigate = useNavigate();
    const { address } = useAccount();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    useEffect(() => {
        if (address && patientAddress) {
            loadRecords();
        }
    }, [address, patientAddress]);

    const loadRecords = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${API_URL}/doctor/patient/${patientAddress}/records`,
                { headers: { 'X-Wallet-Address': address.toLowerCase() } }
            );
            setRecords(res.data.records || []);
        } catch (error) {
            toast.error('Failed to load patient records');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (record) => {
        setSelectedFile(record);
        setShowDownloadModal(true);
    };

    const getCategoryColor = (category) => {
        const colors = {
            'lab-result': 'badge-primary',
            'prescription': 'badge-success',
            'imaging': 'badge-info',
            'consultation': 'badge-warning',
            'other': 'badge-secondary'
        };
        return colors[category] || 'badge-secondary';
    };

    const formatCategory = (category) => {
        return category.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/doctor/patients')}
                    className="btn btn-secondary"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Patient Medical Records
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 font-mono">
                        Patient: {patientAddress}
                    </p>
                </div>
            </div>

            {/* Records List */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Medical Files ({records.length})</span>
                    </h2>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="spinner w-8 h-8"></div>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                                No medical records found for this patient
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            File Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Upload Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Encrypted
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {records.map((record, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {record.metadata?.filename || 'Untitled'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                            {record.cid.slice(0, 8)}...{record.cid.slice(-6)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`badge ${getCategoryColor(record.category)}`}>
                                                    {formatCategory(record.category)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(record.uploadTimestamp * 1000).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {record.encrypted ? (
                                                    <Lock className="w-4 h-4 text-amber-600" />
                                                ) : (
                                                    <span className="text-xs text-gray-400">No</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button
                                                    onClick={() => handleDownload(record)}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Download Modal */}
            {showDownloadModal && selectedFile && (
                <FileDownloadModal
                    isOpen={showDownloadModal}
                    file={selectedFile}
                    patientAddress={patientAddress}
                    userAddress={address.toLowerCase()}
                    onClose={() => {
                        setShowDownloadModal(false);
                        setSelectedFile(null);
                    }}
                />
            )}
        </div>
    );
}
