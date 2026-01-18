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
        if (request.approved) return { label: 'Approved', color: 'bg-green-100 text-green-800' };
        if (!request.active) return { label: 'Denied', color: 'bg-red-100 text-red-800' };
        return { label: 'Pending', color: 'bg-amber-100 text-amber-800' };
    };

    return (
        <div className="section-light min-h-screen">
            <div className="container-opella space-y-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="heading-opella text-3xl font-bold text-[#001A05]">
                            My Patients
                        </h1>
                        <p className="mt-1 text-[#001A05]/70 text-lg">
                            Request access and view authorized patient records
                        </p>
                    </div>
                    <button
                        onClick={() => setShowRequestForm(!showRequestForm)}
                        className="btn bg-[#042B0B] text-[#F7EFE6] hover:bg-[#042B0B]/90 flex items-center space-x-2"
                    >
                        <Send className="w-4 h-4" />
                        <span>{showRequestForm ? 'Cancel' : 'Request Access'}</span>
                    </button>
                </div>

                {/* Request Access Form */}
                {showRequestForm && (
                    <div className="card-light p-6">
                        <div className="mb-6 pb-4 border-b border-[#001A05]/10">
                            <h2 className="text-xl font-bold text-[#001A05]">
                                Request Patient Access
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#001A05] mb-2">
                                    Patient Wallet Address
                                </label>
                                <input
                                    type="text"
                                    value={requestForm.patientAddress}
                                    onChange={(e) => setRequestForm({ ...requestForm, patientAddress: e.target.value })}
                                    placeholder="0x..."
                                    className="input bg-white border-[#001A05]/20 focus:border-[#042B0B]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#001A05] mb-2">
                                    Reason for Access
                                </label>
                                <textarea
                                    value={requestForm.reason}
                                    onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                                    placeholder="Explain why you need access to this patient's records..."
                                    rows={4}
                                    className="input bg-white border-[#001A05]/20 focus:border-[#042B0B]"
                                />
                            </div>

                            <button
                                onClick={handleSubmitRequest}
                                disabled={submitting}
                                className="btn bg-[#042B0B] text-[#F7EFE6] hover:bg-[#042B0B]/90 w-full"
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Authorized Patients */}
                <div className="card-light p-6">
                    <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-[#001A05]/10">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h2 className="text-xl font-bold text-[#001A05]">
                            Authorized Patients ({authorizedPatients.length})
                        </h2>
                    </div>
                    <div>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="spinner w-8 h-8 border-[#042B0B]/20 border-t-[#042B0B]"></div>
                            </div>
                        ) : authorizedPatients.length === 0 ? (
                            <p className="text-center text-[#001A05]/50 py-8 italic">
                                No authorized patients yet. Request access to view patient records.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {authorizedPatients.map((patient, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-4 bg-white border border-[#001A05]/10 rounded-lg hover:border-[#042B0B]/30 transition-all shadow-sm"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-[#042B0B]/10 rounded-full flex items-center justify-center">
                                                <Users className="w-5 h-5 text-[#001A05]" />
                                            </div>
                                            <p className="font-mono text-sm text-[#001A05] font-medium">
                                                {patient}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleViewRecords(patient)}
                                            className="btn bg-[#042B0B]/10 text-[#001A05] hover:bg-[#042B0B]/20 btn-sm"
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
                <div className="card-light p-6">
                    <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-[#001A05]/10">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <h2 className="text-xl font-bold text-[#001A05]">
                            My Access Requests ({myRequests.length})
                        </h2>
                    </div>
                    <div>
                        {myRequests.length === 0 ? (
                            <p className="text-center text-[#001A05]/50 py-8 italic">
                                No access requests yet
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {myRequests.map((request, idx) => {
                                    const status = getRequestStatus(request);
                                    return (
                                        <div
                                            key={idx}
                                            className="p-4 bg-white border border-[#001A05]/10 rounded-lg shadow-sm"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <p className="font-mono text-sm font-bold text-[#001A05]">
                                                            {request.patient}
                                                        </p>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-[#001A05]/80">
                                                        <strong className="text-[#001A05]">Reason:</strong> {request.reason}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-xs text-[#001A05]/50 space-y-1 mt-2 pt-2 border-t border-[#001A05]/5">
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
        </div>
    );
}
