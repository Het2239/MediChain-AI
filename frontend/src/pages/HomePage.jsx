import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Shield, FileText, Users, Lock, Zap, Globe } from 'lucide-react';

export default function HomePage() {
    const { isConnected } = useAccount();

    const features = [
        {
            icon: Shield,
            title: 'End-to-End Encryption',
            description: 'AES-256-CBC encryption ensures your medical records remain completely private and secure.'
        },
        {
            icon: Lock,
            title: 'Blockchain Access Control',
            description: 'Immutable audit trail on Ethereum. You control exactly who can access your medical data.'
        },
        {
            icon: FileText,
            title: 'Decentralized Storage',
            description: 'Files stored on IPFS with Pinata pinning for permanent, censorship-resistant availability.'
        },
        {
            icon: Users,
            title: 'Doctor Verification',
            description: 'Admin-verified healthcare providers ensure only legitimate doctors request access.'
        },
        {
            icon: Zap,
            title: 'AI-Powered Insights',
            description: 'RAG-based summarization helps doctors quickly understand your medical history.'
        },
        {
            icon: Globe,
            title: 'Portable Records',
            description: 'Your health data travels with you. Access from anywhere, share with any provider.'
        }
    ];

    const stats = [
        { label: 'Encrypted Records', value: '100%' },
        { label: 'Uptime', value: '99.9%' },
        { label: 'Avg. Upload Time', value: '<2s' },
        { label: 'Security Audits', value: '3' }
    ];

    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="text-center space-y-6">
                <div className="inline-block">
                    <span className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium">
                        🏥 Privacy-Preserving Healthcare
                    </span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
                    Your Health Records,
                    <br />
                    <span className="text-gradient">Truly Yours</span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    MediChain AI combines blockchain, encryption, and decentralized storage
                    to give you complete control over your medical data.
                </p>

                {/* CTA Buttons */}
                <div className="flex justify-center space-x-4 pt-4">
                    {isConnected ? (
                        <>
                            <Link to="/patient" className="btn btn-primary">
                                Patient Dashboard
                            </Link>
                            <Link to="/doctor" className="btn btn-outline">
                                Doctor Dashboard
                            </Link>
                        </>
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Connect your wallet to get started
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="stat-card text-center">
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </section>

            {/* Features Grid */}
            <section className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Built for Privacy & Security
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Enterprise-grade security meets user-friendly design
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <div key={feature.title} className="card p-6 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                                <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="card p-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
                    How It Works
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl">
                            1
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Upload & Encrypt
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Upload your medical records. Files are encrypted client-side before leaving your device.
                        </p>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-700 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl">
                            2
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Store on IPFS
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Encrypted files are stored on IPFS for decentralized, permanent storage.
                        </p>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-700 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl">
                            3
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Control Access
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage doctor access via smart contracts. Grant or revoke permissions anytime.
                        </p>
                    </div>
                </div>
            </section>

            {/* Technology Stack */}
            <section className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 text-white">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold">
                        Powered by Cutting-Edge Technology
                    </h2>
                    <p className="text-primary-100 max-w-2xl mx-auto">
                        Built on Ethereum, IPFS, and modern web3 infrastructure
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 pt-6">
                        {['Ethereum', 'IPFS', 'Solidity', 'React', 'TailwindCSS', 'OpenZeppelin'].map((tech) => (
                            <span key={tech} className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm font-medium">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
