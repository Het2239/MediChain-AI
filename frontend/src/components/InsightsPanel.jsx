import { useState } from 'react';
import { Brain, RefreshCw, Activity, Pill, Calendar, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function InsightsPanel({ patientAddress, userAddress, userRole = 'patient' }) {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generatedAt, setGeneratedAt] = useState(null);

    const generateInsights = async (records) => {
        setLoading(true);
        try {
            console.log(`Generating insights for ${records.length} files...`);

            // Download and process each file
            const filesData = [];
            for (const record of records) {
                try {
                    // Download file
                    const response = await axios.post(
                        `${API_URL}/file/download/${record.cid}`,
                        { patientAddress },
                        {
                            headers: { 'X-Wallet-Address': userAddress },
                            responseType: 'blob'
                        }
                    );

                    // Convert blob to base64
                    const blob = response.data;
                    const base64 = await blobToBase64(blob);

                    // Extract text content (send to backend for extraction)
                    const extractResponse = await axios.post(
                        `${API_URL}/insights/extract-text`,
                        {
                            fileBuffer: base64.split(',')[1], // Remove data:*/*;base64, prefix
                            fileType: record.fileType,
                            mimeType: blob.type
                        },
                        {
                            headers: { 'X-Wallet-Address': userAddress }
                        }
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
                    // Continue with other files
                }
            }

            if (filesData.length === 0) {
                toast.error('No text could be extracted from files');
                setLoading(false);
                return;
            }

            // Generate insights
            const insightsResponse = await axios.post(
                `${API_URL}/insights/generate`,
                {
                    patientAddress,
                    files: filesData
                },
                {
                    headers: { 'X-Wallet-Address': userAddress }
                }
            );

            setInsights(insightsResponse.data.insights);
            setGeneratedAt(insightsResponse.data.generatedAt);
            toast.success('Insights generated successfully!');

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

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="spinner w-12 h-12"></div>
                    <p className="text-gray-600 dark:text-gray-400">Analyzing medical records...</p>
                    <p className="text-sm text-gray-500">This may take a minute</p>
                </div>
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    AI Medical Insights
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No insights generated yet. Click the button below to analyze your medical records.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Brain className="w-8 h-8 text-indigo-600" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                AI Medical Insights
                            </h2>
                            {generatedAt && (
                                <p className="text-sm text-gray-500">
                                    Generated on {new Date(generatedAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow p-6">
                <div className="flex items-start space-x-3">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Health Summary
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            {insights.healthSummary}
                        </p>
                    </div>
                </div>
            </div>

            {/* Key Findings */}
            {insights.keyFindings && insights.keyFindings.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Activity className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Key Findings
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {insights.keyFindings.map((finding, index) => (
                            <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {finding.condition}
                                    </h4>
                                    <span className={`px-2 py-1 text-xs rounded-full ${finding.severity === 'Severe' ? 'bg-red-100 text-red-800' :
                                            finding.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {finding.severity}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {finding.details}
                                </p>
                                {finding.firstMentioned && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        First mentioned: {finding.firstMentioned}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Medications */}
            {insights.medications && insights.medications.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Pill className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Medications
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights.medications.map((med, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {med.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {med.purpose}
                                </p>
                                {(med.dosage || med.frequency) && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {med.dosage && `${med.dosage}`}
                                        {med.dosage && med.frequency && ' • '}
                                        {med.frequency && med.frequency}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Timeline */}
            {insights.timeline && insights.timeline.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Calendar className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Health Timeline
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {insights.timeline.map((event, index) => (
                            <div key={index} className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-3 h-3 bg-green-600 rounded-full mt-2"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">{event.date}</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {event.event}
                                    </p>
                                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">
                                        {event.category}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Recommendations
                        </h3>
                    </div>
                    <ul className="space-y-2">
                        {insights.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Risk Factors */}
            {insights.riskFactors && insights.riskFactors.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Risk Factors
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {insights.riskFactors.map((risk, index) => (
                            <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {risk.factor}
                                    </h4>
                                    <span className={`px-2 py-1 text-xs rounded-full ${risk.level === 'High' ? 'bg-red-100 text-red-800' :
                                            risk.level === 'Moderate' ? 'bg-orange-100 text-orange-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {risk.level}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {risk.reasoning}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Export the generate function separately for use in parent components
export { InsightsPanel };
