import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Users, Send, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function DoctorPatients() {
    const { address } = useAccount();
    const navigate = useNavigate();
    const [authorizedPatients, setAuthorizedPatients] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestForm, setRequestForm] = useState({
        patientAddress: '',
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, [address]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [patientsRes, requestsRes] = await Promise.all([
                axios.get(`${API_URL}/doctor/authorized-patients`, {
                    headers: { 'X-Wallet-Address': address }
                }),
                axios.get(`${API_URL}/doctor/my-requests`, {
                    headers: { 'X-Wallet-Address': address }
                })
            ]);

            setAuthorizedPatients(patientsRes.data.patients || []);
            setMyRequests(requestsRes.data.requests || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRequest = async () => {
        if (!requestForm.patientAddress || !requestForm.reason) {
            toast.error('Patient address and reason are required');
            return;
        }

        try {
            setSubmitting(true);
            await axios.post(
                `${API_URL}/doctor/request-access`,
                requestForm,
                { headers: { 'X-Wallet-Address': address } }
            );

            toast.success('Access request submitted successfully!');
            setRequestForm({ patientAddress: '', reason: '' });
            setShowRequestForm(false);
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Request failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewRecords = async (patientAddress) => {
        // Navigate to patient records viewer
        navigate(`/doctor/patient/${patientAddress}/records`);
    };

    const getRequestStatus = (request) => {
        if (request.approved) return { label: 'Approved', color: 'badge-success' };
        if (!request.active) return { label: 'Denied', color: 'badge-danger' };
        return { label: 'Pending', color: 'badge-warning' };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        My Patients
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Request access and view authorized patient records
                    </p>
                </div>
                <button
                    onClick={() => setShowRequestForm(!showRequestForm)}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <Send className="w-4 h-4" />
                    <span>{showRequestForm ? 'Cancel' : 'Request Access'}</span>
                </button>
            </div>

            {/* Request Access Form */}
            {showRequestForm && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Request Patient Access
                        </h2>
                    </div>
                    <div className="card-body space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Patient Wallet Address
                            </label>
                            <input
                                type="text"
                                value={requestForm.patientAddress}
                                onChange={(e) => setRequestForm({ ...requestForm, patientAddress: e.target.value })}
                                placeholder="0x..."
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Reason for Access
                            </label>
                            <textarea
                                value={requestForm.reason}
                                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                                placeholder="Explain why you need access to this patient's records..."
                                rows={4}
                                className="input"
                            />
                        </div>

                        <button
                            onClick={handleSubmitRequest}
                            disabled={submitting}
                            className="btn btn-primary w-full"
                        >
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </div>
            )}

            {/* Authorized Patients */}
            <div className="card">
                <div className="card-header flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Authorized Patients ({authorizedPatients.length})
                    </h2>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="spinner w-8 h-8"></div>
                        </div>
                    ) : authorizedPatients.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No authorized patients yet. Request access to view patient records.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {authorizedPatients.map((patient, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <p className="font-mono text-sm text-gray-900 dark:text-white">
                                            {patient}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleViewRecords(patient)}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        View Records
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* My Requests */}
            <div className="card">
                <div className="card-header flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        My Access Requests ({myRequests.length})
                    </h2>
                </div>
                <div className="card-body">
                    {myRequests.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No access requests yet
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {myRequests.map((request, idx) => {
                                const status = getRequestStatus(request);
                                return (
                                    <div
                                        key={idx}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <p className="font-mono text-sm text-gray-900 dark:text-white">
                                                        {request.patient}
                                                    </p>
                                                    <span className={`badge ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    <strong>Reason:</strong> {request.reason}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p>Requested: {new Date(request.requestedAtDate).toLocaleString()}</p>
                                            {request.respondedAtDate && (
                                                <p>Responded: {new Date(request.respondedAtDate).toLocaleString()}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
