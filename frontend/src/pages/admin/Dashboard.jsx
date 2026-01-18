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
            <div className="section section-light min-h-[60vh] flex items-center justify-center">
                <div className="card-light p-12 max-w-md w-full space-y-6">
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-opella-dark dark:bg-opella-light rounded-full flex items-center justify-center mx-auto">
                            <Shield className="w-8 h-8 text-white text-[#001A05]" />
                        </div>
                        <h2 className="text-3xl font-bold text-[#001A05] text-[#001A05]">
                            Admin Access
                        </h2>
                        <p className="text-[#001A05]/80 text-[#001A05]/80">
                            Enter the admin secret key to access the admin panel
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#001A05] text-[#001A05] mb-2">
                                Secret Key
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-opella-dark/40 dark:text-opella-light/40" />
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
                        <button onClick={handleLogin} className="btn bg-[#042B0B] text-[#F7EFE6] border-[#F7EFE6] hover:bg-[#042B0B]/90 w-full">
                            Access Admin Panel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="section section-light">
                <div className="container-opella space-y-12">
                    {/* Header - Opella Bold */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="heading-opella text-4xl md:text-5xl font-bold text-[#001A05] text-[#001A05]">
                                Admin Dashboard
                            </h1>
                            <p className="mt-4 text-xl text-[#001A05]/80 text-[#001A05]/80">
                                System management and doctor verification
                            </p>
                        </div>
                        <button
                            onClick={() => setShowVerifyForm(!showVerifyForm)}
                            className="btn bg-[#042B0B] text-[#F7EFE6] border-[#F7EFE6] hover:bg-[#042B0B]/90"
                        >
                            {showVerifyForm ? 'Cancel' : 'Verify New Doctor'}
                        </button>
                    </div>

                    {/* Statistics - Opella Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="card-light p-6 text-center space-y-3">
                                <Users className="w-10 h-10 mx-auto text-[#001A05] text-[#001A05]" />
                                <div className="text-4xl font-bold text-[#001A05] text-[#001A05]">{stats.patients.total}</div>
                                <div className="text-sm text-[#001A05]/80 text-[#001A05]/80">Total Patients</div>
                            </div>

                            <div className="card-light p-6 text-center space-y-3">
                                <CheckCircle className="w-10 h-10 mx-auto text-[#001A05] text-[#001A05]" />
                                <div className="text-4xl font-bold text-[#001A05] text-[#001A05]">{stats.doctors.totalVerified}</div>
                                <div className="text-sm text-[#001A05]/80 text-[#001A05]/80">Verified Doctors</div>
                            </div>

                            <div className="card-light p-6 text-center space-y-3">
                                <Shield className="w-10 h-10 mx-auto text-[#001A05] text-[#001A05]" />
                                <div className="text-4xl font-bold text-[#001A05] text-[#001A05]">{stats.accessControl.totalApprovals}</div>
                                <div className="text-sm text-[#001A05]/80 text-[#001A05]/80">Access Approvals</div>
                            </div>
                        </div>
                    )}

                    {/* Verify Doctor Form - Opella Card */}
                    {showVerifyForm && (
                        <div className="card-light p-8 space-y-6">
                            <h2 className="text-2xl font-bold text-[#001A05] text-[#001A05]">
                                Verify New Doctor
                            </h2>
                            <div className="space-y-4">
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
                                    className="btn bg-[#042B0B] text-[#F7EFE6] border-[#F7EFE6] hover:bg-[#042B0B]/90 w-full"
                                >
                                    {verifyingDoctor ? 'Verifying...' : 'Verify Doctor'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Verified Doctors List - Opella Card */}
                    <div className="card-light p-8 space-y-6">
                        <h2 className="text-2xl font-bold text-[#001A05] text-[#001A05]">
                            Verified Doctors ({doctors.length})
                        </h2>
                        <div>
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
                                                    <p className="font-mono text-sm text-gray-900 text-[#001A05]">
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
                                                className="btn btn-sm bg-[#042B0B] text-[#F7EFE6] border-[#F7EFE6] hover:bg-[#042B0B]/90"
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
            </div>
        </div>
    );
}
