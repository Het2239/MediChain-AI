import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Brain, RefreshCw, Activity, FileText, ArrowLeft, Clock, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function DoctorPatientInsights() {
    const { patientAddress } = useParams();
    const navigate = useNavigate();
    const { address } = useAccount();
    const [records, setRecords] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generatedAt, setGeneratedAt] = useState(null);
    const [filesAnalyzed, setFilesAnalyzed] = useState(0);

    useEffect(() => {
        if (address && patientAddress) {
            fetchRecords();
        }
    }, [address, patientAddress]);

    const fetchRecords = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/doctor/patient/${patientAddress}/records`,
                { headers: { 'X-Wallet-Address': address.toLowerCase() } }
            );
            setRecords(response.data.records || []);
        } catch (error) {
            console.error('Error fetching records:', error);
            toast.error('Failed to load patient records');
        }
    };

    const handleGenerateInsights = async () => {
        if (records.length === 0) {
            toast.error('No medical records found for this patient');
            return;
        }

        setLoading(true);
        try {
            const filesData = [];
            for (const record of records) {
                try {
                    const response = await axios.post(
                        `${API_URL}/file/download/${record.cid}`,
                        { patientAddress },
                        {
                            headers: { 'X-Wallet-Address': address.toLowerCase() },
                            responseType: 'blob'
                        }
                    );

                    const blob = response.data;
                    const base64 = await blobToBase64(blob);

                    const extractResponse = await axios.post(
                        `${API_URL}/insights/extract-text`,
                        {
                            fileBuffer: base64.split(',')[1],
                            fileType: record.fileType || record.metadata?.fileType || 'pdf',
                            mimeType: blob.type
                        },
                        { headers: { 'X-Wallet-Address': address.toLowerCase() } }
                    );

                    if (extractResponse.data.text) {
                        filesData.push({
                            cid: record.cid,
                            content: extractResponse.data.text,
                            category: record.category,
                            timestamp: record.uploadTimestamp || record.timestamp,
                            fileType: record.fileType || record.metadata?.fileType || 'pdf',
                            filename: record.metadata?.filename || `medical-record-${record.cid.substring(0, 10)}`
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

            // Generate doctor dashboard
            const insightsResponse = await axios.post(
                `${API_URL}/insights/generate`,
                {
                    patientAddress,
                    files: filesData,
                    userRole: 'doctor'  // Specify doctor dashboard
                },
                { headers: { 'X-Wallet-Address': address.toLowerCase() } }
            );

            setDashboard(insightsResponse.data.dashboard);
            setGeneratedAt(insightsResponse.data.generatedAt);
            setFilesAnalyzed(insightsResponse.data.filesAnalyzed);
            toast.success('Clinical insights generated successfully!');

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
            case 'improving': return '✅';
            case 'stable': return '➖';
            case 'worsening': return '⚠️';
            case 'insufficient_data': return '❓';
            default: return '•';
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="spinner w-16 h-16"></div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Analyzing Patient Medical Records
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-center">
                            Generating clinical dashboard...<br />
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
                <div className="mb-6 flex items-center space-x-4">
                    <button
                        onClick={() => navigate(`/doctor/patient/${patientAddress}/records`)}
                        className="btn btn-secondary"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Patient Clinical Insights
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mt-1">
                            Patient: {patientAddress}
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                    <Brain className="w-20 h-20 text-indigo-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        AI Clinical Dashboard
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                        Generate comprehensive clinical dashboard with patient overview, condition-specific summaries,
                        longitudinal trends, and evidence-based insights for efficient patient review.
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
                                <span>Generate Clinical Insights</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 max-w-md mx-auto">
                                <p className="text-sm text-amber-800 dark:text-amber-300">
                                    <Activity className="w-4 h-4 inline mr-2" />
                                    No medical records found for this patient
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
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(`/doctor/patient/${patientAddress}/records`)}
                            className="btn btn-secondary"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <Brain className="w-8 h-8 text-indigo-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Clinical Dashboard
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                    Patient: {patientAddress.substring(0, 10)}...{patientAddress.substring(38)}
                                </p>
                                {generatedAt && (
                                    <p className="text-xs text-gray-500">
                                        Analyzed {filesAnalyzed} file{filesAnalyzed !== 1 ? 's' : ''} •
                                        Generated {new Date(generatedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
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

            {/* Patient Overview */}
            {dashboard.patientOverview && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Activity className="w-6 h-6 text-indigo-600 mr-2" />
                        Patient Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Conditions</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {dashboard.patientOverview.activeConditions?.length || 0}
                            </div>
                            {dashboard.patientOverview.activeConditions?.length > 0 && (
                                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                    {dashboard.patientOverview.activeConditions.join(', ')}
                                </div>
                            )}
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">First Record</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {dashboard.patientOverview.firstRecordDate}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Latest Update</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {dashboard.patientOverview.latestUpdateDate}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Records</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {dashboard.patientOverview.recordCount}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Condition Summaries */}
            {dashboard.conditionSummaries && dashboard.conditionSummaries.length > 0 && (
                <div className="space-y-4 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                        Condition-Specific Summaries
                    </h3>
                    {dashboard.conditionSummaries.map((condition, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {condition.condition}
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${condition.trend === 'improving' ? 'bg-green-100 text-green-800' :
                                        condition.trend === 'stable' ? 'bg-blue-100 text-blue-800' :
                                            condition.trend === 'worsening' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {getTrendIcon(condition.trend)} {condition.trend}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Timeline</div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        First detected: {condition.firstDetected}<br />
                                        Latest report: {condition.latestReport}
                                    </div>
                                </div>
                                {condition.keyValues && condition.keyValues.length > 0 && (
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Key Values</div>
                                        <div className="space-y-1">
                                            {condition.keyValues.map((kv, i) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span className="text-gray-700 dark:text-gray-300">{kv.metric}:</span>
                                                    <span className={`font-semibold ${kv.status === 'High' ? 'text-red-600' :
                                                            kv.status === 'Low' ? 'text-yellow-600' :
                                                                'text-green-600'
                                                        }`}>
                                                        {kv.value} ({kv.status})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {condition.recentRecords && condition.recentRecords.length > 0 && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Recent Records (with dates):
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {condition.recentRecords.map((record, i) => (
                                            <span key={i} className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                                                {record}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Changes Since Last Review */}
            {dashboard.changesSinceLastReview && dashboard.changesSinceLastReview.changes?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Clock className="w-6 h-6 text-purple-600 mr-2" />
                        Changes Since Last Review
                    </h3>
                    <div className="space-y-3">
                        {dashboard.changesSinceLastReview.changes.map((change, idx) => (
                            <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border-l-4 border-purple-500">
                                <p className="text-gray-800 dark:text-gray-200">{change}</p>
                            </div>
                        ))}
                    </div>
                    {dashboard.changesSinceLastReview.comparedReports?.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Compared Reports (with dates):
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {dashboard.changesSinceLastReview.comparedReports.map((report, idx) => (
                                    <span key={idx} className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                                        {report}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Overall Health Snapshot */}
            {dashboard.healthSnapshot && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <AlertCircle className="w-6 h-6 text-indigo-600 mr-2" />
                        Overall Health Snapshot
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                {dashboard.healthSnapshot.chronicConditionsCount}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Chronic Conditions
                            </div>
                        </div>
                        <div className="text-center p-4">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {dashboard.healthSnapshot.mostActiveCondition}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Most Active Condition
                            </div>
                        </div>
                        <div className="text-center p-4">
                            <div className={`text-lg font-semibold mb-1 ${dashboard.healthSnapshot.generalStatus === 'Stable' ? 'text-green-600' :
                                    dashboard.healthSnapshot.generalStatus === 'Needs Attention' ? 'text-amber-600' :
                                        'text-gray-600'
                                }`}>
                                {dashboard.healthSnapshot.generalStatus}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                General Status
                            </div>
                        </div>
                        <div className="text-center p-4">
                            <div className={`text-lg font-semibold mb-1 ${dashboard.healthSnapshot.dataCoverage === 'High' ? 'text-green-600' :
                                    dashboard.healthSnapshot.dataCoverage === 'Medium' ? 'text-yellow-600' :
                                        'text-gray-600'
                                }`}>
                                {dashboard.healthSnapshot.dataCoverage}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Data Coverage
                                {dashboard.healthSnapshot.dataCoverageReason && (
                                    <div className="text-xs mt-1">
                                        ({dashboard.healthSnapshot.dataCoverageReason})
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
