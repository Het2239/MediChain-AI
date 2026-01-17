import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Activity, FileText, Users, Shield, Home } from 'lucide-react';

export default function MainLayout() {
    const location = useLocation();
    const { address, isConnected } = useAccount();

    const navigation = [
        { name: 'Home', href: '/', icon: Home, public: true },
        { name: 'Patient Dashboard', href: '/patient', icon: FileText, role: 'patient' },
        { name: 'Doctor Dashboard', href: '/doctor', icon: Users, role: 'doctor' },
        { name: 'Admin Panel', href: '/admin', icon: Shield, role: 'admin' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gradient">
                                MediChain AI
                            </span>
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden md:flex space-x-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname.startsWith(item.href) && item.href !== '/'
                                    || (item.href === '/' && location.pathname === '/');

                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${isActive
                                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Wallet Connection */}
                        <div className="flex items-center space-x-4">
                            <ConnectButton />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            © 2026 MediChain AI. Privacy-preserving healthcare records.
                        </p>
                        <div className="flex space-x-6">
                            <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                                Terms of Service
                            </a>
                            <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                                Documentation
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
