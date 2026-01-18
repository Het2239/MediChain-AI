import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { FileText, Users, Shield, Activity, Upload, TrendingUp, Brain } from 'lucide-react';
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
                <h2 className="text-2xl font-bold text-gray-900 text-[#001A05] mb-2">
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
            <div className="section section-light min-h-[60vh] flex items-center justify-center">
                <div className="spinner w-16 h-16"></div>
            </div>
        );
    }

    if (!isRegistered) {
        return (
            <div className="section section-light min-h-[60vh] flex items-center justify-center">
                <div className="card-light p-12 max-w-2xl text-center space-y-6">
                    <Activity className="w-20 h-20 text-opella-dark dark:text-opella-light mx-auto" />
                    <h2 className="text-3xl font-bold text-opella-dark dark:text-opella-light">
                        Register as Patient
                    </h2>
                    <p className="text-xl text-opella-dark/70 dark:text-opella-light/70">
                        Register your wallet address to start managing your medical records on the blockchain.
                    </p>
                    <button
                        onClick={registerPatient}
                        disabled={loading}
                        className="btn btn-dark dark:btn-light"
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
        { name: 'AI Insights', href: '/patient/insights', icon: Brain, color: 'indigo' },
        { name: 'Manage Access', href: '/patient/access-control', icon: Users, color: 'success' },
    ];

    const statsCards = [
        { label: 'Total Records', value: stats.totalRecords, icon: FileText, color: 'primary' },
        { label: 'Storage Used', value: `${stats.totalStorageMB} MB`, icon: TrendingUp, color: 'accent' },
        { label: 'Authorized Doctors', value: stats.authorizedDoctors, icon: Users, color: 'success' },
        { label: 'Pending Requests', value: stats.pendingRequests, icon: Shield, color: 'warning' },
    ];

    return (
        <div className="w-full">
            <div className="section section-light">
                <div className="container-opella space-y-12">
                    {/* Page Header - Opella Bold */}
                    <div className="text-center md:text-left">
                        <h1 className="heading-opella text-3xl md:text-4xl font-bold text-[#001A05] text-[#001A05]">
                            Patient Dashboard
                        </h1>
                        <p className="mt-4 text-lg text-[#001A05]/90 text-[#001A05]/90">
                            Manage your medical records and control access
                        </p>
                    </div>

                    {/* Stats Grid - Opella Clean Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {statsCards.map((stat) => (
                            <div key={stat.label} className="card-light p-6 text-center space-y-3 hover:border-opella-dark/30 dark:hover:border-opella-light/30 transition-all">
                                <stat.icon className="w-10 h-10 mx-auto text-[#001A05] text-[#001A05]" />
                                {stat.label === 'Pending Requests' && stat.value > 0 && (
                                    <span className="badge badge-warning">{stat.value} new</span>
                                )}
                                <div className="text-3xl font-bold text-[#001A05] text-[#001A05]">{stat.value}</div>
                                <div className="text-sm text-[#001A05]/80 text-[#001A05]/80">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions - Opella Button Cards */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-[#001A05] text-[#001A05]">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.name}
                                    to={action.href}
                                    className="card-light p-6 text-center space-y-3 hover:border-opella-dark/40 dark:hover:border-opella-light/40 transition-all group"
                                >
                                    <action.icon className="w-10 h-10 mx-auto text-[#001A05] text-[#001A05] group-hover:scale-110 transition-transform" />
                                    <h3 className="font-semibold text-base text-[#001A05] text-[#001A05]">
                                        {action.name}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity - Opella Card */}
                    <div className="card-light p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[#001A05] text-[#001A05]">
                                Recent Activity
                            </h2>
                            <Link to="/patient/records" className="btn btn-sm btn-dark dark:btn-light">
                                View All →
                            </Link>
                        </div>
                        {stats.totalRecords === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 mx-auto mb-4 text-[#001A05]/20 text-[#001A05]/20" />
                                <p className="text-[#001A05]/70 text-[#001A05]/70">No records yet. Upload your first medical record to get started.</p>
                            </div>
                        ) : (
                            <p className="text-[#001A05]/80 text-[#001A05]/80 text-lg">
                                You have {stats.totalRecords} medical record{stats.totalRecords !== 1 ? 's' : ''} uploaded.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
