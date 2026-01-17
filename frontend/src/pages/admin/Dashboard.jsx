import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Shield, Users, CheckCircle, XCircle, Key } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function AdminDashboard() {
    const { address } = useAccount();
    const [authenticated, setAuthenticated] = useState(false);
    const [secretKey, setSecretKey] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verifyingDoctor, setVerifyingDoctor] = useState(null);

    // Form states for verifying new doctor
    const [showVerifyForm, setShowVerifyForm] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        address: '',
        licenseNumber: '',
        specialty: ''
    });

    const handleLogin = () => {
        // Simple secret key check - in production, use proper authentication
        const adminKey = import.meta.env.VITE_ADMIN_SECRET || 'medichain-admin-2026';

        if (secretKey === adminKey) {
            setAuthenticated(true);
            toast.success('Admin access granted');
            loadData();
        } else {
            toast.error('Invalid secret key');
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [doctorsRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/admin/doctors/verified`, {
                    headers: { 'X-Wallet-Address': address }
                }),
                axios.get(`${API_URL}/admin/stats`, {
                    headers: { 'X-Wallet-Address': address }
                })
            ]);

            setDoctors(doctorsRes.data.doctors || []);
            setStats(statsRes.data.stats);
        } catch (error) {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyDoctor = async () => {
        if (!newDoctor.address || !newDoctor.licenseNumber) {
            toast.error('Address and license number are required');
            return;
        }

        try {
            setVerifyingDoctor(newDoctor.address);
            await axios.post(
                `${API_URL}/admin/verify-doctor`,
                {
                    doctorAddress: newDoctor.address,
                    licenseNumber: newDoctor.licenseNumber,
                    specialty: newDoctor.specialty
                },
                { headers: { 'X-Wallet-Address': address } }
            );

            toast.success('Doctor verified successfully!');
            setNewDoctor({ address: '', licenseNumber: '', specialty: '' });
            setShowVerifyForm(false);
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setVerifyingDoctor(null);
        }
    };

    const handleRevokeDoctor = async (doctorAddress) => {
        if (!confirm('Are you sure you want to revoke this doctor?')) return;

        try {
            await axios.post(
                `${API_URL}/admin/revoke-doctor`,
                { doctorAddress },
                { headers: { 'X-Wallet-Address': address } }
            );

            toast.success('Doctor revoked successfully');
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Revocation failed');
        }
    };

    if (!authenticated) {
        return (
            <div className="max-w-md mx-auto mt-16">
                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center justify-center space-x-2">
                            <Shield className="w-6 h-6 text-red-600" />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Admin Access
                            </h2>
                        </div>
                    </div>
                    <div className="card-body space-y-4">
                        <p className="text-center text-gray-600 dark:text-gray-400">
                            Enter the admin secret key to access the admin panel
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Secret Key
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={secretKey}
                                    onChange={(e) => setSecretKey(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                    placeholder="Enter secret key"
                                    className="input pl-10"
                                />
                            </div>
                        </div>
                        <button onClick={handleLogin} className="btn btn-primary w-full">
                            Access Admin Panel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Admin Dashboard
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        System management and doctor verification
                    </p>
                </div>
                <button
                    onClick={() => setShowVerifyForm(!showVerifyForm)}
                    className="btn btn-primary"
                >
                    {showVerifyForm ? 'Cancel' : 'Verify New Doctor'}
                </button>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="stat-card">
                        <Users className="w-8 h-8 text-indigo-600 mb-2" />
                        <div className="stat-value">{stats.patients.total}</div>
                        <div className="stat-label">Total Patients</div>
                    </div>

                    <div className="stat-card">
                        <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                        <div className="stat-value">{stats.doctors.totalVerified}</div>
                        <div className="stat-label">Verified Doctors</div>
                    </div>

                    <div className="stat-card">
                        <Shield className="w-8 h-8 text-blue-600 mb-2" />
                        <div className="stat-value">{stats.accessControl.totalApprovals}</div>
                        <div className="stat-label">Access Approvals</div>
                    </div>
                </div>
            )}

            {/* Verify Doctor Form */}
            {showVerifyForm && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Verify New Doctor
                        </h2>
                    </div>
                    <div className="card-body space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Doctor Wallet Address
                            </label>
                            <input
                                type="text"
                                value={newDoctor.address}
                                onChange={(e) => setNewDoctor({ ...newDoctor, address: e.target.value })}
                                placeholder="0x..."
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                License Number
                            </label>
                            <input
                                type="text"
                                value={newDoctor.licenseNumber}
                                onChange={(e) => setNewDoctor({ ...newDoctor, licenseNumber: e.target.value })}
                                placeholder="License number"
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Specialty (Optional)
                            </label>
                            <input
                                type="text"
                                value={newDoctor.specialty}
                                onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                                placeholder="e.g., Cardiology"
                                className="input"
                            />
                        </div>

                        <button
                            onClick={handleVerifyDoctor}
                            disabled={verifyingDoctor}
                            className="btn btn-primary w-full"
                        >
                            {verifyingDoctor ? 'Verifying...' : 'Verify Doctor'}
                        </button>
                    </div>
                </div>
            )}

            {/* Verified Doctors List */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Verified Doctors ({doctors.length})
                    </h2>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="spinner w-8 h-8"></div>
                        </div>
                    ) : doctors.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No verified doctors yet
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {doctors.map((doctor) => (
                                <div
                                    key={doctor.address}
                                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-mono text-sm text-gray-900 dark:text-white">
                                                {doctor.address}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                License: {doctor.licenseNumber}
                                                {doctor.specialty && ` • ${doctor.specialty}`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Verified: {new Date(doctor.verifiedAtDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRevokeDoctor(doctor.address)}
                                        className="btn btn-danger btn-sm"
                                    >
                                        Revoke
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
