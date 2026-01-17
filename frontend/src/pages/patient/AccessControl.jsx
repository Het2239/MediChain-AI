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
            <div className="flex justify-center py-12">
                <div className="spinner w-10 h-10"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Access Control
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                    Manage who can access your medical records
                </p>
            </div>

            {/* Pending Requests */}
            <div className="card">
                <div className="card-header flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-warning-600" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Pending Requests
                        </h2>
                        {pendingRequests.length > 0 && (
                            <span className="badge badge-warning">{pendingRequests.length}</span>
                        )}
                    </div>
                </div>
                <div className="card-body">
                    {pendingRequests.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            No pending access requests
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {pendingRequests.map((request, idx) => (
                                <div key={idx} className="border dark:border-gray-700 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-mono text-sm text-gray-900 dark:text-white">
                                                {request.doctor}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                                <strong>Reason:</strong> {request.reason}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Requested {new Date(request.requestedAtDate).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => handleApprove(request.doctor)}
                                                className="btn btn-success btn-sm flex items-center space-x-1"
                                            >
                                                <Check className="w-4 h-4" />
                                                <span>Approve</span>
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm flex items-center space-x-1"
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
            <div className="card">
                <div className="card-header flex items-center space-x-2">
                    <Users className="w-5 h-5 text-success-600" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Authorized Doctors
                    </h2>
                    <span className="badge badge-success">{authorizedDoctors.length}</span>
                </div>
                <div className="card-body">
                    {authorizedDoctors.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            No doctors have access yet
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {authorizedDoctors.map((doctor, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-success-600 dark:text-success-400" />
                                        </div>
                                        <p className="font-mono text-sm text-gray-900 dark:text-white">
                                            {doctor}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRevoke(doctor)}
                                        className="btn btn-danger btn-sm"
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
    );
}
