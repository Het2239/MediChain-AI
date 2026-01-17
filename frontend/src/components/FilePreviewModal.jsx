import { X, FileText } from 'lucide-react';

export default function FilePreviewModal({ isOpen, onClose, file }) {
    if (!isOpen || !file) return null;

    const isImage = ['jpg', 'jpeg', 'png'].includes(file.fileType?.toLowerCase());
    const isPDF = file.fileType?.toLowerCase() === 'pdf';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        File Preview
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* File Info */}
                    <div className="mb-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white uppercase">
                                    {file.fileType}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                                    {file.category}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">CID:</span>
                                <span className="ml-2 font-mono text-xs text-gray-900 dark:text-white">
                                    {file.cid}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">
                                    {new Date(file.timestampDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    {isImage ? (
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center">
                            <p className="text-gray-600 dark:text-gray-400">
                                <FileText className="w-12 h-12 mx-auto mb-2" />
                                Image preview requires file download
                            </p>
                        </div>
                    ) : isPDF ? (
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                            <p className="text-gray-600 dark:text-gray-400">
                                <FileText className="w-12 h-12 mx-auto mb-2" />
                                PDF preview requires file download
                            </p>
                        </div>
                    ) : (
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-8 text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                                Preview not available for {file.fileType.toUpperCase()} files
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                Download the file to view its contents
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button onClick={onClose} className="btn btn-secondary w-full">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
