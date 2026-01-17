import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { FileText, Users, Shield, Activity, Upload, TrendingUp } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function PatientDashboard() {
    const { address, isConnected } = useAccount();
    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRecords: 0,
        totalStorageMB: 0,
        authorizedDoctors: 0,
        pendingRequests: 0
    });

    useEffect(() => {
        if (isConnected && address) {
            checkRegistration();
        }
    }, [isConnected, address]);

    useEffect(() => {
        if (isRegistered && address) {
            loadStats();
        }
    }, [isRegistered, address]);

    const checkRegistration = async () => {
        try {
            // Normalize address to lowercase for consistency
            const normalizedAddress = address.toLowerCase();
            const res = await axios.get(`${API_URL}/patient/status`, {
                headers: { 'X-Wallet-Address': normalizedAddress }
            });
            setIsRegistered(res.data.isRegistered);
        } catch (error) {
            console.error('Failed to check registration:', error);
            setIsRegistered(false);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const normalizedAddress = address.toLowerCase();
            const [records, storage, doctors, requests] = await Promise.all([
                axios.get(`${API_URL}/patient/records`, {
                    headers: { 'X-Wallet-Address': normalizedAddress }
                }),
                axios.get(`${API_URL}/patient/storage-stats`, {
                    headers: { 'X-Wallet-Address': normalizedAddress }
                }),
                axios.get(`${API_URL}/patient/authorized-doctors`, {
                    headers: { 'X-Wallet-Address': normalizedAddress }
                }),
                axios.get(`${API_URL}/patient/access-requests/pending`, {
                    headers: { 'X-Wallet-Address': normalizedAddress }
                })
            ]);

            setStats({
                totalRecords: records.data.count || 0,
                totalStorageMB: parseFloat(storage.data.totalStorageMB) || 0,
                authorizedDoctors: doctors.data.count || 0,
                pendingRequests: requests.data.count || 0
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const registerPatient = async () => {
        try {
            setLoading(true);
            const normalizedAddress = address.toLowerCase();
            await axios.post(`${API_URL}/patient/register`, {}, {
                headers: { 'X-Wallet-Address': normalizedAddress }
            });
            toast.success('Successfully registered as patient!');
            setIsRegistered(true);
            // Load stats after successful registration
            setTimeout(() => loadStats(), 500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="text-center py-16">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Wallet Not Connected
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Please connect your wallet to access the patient dashboard
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-16">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    if (!isRegistered) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <div className="card p-8">
                    <Activity className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Register as Patient
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Register your wallet address to start managing your medical records on the blockchain.
                    </p>
                    <button
                        onClick={registerPatient}
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Registering...' : 'Register Now'}
                    </button>
                </div>
            </div>
        );
    }

    const quickActions = [
        { name: 'Upload Records', href: '/patient/records', icon: Upload, color: 'primary' },
        { name: 'View Records', href: '/patient/records', icon: FileText, color: 'accent' },
        { name: 'Manage Access', href: '/patient/access-control', icon: Users, color: 'success' },
    ];

    const statsCards = [
        { label: 'Total Records', value: stats.totalRecords, icon: FileText, color: 'primary' },
        { label: 'Storage Used', value: `${stats.totalStorageMB} MB`, icon: TrendingUp, color: 'accent' },
        { label: 'Authorized Doctors', value: stats.authorizedDoctors, icon: Users, color: 'success' },
        { label: 'Pending Requests', value: stats.pendingRequests, icon: Shield, color: 'warning' },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Patient Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Manage your medical records and control access
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat) => (
                    <div key={stat.label} className="stat-card">
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={`w-8 h-8 text-${stat.color}-600 `} />
                            {stat.label === 'Pending Requests' && stat.value > 0 && (
                                <span className="badge badge-warning">{stat.value} new</span>
                            )}
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="card">
                <div className="card-header">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Quick Actions
                    </h2>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickActions.map((action) => (
                            <Link
                                key={action.name}
                                to={action.href}
                                className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:shadow-md transition-all group"
                            >
                                <action.icon className={`w-8 h-8 text-${action.color}-600 mb-3 group-hover:scale-110 transition-transform`} />
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
                                    {action.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <div className="card-header flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Recent Activity
                    </h2>
                    <Link to="/patient/records" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View All →
                    </Link>
                </div>
                <div className="card-body">
                    {stats.totalRecords === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No records yet. Upload your first medical record to get started.</p>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">
                            You have {stats.totalRecords} medical record{stats.totalRecords !== 1 ? 's' : ''} uploaded.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
