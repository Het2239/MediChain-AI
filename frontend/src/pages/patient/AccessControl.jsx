import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Users, Check, X, Clock, Shield } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function PatientAccessControl() {
    const { address } = useAccount();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [authorizedDoctors, setAuthorizedDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAccessData();
    }, [address]);

    const loadAccessData = async () => {
        try {
            setLoading(true);
            const [requests, doctors] = await Promise.all([
                axios.get(`${API_URL}/patient/access-requests/pending`, {
                    headers: { 'X-Wallet-Address': address }
                }),
                axios.get(`${API_URL}/patient/authorized-doctors`, {
                    headers: { 'X-Wallet-Address': address }
                })
            ]);
            setPendingRequests(requests.data.requests || []);
            setAuthorizedDoctors(doctors.data.doctors || []);
        } catch (error) {
            toast.error('Failed to load access data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (doctorAddress) => {
        try {
            await axios.post(`${API_URL}/patient/approve-access`,
                { doctorAddress },
                { headers: { 'X-Wallet-Address': address } }
            );
            toast.success('Access approved!');
            loadAccessData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve');
        }
    };

    const handleRevoke = async (doctorAddress) => {
        try {
            await axios.post(`${API_URL}/patient/revoke-access`,
                { doctorAddress },
                { headers: { 'X-Wallet-Address': address } }
            );
            toast.success('Access revoked!');
            loadAccessData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to revoke');
        }
    };

    if (loading) {
        return (
            <div className="section-light min-h-screen">
                <div className="flex justify-center py-12">
                    <div className="spinner w-10 h-10 border-[#042B0B]/20 border-t-[#042B0B]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="section-light min-h-screen">
            <div className="container-opella space-y-8 py-8">
                <div>
                    <h1 className="heading-opella text-3xl font-bold text-[#001A05]">
                        Access Control
                    </h1>
                    <p className="mt-1 text-[#001A05]/70 text-lg">
                        Manage who can access your medical records
                    </p>
                </div>

                {/* Pending Requests */}
                <div className="card-light p-6">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#001A05]/10">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-amber-600" />
                            <h2 className="text-xl font-bold text-[#001A05]">
                                Pending Requests
                            </h2>
                            {pendingRequests.length > 0 && (
                                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        {pendingRequests.length === 0 ? (
                            <p className="text-[#001A05]/50 text-center py-8 italic">
                                No pending access requests
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {pendingRequests.map((request, idx) => (
                                    <div key={idx} className="bg-white border border-[#001A05]/10 rounded-lg p-6 shadow-sm hover:border-[#042B0B]/30 transition-all">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="font-mono text-sm font-bold text-[#001A05] bg-[#001A05]/5 p-2 rounded inline-block mb-3">
                                                    {request.doctor}
                                                </p>
                                                <p className="text-[#001A05]/80 text-lg mb-2">
                                                    <strong className="text-[#001A05]">Reason:</strong> {request.reason}
                                                </p>
                                                <p className="text-xs text-[#001A05]/50 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    Requested {new Date(request.requestedAtDate).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex space-x-3 md:ml-4">
                                                <button
                                                    onClick={() => handleApprove(request.doctor)}
                                                    className="btn bg-green-600 hover:bg-green-700 text-white btn-sm flex items-center space-x-1"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    <span>Approve</span>
                                                </button>
                                                <button
                                                    className="btn bg-red-600 hover:bg-red-700 text-white btn-sm flex items-center space-x-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>Deny</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Authorized Doctors */}
                <div className="card-light p-6">
                    <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-[#001A05]/10">
                        <Users className="w-5 h-5 text-green-600" />
                        <h2 className="text-xl font-bold text-[#001A05]">
                            Authorized Doctors
                        </h2>
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full border border-green-200">
                            {authorizedDoctors.length}
                        </span>
                    </div>
                    <div>
                        {authorizedDoctors.length === 0 ? (
                            <p className="text-[#001A05]/50 text-center py-8 italic">
                                No doctors have access yet
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {authorizedDoctors.map((doctor, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-white border border-[#001A05]/10 rounded-lg hover:border-[#042B0B]/30 transition-all shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center border border-green-200">
                                                <Shield className="w-5 h-5 text-green-700" />
                                            </div>
                                            <p className="font-mono text-sm font-medium text-[#001A05]">
                                                {doctor}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRevoke(doctor)}
                                            className="btn bg-[#042B0B]/10 hover:bg-red-50 text-[#001A05] hover:text-red-700 hover:border-red-200 btn-sm border border-[#042B0B]/10 transition-colors"
                                        >
                                            Revoke Access
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
