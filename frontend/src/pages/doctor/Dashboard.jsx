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
            <div className="section section-light min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Activity className="w-20 h-20 text-[#001A05]/30 text-[#001A05]/30 mx-auto" />
                    <h2 className="text-3xl font-bold text-[#001A05] text-[#001A05]">
                        Wallet Not Connected
                    </h2>
                    <p className="text-[#001A05]/80 text-[#001A05]/80">
                        Please connect your wallet to access the doctor dashboard
                    </p>
                </div>
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

    if (!isVerified) {
        return (
            <div className="section section-light min-h-[60vh] flex items-center justify-center">
                <div className="card-light p-12 max-w-2xl text-center space-y-6">
                    <Users className="w-20 h-20 text-[#001A05] text-[#001A05] mx-auto" />
                    <h2 className="text-3xl font-bold text-[#001A05] text-[#001A05]">
                        Doctor Verification Required
                    </h2>
                    <p className="text-xl text-[#001A05]/80 text-[#001A05]/80">
                        Your account is not yet verified. Please contact the system administrator
                        to verify your medical license and gain access to the doctor dashboard.
                    </p>
                    <div className="bg-opella-dark/5 dark:bg-opella-light/5 rounded-lg p-6 text-left border border-opella-dark/20 dark:border-opella-light/20">
                        <p className="text-sm text-[#001A05]/80 text-[#001A05]/80">
                            <strong>Your Wallet:</strong>
                        </p>
                        <p className="font-mono text-sm text-[#001A05] text-[#001A05] mt-2 break-all">
                            {address}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const statsCards = [
        { label: 'Authorized Patients', value: stats.authorizedPatients, icon: Users },
        { label: 'Total Requests', value: stats.totalRequests, icon: FileText },
        { label: 'Pending Requests', value: stats.pendingRequests, icon: TrendingUp },
    ];

    return (
        <div className="w-full">
            <div className="section section-light">
                <div className="container-opella space-y-12">
                    {/* Page Header - Opella Bold */}
                    <div className="text-center md:text-left">
                        <h1 className="heading-opella text-4xl md:text-5xl font-bold text-[#001A05] text-[#001A05]">
                            Doctor Dashboard
                        </h1>
                        <p className="mt-4 text-xl text-[#001A05]/80 text-[#001A05]/80">
                            Welcome back, Dr. {doctorInfo?.specialty || 'Professional'}
                        </p>
                    </div>

                    {/* Doctor Info - Opella Card */}
                    {doctorInfo && (
                        <div className="card-light p-8">
                            <div className="flex items-center space-x-6">
                                <div className="w-20 h-20 bg-[#042B0B]/5 rounded-full flex items-center justify-center flex-shrink-0 border border-[#042B0B]/10">
                                    <Users className="w-10 h-10 text-[#001A05]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#001A05] text-[#001A05] mb-1">
                                        License: {doctorInfo.licenseNumber}
                                    </h3>
                                    <p className="text-[#001A05]/80 text-[#001A05]/80">
                                        Specialty: {doctorInfo.specialty || 'General Practice'}
                                    </p>
                                    <p className="text-sm text-[#001A05]/70 text-[#001A05]/70 mt-2">
                                        Verified {new Date(doctorInfo.verifiedAtDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid - Opella Clean Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {statsCards.map((stat) => (
                            <div key={stat.label} className="card-light p-6 text-center space-y-3 hover:border-opella-dark/30 dark:hover:border-opella-light/30 transition-all">
                                <stat.icon className="w-10 h-10 mx-auto text-[#001A05] text-[#001A05]" />
                                <div className="text-4xl font-bold text-[#001A05] text-[#001A05]">{stat.value}</div>
                                <div className="text-sm text-[#001A05]/80 text-[#001A05]/80">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions - Opella Button Cards */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#001A05] text-[#001A05]">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link
                                to="/doctor/patients"
                                className="card-light p-8 space-y-4 hover:border-opella-dark/40 dark:hover:border-opella-light/40 transition-all group"
                            >
                                <Users className="w-12 h-12 text-[#001A05] text-[#001A05] group-hover:scale-110 transition-transform" />
                                <div>
                                    <h3 className="text-xl font-bold text-[#001A05] text-[#001A05] mb-2">
                                        View Patients
                                    </h3>
                                    <p className="text-[#001A05]/80 text-[#001A05]/80">
                                        Access authorized patient records and request new access
                                    </p>
                                </div>
                            </Link>

                            <Link
                                to="/doctor/patients"
                                className="card-light p-8 space-y-4 hover:border-opella-dark/40 dark:hover:border-opella-light/40 transition-all group"
                            >
                                <FileText className="w-12 h-12 text-[#001A05] text-[#001A05] group-hover:scale-110 transition-transform" />
                                <div>
                                    <h3 className="text-xl font-bold text-[#001A05] text-[#001A05] mb-2">
                                        Request Access
                                    </h3>
                                    <p className="text-[#001A05]/80 text-[#001A05]/80">
                                        Submit access requests to view patient medical records
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
