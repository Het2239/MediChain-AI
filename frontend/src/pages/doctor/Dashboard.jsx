import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { Users, FileText, Activity, TrendingUp } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function DoctorDashboard() {
    const { address, isConnected } = useAccount();
    const [isVerified, setIsVerified] = useState(false);
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        authorizedPatients: 0,
        totalRequests: 0,
        pendingRequests: 0
    });

    useEffect(() => {
        if (isConnected && address) {
            checkVerification();
        }
    }, [isConnected, address]);

    useEffect(() => {
        if (isVerified && address) {
            loadStats();
        }
    }, [isVerified, address]);

    const checkVerification = async () => {
        try {
            const normalizedAddress = address.toLowerCase();
            const res = await axios.get(`${API_URL}/doctor/status`, {
                headers: { 'X-Wallet-Address': normalizedAddress }
            });
            setIsVerified(res.data.isVerified);
            if (res.data.isVerified) {
                setDoctorInfo(res.data);
            }
        } catch (error) {
            console.error('Failed to check verification:', error);
            setIsVerified(false);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const normalizedAddress = address.toLowerCase();
            const [patients, requests] = await Promise.all([
                axios.get(`${API_URL}/doctor/authorized-patients`, {
                    headers: { 'X-Wallet-Address': normalizedAddress }
                }),
                axios.get(`${API_URL}/doctor/my-requests`, {
                    headers: { 'X-Wallet-Address': normalizedAddress }
                })
            ]);

            const pending = requests.data.requests?.filter(r => !r.approved && r.active).length || 0;

            setStats({
                authorizedPatients: patients.data.count || 0,
                totalRequests: requests.data.count || 0,
                pendingRequests: pending
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    if (!isConnected) {
        return (
            <div className="text-center py-16">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Wallet Not Connected
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Please connect your wallet to access the doctor dashboard
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

    if (!isVerified) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <div className="card p-8">
                    <Users className="w-16 h-16 text-warning-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Doctor Verification Required
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Your account is not yet verified. Please contact the system administrator
                        to verify your medical license and gain access to the doctor dashboard.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-left">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Your Wallet:</strong>
                        </p>
                        <p className="font-mono text-sm text-gray-900 dark:text-white mt-1">
                            {address}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const statsCards = [
        { label: 'Authorized Patients', value: stats.authorizedPatients, icon: Users, color: 'primary' },
        { label: 'Total Requests', value: stats.totalRequests, icon: FileText, color: 'accent' },
        { label: 'Pending Requests', value: stats.pendingRequests, icon: TrendingUp, color: 'warning' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Doctor Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Welcome back, Dr. {doctorInfo?.specialty || 'Professional'}
                </p>
            </div>

            {/* Doctor Info */}
            {doctorInfo && (
                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                <Users className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    License: {doctorInfo.licenseNumber}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Specialty: {doctorInfo.specialty || 'General Practice'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Verified {new Date(doctorInfo.verifiedAtDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statsCards.map((stat) => (
                    <div key={stat.label} className="stat-card">
                        <stat.icon className={`w-8 h-8 text-${stat.color}-600 mb-2`} />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link
                            to="/doctor/patients"
                            className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:shadow-md transition-all group"
                        >
                            <Users className="w-8 h-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
                                View Patients
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Access authorized patient records and request new access
                            </p>
                        </Link>

                        <Link
                            to="/doctor/patients"
                            className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-accent-500 hover:shadow-md transition-all group"
                        >
                            <FileText className="w-8 h-8 text-accent-600 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-accent-600">
                                Request Access
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Submit access requests to view patient medical records
                            </p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
