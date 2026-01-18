import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Activity, FileText, Users, Shield, Home } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MainLayout() {
    const location = useLocation();
    const { address, isConnected } = useAccount();
    const [isScrolled, setIsScrolled] = useState(false);

    // Detect scroll for header animation
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigation = [
        { name: 'Home', href: '/', icon: Home, public: true },
        { name: 'Patient Dashboard', href: '/patient', icon: FileText, role: 'patient' },
        { name: 'Doctor Dashboard', href: '/doctor', icon: Users, role: 'doctor' },
        { name: 'Admin Panel', href: '/admin', icon: Shield, role: 'admin' },
    ];

    return (
        <div className="min-h-screen bg-opella-light dark:bg-opella-dark transition-colors duration-300">
            {/* Header - Transparent at top, dark when scrolled */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-opella-dark backdrop-blur-sm border-b border-opella-light/20 shadow-md'
                : 'bg-transparent border-b border-white/10'
                }`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className={`w-12 h-12 rounded-[4px] flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${isScrolled ? 'bg-opella-light' : 'bg-white'
                                }`}>
                                <Activity className="w-7 h-7 text-opella-dark" />
                            </div>
                            <span className={`text-xl font-bold transition-colors duration-300 ${isScrolled ? 'text-opella-light' : 'text-white'
                                }`}>
                                MediChain<span className={isScrolled ? 'text-opella-light/70' : 'text-white/70'}>.</span>
                            </span>
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden md:flex space-x-2">
                            {navigation.map((item) => {
                                const isActive = location.pathname.startsWith(item.href) && item.href !== '/'
                                    || (item.href === '/' && location.pathname === '/');

                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`px-4 py-2 flex items-center space-x-2 font-normal transition-all duration-300 ${isScrolled
                                            ? (isActive ? 'text-opella-light font-medium' : 'text-opella-light/80 hover:text-opella-light')
                                            : (isActive ? 'text-white font-medium' : 'text-white/90 hover:text-white')
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.name}</span>
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
            </header >

            {/* Main Content - Full width sections */}
            < main className="min-h-[calc(100vh-8rem)]" >
                <Outlet />
            </main >

            {/* Footer - Opella Clean Style */}
            < footer className="bg-opella-dark dark:bg-opella-light border-t border-opella-light/10 dark:border-opella-dark/10" >
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-opella-light/70 dark:text-opella-dark/70">
                            © 2026 MediChain AI. Privacy-preserving healthcare records.
                        </p>
                        <div className="flex space-x-8">
                            <a
                                href="#"
                                className="text-sm text-opella-light/70 dark:text-opella-dark/70 hover:text-opella-light dark:hover:text-opella-dark transition-colors duration-300"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="#"
                                className="text-sm text-opella-light/70 dark:text-opella-dark/70 hover:text-opella-light dark:hover:text-opella-dark transition-colors duration-300"
                            >
                                Terms of Service
                            </a>
                            <a
                                href="#"
                                className="text-sm text-opella-light/70 dark:text-opella-dark/70 hover:text-opella-light dark:hover:text-opella-dark transition-colors duration-300"
                            >
                                Documentation
                            </a>
                        </div>
                    </div>
                </div>
            </footer >
        </div >
    );
}
