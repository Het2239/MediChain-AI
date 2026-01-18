import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { FileText, Download, ArrowLeft, Lock, Brain } from 'lucide-react';
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
            'lab-result': 'bg-blue-100 text-blue-800 border-blue-200',
            'prescription': 'bg-green-100 text-green-800 border-green-200',
            'imaging': 'bg-purple-100 text-purple-800 border-purple-200',
            'consultation': 'bg-amber-100 text-amber-800 border-amber-200',
            'other': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatCategory = (category) => {
        return category.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <div className="section-light min-h-screen">
            <div className="container-opella space-y-6 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                        <button
                            onClick={() => navigate('/doctor/patients')}
                            className="btn bg-[#042B0B]/10 text-[#001A05] hover:bg-[#042B0B]/20"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="heading-opella text-3xl font-bold text-[#001A05]">
                                Patient Medical Records
                            </h1>
                            <p className="mt-1 text-sm text-[#001A05]/60 font-mono">
                                Patient: {patientAddress}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/doctor/patient/${patientAddress}/insights`)}
                        className="btn bg-[#042B0B] text-[#F7EFE6] hover:bg-[#042B0B]/90 inline-flex items-center space-x-2 w-full md:w-auto justify-center"
                        disabled={records.length === 0}
                    >
                        <Brain className="w-5 h-5" />
                        <span>AI Insights</span>
                    </button>
                </div>

                {/* Records List */}
                <div className="card-light p-6">
                    <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-[#001A05]/10">
                        <FileText className="w-5 h-5 text-[#001A05]" />
                        <h2 className="text-xl font-bold text-[#001A05]">
                            Medical Files ({records.length})
                        </h2>
                    </div>
                    <div>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="spinner w-8 h-8 border-[#042B0B]/20 border-t-[#042B0B]"></div>
                            </div>
                        ) : records.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-[#001A05]/20 mx-auto mb-4" />
                                <p className="text-[#001A05]/60 text-lg">
                                    No medical records found for this patient
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-[#001A05]/5">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#001A05]/70 uppercase tracking-wider rounded-tl-lg">
                                                File Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#001A05]/70 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#001A05]/70 uppercase tracking-wider">
                                                Upload Date
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-[#001A05]/70 uppercase tracking-wider">
                                                Encrypted
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-[#001A05]/70 uppercase tracking-wider rounded-tr-lg">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#001A05]/10 border border-[#001A05]/10">
                                        {records.map((record, idx) => (
                                            <tr key={idx} className="hover:bg-[#001A05]/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <FileText className="w-5 h-5 text-[#001A05]/40 mr-3" />
                                                        <div>
                                                            <div className="text-sm font-bold text-[#001A05]">
                                                                {record.metadata?.filename || 'Untitled'}
                                                            </div>
                                                            <div className="text-xs text-[#001A05]/50 font-mono">
                                                                {record.cid.slice(0, 8)}...{record.cid.slice(-6)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getCategoryColor(record.category)}`}>
                                                        {formatCategory(record.category)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#001A05]/70">
                                                    {new Date(record.uploadTimestamp * 1000).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {record.encrypted ? (
                                                        <Lock className="w-4 h-4 text-amber-600" />
                                                    ) : (
                                                        <span className="text-xs text-[#001A05]/40">No</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <button
                                                        onClick={() => handleDownload(record)}
                                                        className="btn bg-[#042B0B] text-[#F7EFE6] hover:bg-[#042B0B]/90 btn-sm inline-flex items-center justify-center p-2 rounded-md transition-all hover:scale-105 shadow-sm"
                                                        title="Download File"
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
        </div>
    );
}
