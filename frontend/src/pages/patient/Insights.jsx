import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Brain, RefreshCw, Upload, FileText, TrendingUp, AlertTriangle, Clock, Activity } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Insights() {
    const { address } = useAccount();
    const [records, setRecords] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generatedAt, setGeneratedAt] = useState(null);
    const [filesAnalyzed, setFilesAnalyzed] = useState(0);

    useEffect(() => {
        if (address) {
            fetchRecords();
        }
    }, [address]);

    const fetchRecords = async () => {
        try {
            const response = await axios.get(`${API_URL}/patient/records`, {
                headers: { 'X-Wallet-Address': address }
            });
            setRecords(response.data.records || []);
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    };

    const handleGenerateInsights = async () => {
        if (records.length === 0) {
            toast.error('No medical records found. Upload some files first!');
            return;
        }

        setLoading(true);
        try {
            // Process files
            const filesData = [];
            for (const record of records) {
                try {
                    const response = await axios.post(
                        `${API_URL}/file/download/${record.cid}`,
                        { patientAddress: address },
                        { headers: { 'X-Wallet-Address': address }, responseType: 'blob' }
                    );

                    const blob = response.data;
                    const base64 = await blobToBase64(blob);

                    const extractResponse = await axios.post(
                        `${API_URL}/insights/extract-text`,
                        {
                            fileBuffer: base64.split(',')[1],
                            fileType: record.fileType,
                            mimeType: blob.type
                        },
                        { headers: { 'X-Wallet-Address': address } }
                    );

                    if (extractResponse.data.text) {
                        filesData.push({
                            cid: record.cid,
                            content: extractResponse.data.text,
                            category: record.category,
                            timestamp: record.timestamp,
                            fileType: record.fileType,
                            filename: record.fileName || `medical-record-${record.cid.substring(0, 10)}`
                        });
                    }
                } catch (error) {
                    console.error(`Error processing file ${record.cid}:`, error);
                }
            }

            if (filesData.length === 0) {
                toast.error('No text could be extracted from files');
                setLoading(false);
                return;
            }

            // Generate dashboard with userRole
            const insightsResponse = await axios.post(
                `${API_URL}/insights/generate`,
                {
                    patientAddress: address,
                    files: filesData,
                    userRole: 'patient'  // NEW: Specify patient dashboard
                },
                { headers: { 'X-Wallet-Address': address } }
            );

            setDashboard(insightsResponse.data.dashboard);
            setGeneratedAt(insightsResponse.data.generatedAt);
            setFilesAnalyzed(insightsResponse.data.filesAnalyzed);
            toast.success('Health insights generated successfully!');

        } catch (error) {
            console.error('Insights generation error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate insights');
        } finally {
            setLoading(false);
        }
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const getTrendIcon = (trend) => {
        switch (trend?.toLowerCase()) {
            case 'improving': return <span className="text-green-600">✅</span>;
            case 'stable': return <span className="text-blue-600">➖</span>;
            case 'needs attention':
            case 'worsening':
            case 'increasing': return <span className="text-amber-600">⚠️</span>;
            case 'decreasing': return <span className="text-green-600">⬇️</span>;
            default: return <span className="text-gray-400">•</span>;
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="spinner w-16 h-16"></div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Analyzing Your Health Records
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-center">
                            Our AI is reviewing your medical history...<br />
                            This may take a minute
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                    <Brain className="w-20 h-20 text-indigo-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        AI Health Insights
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                        Get personalized AI-powered analysis of your health progress, understand what's changed since your last visit,
                        and discover long-term trends in your medical history.
                    </p>

                    {records.length > 0 ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md mx-auto">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    {records.length} medical record{records.length !== 1 ? 's' : ''} ready for analysis
                                </p>
                            </div>
                            <button
                                onClick={handleGenerateInsights}
                                className="btn btn-primary inline-flex items-center space-x-2"
                            >
                                <Brain className="w-5 h-5" />
                                <span>Generate Health Insights</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 max-w-md mx-auto">
                                <p className="text-sm text-amber-800 dark:text-amber-300">
                                    <Upload className="w-4 h-4 inline mr-2" />
                                    No medical records found. Upload some files first!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Brain className="w-8 h-8 text-indigo-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Your Health Insights
                            </h1>
                            {generatedAt && (
                                <p className="text-sm text-gray-500">
                                    Analyzed {filesAnalyzed} file{filesAnalyzed !== 1 ? 's' : ''} •
                                    Updated {new Date(generatedAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateInsights}
                        disabled={loading}
                        className="btn btn-secondary inline-flex items-center space-x-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Health Progress Summary */}
            {dashboard.healthProgressSummary && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow p-6 mb-6">
                    <div className="flex items-start space-x-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Health Progress Summary
                            </h3>
                            <div className="space-y-2 mb-4">
                                {dashboard.healthProgressSummary.points.map((point, idx) => (
                                    <p key={idx} className="text-gray-700 dark:text-gray-300 flex items-start">
                                        <span className="text-blue-600 mr-2 mt-1">•</span>
                                        <span>{point}</span>
                                    </p>
                                ))}
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    Overall Trend:
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${dashboard.healthProgressSummary.overallTrend === 'Improving' ? 'bg-green-100 text-green-800' :
                                        dashboard.healthProgressSummary.overallTrend === 'Stable' ? 'bg-blue-100 text-blue-800' :
                                            dashboard.healthProgressSummary.overallTrend === 'Needs Attention' ? 'bg-amber-100 text-amber-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {getTrendIcon(dashboard.healthProgressSummary.overallTrend)} {dashboard.healthProgressSummary.overallTrend}
                                </span>
                            </div>
                            {dashboard.healthProgressSummary.citedReports?.length > 0 && (
                                <details className="mt-4">
                                    <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800">
                                        Based on {dashboard.healthProgressSummary.citedReports.length} report{dashboard.healthProgressSummary.citedReports.length !== 1 ? 's' : ''}
                                    </summary>
                                    <ul className="mt-2 ml-4 text-sm text-gray-500 space-y-1">
                                        {dashboard.healthProgressSummary.citedReports.map((report, idx) => (
                                            <li key={idx}>• {report}</li>
                                        ))}
                                    </ul>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* What Changed Since Last Time */}
            {dashboard.whatChangedSinceLastTime && dashboard.whatChangedSinceLastTime.changes?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <div className="flex items-start space-x-3">
                        <Clock className="w-6 h-6 text-purple-600 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                What Changed Since Last Time?
                            </h3>
                            <div className="space-y-3">
                                {dashboard.whatChangedSinceLastTime.changes.map((change, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                        <p className="text-gray-700 dark:text-gray-300">{change}</p>
                                    </div>
                                ))}
                            </div>
                            {dashboard.whatChangedSinceLastTime.comparedReports?.length > 0 && (
                                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Compared Reports:</strong>
                                    <ul className="ml-4 mt-1 space-y-1">
                                        {dashboard.whatChangedSinceLastTime.comparedReports.map((report, idx) => (
                                            <li key={idx}>• {report}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Long-Term Health Trends */}
            {dashboard.longTermTrends && dashboard.longTermTrends.conditions?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <div className="flex items-start space-x-3">
                        <Activity className="w-6 h-6 text-indigo-600 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Long-Term Health Trends
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dashboard.longTermTrends.conditions.map((condition, idx) => (
                                    <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {condition.name}
                                            </h4>
                                            <span className="text-2xl">
                                                {getTrendIcon(condition.trend)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {condition.description}
                                        </p>
                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${condition.confidence === 'high' ? 'bg-green-100 text-green-800' :
                                                condition.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {condition.trend} • {condition.confidence} confidence
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* What You May Want to Pay Attention To */}
            {dashboard.attentionPoints && dashboard.attentionPoints.observations?.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg shadow p-6 mb-6">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-6 h-6 text-amber-600 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                What You May Want to Pay Attention To
                            </h3>
                            <div className="space-y-3">
                                {dashboard.attentionPoints.observations.map((observation, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-amber-500">
                                        <p className="text-gray-700 dark:text-gray-300">{observation}</p>
                                    </div>
                                ))}
                            </div>
                            {dashboard.attentionPoints.references?.length > 0 && (
                                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Referenced Reports:</strong>
                                    <ul className="ml-4 mt-1 space-y-1">
                                        {dashboard.attentionPoints.references.map((ref, idx) => (
                                            <li key={idx}>• {ref}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Records Summary */}
            {dashboard.recordsSummary && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <span><strong>Total Records:</strong> {dashboard.recordsSummary.totalRecords}</span>
                        <span><strong>Date Range:</strong> {dashboard.recordsSummary.dateRange}</span>
                        {dashboard.recordsSummary.categories?.length > 0 && (
                            <span><strong>Categories:</strong> {dashboard.recordsSummary.categories.join(', ')}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
