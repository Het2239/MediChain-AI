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
            <div className="section-light min-h-screen">
                <div className="container-opella py-12">
                    <div className="card-light p-12">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="spinner w-16 h-16 border-[#042B0B]/20 border-t-[#042B0B]"></div>
                            <h3 className="text-xl font-bold text-[#001A05]">
                                Analyzing Patient Medical Records
                            </h3>
                            <p className="text-[#001A05]/70">
                                Generating clinical dashboard...<br />
                                This may take a minute
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="section-light min-h-screen">
                <div className="container-opella py-8 space-y-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(`/doctor/patient/${patientAddress}/records`)}
                            className="btn bg-[#042B0B]/10 text-[#001A05] hover:bg-[#042B0B]/20"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="heading-opella text-3xl font-bold text-[#001A05]">
                                Patient Clinical Insights
                            </h1>
                            <p className="text-sm text-[#001A05]/60 font-mono mt-1">
                                Patient: {patientAddress}
                            </p>
                        </div>
                    </div>

                    <div className="card-light p-12 text-center max-w-4xl mx-auto">
                        <Brain className="w-20 h-20 text-[#001A05] mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-[#001A05] mb-4">
                            AI Clinical Dashboard
                        </h2>
                        <p className="text-xl text-[#001A05]/80 mb-8 max-w-2xl mx-auto">
                            Generate comprehensive clinical dashboard with patient overview, condition-specific summaries,
                            longitudinal trends, and evidence-based insights for efficient patient review.
                        </p>

                        {records.length > 0 ? (
                            <div className="space-y-6">
                                <div className="bg-[#001A05]/5 rounded-lg p-4 max-w-md mx-auto border border-[#001A05]/10">
                                    <p className="text-sm font-medium text-[#001A05]">
                                        <FileText className="w-4 h-4 inline mr-2" />
                                        {records.length} medical record{records.length !== 1 ? 's' : ''} ready for analysis
                                    </p>
                                </div>
                                <button
                                    onClick={handleGenerateInsights}
                                    className="btn bg-[#042B0B] text-[#F7EFE6] hover:bg-[#042B0B]/90 inline-flex items-center space-x-2 px-8 py-3 text-lg"
                                >
                                    <Brain className="w-5 h-5" />
                                    <span>Generate Clinical Insights</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-amber-50 rounded-lg p-4 max-w-md mx-auto border border-amber-200">
                                    <p className="text-sm text-amber-800">
                                        <Activity className="w-4 h-4 inline mr-2" />
                                        No medical records found for this patient
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="section-light min-h-screen">
            <div className="container-opella space-y-8 py-8">
                {/* Header */}
                <div className="card-light p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(`/doctor/patient/${patientAddress}/records`)}
                                className="btn bg-[#042B0B]/10 text-[#001A05] hover:bg-[#042B0B]/20"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-[#042B0B] rounded-lg flex items-center justify-center">
                                    <Brain className="w-6 h-6 text-[#F7EFE6]" />
                                </div>
                                <div>
                                    <h1 className="heading-opella text-3xl font-bold text-[#001A05]">
                                        Clinical Dashboard
                                    </h1>
                                    <p className="text-sm text-[#001A05]/60 font-mono mt-1">
                                        Patient: {patientAddress.substring(0, 10)}...{patientAddress.substring(38)}
                                    </p>
                                    {generatedAt && (
                                        <p className="text-xs text-[#001A05]/50 mt-1">
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
                            className="btn bg-[#042B0B]/10 text-[#001A05] hover:bg-[#042B0B]/20 inline-flex items-center space-x-2 border border-[#042B0B]/20"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Patient Overview */}
                {dashboard.patientOverview && (
                    <div className="card-light p-6">
                        <h3 className="text-xl font-bold text-[#001A05] mb-4 flex items-center">
                            <Activity className="w-6 h-6 text-[#001A05] mr-2" />
                            Patient Overview
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-[#001A05]/5 rounded-lg p-4 border border-[#001A05]/10">
                                <div className="text-sm text-[#001A05]/60 mb-1">Active Conditions</div>
                                <div className="text-2xl font-bold text-[#001A05]">
                                    {dashboard.patientOverview.activeConditions?.length || 0}
                                </div>
                                {dashboard.patientOverview.activeConditions?.length > 0 && (
                                    <div className="mt-2 text-xs text-[#001A05]/70 font-medium">
                                        {dashboard.patientOverview.activeConditions.join(', ')}
                                    </div>
                                )}
                            </div>
                            <div className="bg-[#001A05]/5 rounded-lg p-4 border border-[#001A05]/10">
                                <div className="text-sm text-[#001A05]/60 mb-1">First Record</div>
                                <div className="text-lg font-bold text-[#001A05]">
                                    {dashboard.patientOverview.firstRecordDate}
                                </div>
                            </div>
                            <div className="bg-[#001A05]/5 rounded-lg p-4 border border-[#001A05]/10">
                                <div className="text-sm text-[#001A05]/60 mb-1">Latest Update</div>
                                <div className="text-lg font-bold text-[#001A05]">
                                    {dashboard.patientOverview.latestUpdateDate}
                                </div>
                            </div>
                            <div className="bg-[#001A05]/5 rounded-lg p-4 border border-[#001A05]/10">
                                <div className="text-sm text-[#001A05]/60 mb-1">Total Records</div>
                                <div className="text-2xl font-bold text-[#001A05]">
                                    {dashboard.patientOverview.recordCount}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Condition Summaries */}
                {dashboard.conditionSummaries && dashboard.conditionSummaries.length > 0 && (
                    <div className="space-y-4 mb-6">
                        <h3 className="text-xl font-bold text-[#001A05] flex items-center pl-2">
                            <TrendingUp className="w-6 h-6 text-[#001A05] mr-2" />
                            Condition-Specific Summaries
                        </h3>
                        {dashboard.conditionSummaries.map((condition, idx) => (
                            <div key={idx} className="card-light p-6">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <h4 className="text-lg font-bold text-[#001A05]">
                                        {condition.condition}
                                    </h4>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${condition.trend === 'improving' ? 'bg-green-100 text-green-800 border-green-200' :
                                        condition.trend === 'stable' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                            condition.trend === 'worsening' ? 'bg-red-100 text-red-800 border-red-200' :
                                                'bg-gray-100 text-gray-800 border-gray-200'
                                        }`}>
                                        {getTrendIcon(condition.trend)} {condition.trend}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <div className="text-sm font-semibold text-[#001A05]/60 mb-1">Timeline</div>
                                        <div className="text-sm font-medium text-[#001A05] bg-[#001A05]/5 p-3 rounded-lg border border-[#001A05]/10">
                                            <div>First detected: {condition.firstDetected}</div>
                                            <div>Latest report: {condition.latestReport}</div>
                                        </div>
                                    </div>
                                    {condition.keyValues && condition.keyValues.length > 0 && (
                                        <div>
                                            <div className="text-sm font-semibold text-[#001A05]/60 mb-1">Key Values</div>
                                            <div className="space-y-1 bg-[#001A05]/5 p-3 rounded-lg border border-[#001A05]/10">
                                                {condition.keyValues.map((kv, i) => (
                                                    <div key={i} className="flex justify-between text-sm">
                                                        <span className="text-[#001A05]/80">{kv.metric}:</span>
                                                        <span className={`font-bold ${kv.status === 'High' ? 'text-red-700' :
                                                            kv.status === 'Low' ? 'text-yellow-700' :
                                                                'text-green-700'
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
                                    <div className="border-t border-[#001A05]/10 pt-3 mt-3">
                                        <div className="text-sm text-[#001A05]/60 mb-2 flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            Recent Records (with dates):
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {condition.recentRecords.map((record, i) => (
                                                <span key={i} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded font-medium">
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
                    <div className="card-light p-6">
                        <h3 className="text-xl font-bold text-[#001A05] mb-4 flex items-center">
                            <Clock className="w-6 h-6 text-[#001A05] mr-2" />
                            Changes Since Last Review
                        </h3>
                        <div className="space-y-3">
                            {dashboard.changesSinceLastReview.changes.map((change, idx) => (
                                <div key={idx} className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500 shadow-sm">
                                    <p className="text-[#001A05] font-medium">{change}</p>
                                </div>
                            ))}
                        </div>
                        {dashboard.changesSinceLastReview.comparedReports?.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-[#001A05]/10">
                                <div className="text-sm text-[#001A05]/60 mb-2 flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Compared Reports (with dates):
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {dashboard.changesSinceLastReview.comparedReports.map((report, idx) => (
                                        <span key={idx} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded font-medium">
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
                    <div className="card-light p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100">
                        <h3 className="text-xl font-bold text-[#001A05] mb-4 flex items-center">
                            <AlertCircle className="w-6 h-6 text-indigo-700 mr-2" />
                            Overall Health Snapshot
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-4 bg-white/60 rounded-lg shadow-sm border border-indigo-100/50">
                                <div className="text-3xl font-extrabold text-[#001A05] mb-1">
                                    {dashboard.healthSnapshot.chronicConditionsCount}
                                </div>
                                <div className="text-sm font-medium text-[#001A05]/70">
                                    Chronic Conditions
                                </div>
                            </div>
                            <div className="text-center p-4 bg-white/60 rounded-lg shadow-sm border border-indigo-100/50">
                                <div className="text-lg font-bold text-[#001A05] mb-1 leading-tight line-clamp-2 min-h-[1.75rem]">
                                    {dashboard.healthSnapshot.mostActiveCondition}
                                </div>
                                <div className="text-sm font-medium text-[#001A05]/70">
                                    Most Active Condition
                                </div>
                            </div>
                            <div className="text-center p-4 bg-white/60 rounded-lg shadow-sm border border-indigo-100/50">
                                <div className={`text-lg font-bold mb-1 ${dashboard.healthSnapshot.generalStatus === 'Stable' ? 'text-green-700' :
                                    dashboard.healthSnapshot.generalStatus === 'Needs Attention' ? 'text-amber-700' :
                                        'text-[#001A05]'
                                    }`}>
                                    {dashboard.healthSnapshot.generalStatus}
                                </div>
                                <div className="text-sm font-medium text-[#001A05]/70">
                                    General Status
                                </div>
                            </div>
                            <div className="text-center p-4 bg-white/60 rounded-lg shadow-sm border border-indigo-100/50">
                                <div className={`text-lg font-bold mb-1 ${dashboard.healthSnapshot.dataCoverage === 'High' ? 'text-green-700' :
                                    dashboard.healthSnapshot.dataCoverage === 'Medium' ? 'text-yellow-700' :
                                        'text-[#001A05]'
                                    }`}>
                                    {dashboard.healthSnapshot.dataCoverage}
                                </div>
                                <div className="text-sm font-medium text-[#001A05]/70">
                                    Data Coverage
                                    {dashboard.healthSnapshot.dataCoverageReason && (
                                        <div className="text-xs mt-1 text-[#001A05]/50 leading-tight">
                                            ({dashboard.healthSnapshot.dataCoverageReason})
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
