import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Shield, FileText, Users, Lock, Zap, Globe, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useScrollReveal } from '../utils/scrollReveal';

export default function HomePage() {
    const { isConnected } = useAccount();
    useScrollReveal();

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
        <div className="w-full">
            {/* Hero Section - Dark gradient for transparent header */}
            <section className="relative min-h-screen flex items-center">
                {/* Dark gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-opella-dark via-opella-dark/80 to-opella-light z-0"></div>

                {/* Content */}
                <div className="relative z-10 container-opella text-center space-y-8 py-32">
                    <div className="inline-block reveal">
                        <span className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-normal border border-white/20">
                            🏥 Privacy-Preserving Healthcare
                        </span>
                    </div>

                    <h1 className="reveal heading-opella text-5xl md:text-7xl font-bold text-white max-w-4xl mx-auto leading-tight">
                        Your Health Records,
                        <br />
                        Truly Yours
                    </h1>

                    <p className="reveal text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-normal">
                        MediChain AI combines blockchain, encryption, and decentralized storage
                        to give you complete control over your medical data.
                    </p>

                    {/* CTA Buttons */}
                    <div className="reveal flex flex-col sm:flex-row justify-center gap-4 pt-8">
                        {isConnected ? (
                            <>
                                <Link to="/patient" className="btn btn-light group">
                                    <span>Patient Dashboard</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/doctor" className="btn btn-light group">
                                    <span>Doctor Dashboard</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </>
                        ) : (
                            <div className="text-center">
                                <p className="text-white/80">
                                    Connect your wallet to get started
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Stats - Dark Section */}
            <section className="section section-dark">
                <div className="container-opella">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {stats.map((stat, index) => (
                            <div key={stat.label} className="reveal text-center space-y-2" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="text-5xl md:text-6xl font-bold text-opella-light">
                                    {stat.value}
                                </div>
                                <div className="text-sm md:text-base text-opella-light/70 font-normal">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features - Light Section */}
            <section className="section section-light">
                <div className="container-opella space-y-16">
                    <div className="reveal text-center max-w-3xl mx-auto">
                        <h2 className="heading-opella text-4xl md:text-5xl font-bold text-opella-dark dark:text-opella-light mb-6">
                            Built for Privacy & Security
                        </h2>
                        <p className="text-xl text-opella-dark/70 dark:text-opella-light/70">
                            Enterprise-grade security meets user-friendly design
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="reveal card-light p-8 space-y-4 hover:border-opella-dark/30 dark:hover:border-opella-light/30 transition-all"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="w-12 h-12 bg-opella-dark dark:bg-opella-light rounded-[4px] flex items-center justify-center">
                                    <feature.icon className="w-6 h-6 text-opella-light dark:text-opella-dark" />
                                </div>
                                <h3 className="text-xl font-bold text-opella-dark dark:text-opella-light">
                                    {feature.title}
                                </h3>
                                <p className="text-opella-dark/70 dark:text-opella-light/70 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works - Dark Section */}
            <section className="section section-dark">
                <div className="container-opella space-y-16">
                    <h2 className="reveal heading-opella text-4xl md:text-5xl font-bold text-opella-light text-center">
                        How It Works
                    </h2>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                step: '1',
                                title: 'Upload & Encrypt',
                                description: 'Upload your medical records. Files are encrypted client-side before leaving your device.'
                            },
                            {
                                step: '2',
                                title: 'Store on IPFS',
                                description: 'Encrypted files are stored on IPFS for decentralized, permanent storage.'
                            },
                            {
                                step: '3',
                                title: 'Control Access',
                                description: 'Manage doctor access via smart contracts. Grant or revoke permissions anytime.'
                            }
                        ].map((item, index) => (
                            <div key={item.step} className="reveal text-center space-y-6" style={{ animationDelay: `${index * 0.15}s` }}>
                                <div className="w-20 h-20 border-2 border-opella-light/30 rounded-full flex items-center justify-center mx-auto">
                                    <span className="text-4xl font-bold text-opella-light">{item.step}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-opella-light">
                                    {item.title}
                                </h3>
                                <p className="text-opella-light/70 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Stack - Light Section */}
            <section className="section section-light">
                <div className="container-opella">
                    <div className="reveal text-center space-y-8">
                        <h2 className="heading-opella text-4xl md:text-5xl font-bold text-opella-dark dark:text-opella-light">
                            Powered by Cutting-Edge Technology
                        </h2>
                        <p className="text-xl text-opella-dark/70 dark:text-opella-light/70 max-w-2xl mx-auto">
                            Built on Ethereum, IPFS,and modern web3 infrastructure
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 pt-8">
                            {['Ethereum', 'IPFS', 'Solidity', 'React', 'TailwindCSS', 'OpenZeppelin'].map((tech, index) => (
                                <span
                                    key={tech}
                                    className="px-6 py-3 bg-opella-dark/5 dark:bg-opella-light/5 border border-opella-dark/20 dark:border-opella-light/20 rounded-[4px] font-normal text-opella-dark dark:text-opella-light"
                                    style={{
                                        animation: 'fadeInUp 0.6s ease-out forwards',
                                        animationDelay: `${index * 0.1}s`,
                                        opacity: 0
                                    }}
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA - Dark Section */}
            <section className="section section-dark">
                <div className="container-opella text-center space-y-8 py-20">
                    <h2 className="reveal heading-opella text-4xl md:text-6xl font-bold text-opella-light max-w-4xl mx-auto">
                        Ready to take control of your health data?
                    </h2>
                    {!isConnected && (
                        <p className="reveal text-xl text-opella-light/70">
                            Connect your wallet to get started
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}
