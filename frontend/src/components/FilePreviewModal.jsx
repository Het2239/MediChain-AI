import { X, FileText } from 'lucide-react';

export default function FilePreviewModal({ isOpen, onClose, file }) {
    if (!isOpen || !file) return null;

    const isImage = ['jpg', 'jpeg', 'png'].includes(file.fileType?.toLowerCase());
    const isPDF = file.fileType?.toLowerCase() === 'pdf';

    return (
        <div className="fixed inset-0 bg-[#001A05]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#F7EFE6] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#001A05]/20">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#001A05]/10 bg-white/50">
                    <h2 className="text-xl font-bold text-[#001A05] flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-[#042B0B]" />
                        <span>File Preview</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[#001A05]/50 hover:text-[#001A05] transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* File Info */}
                    <div className="bg-white rounded-lg p-5 border border-[#001A05]/10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#042B0B] to-[#F7EFE6]"></div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-[#001A05]/60 block mb-1">Type</span>
                                <span className="font-bold text-[#001A05] uppercase bg-[#042B0B]/5 px-2 py-0.5 rounded inline-block">
                                    {file.fileType}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#001A05]/60 block mb-1">Category</span>
                                <span className="font-bold text-[#001A05] capitalize">
                                    {file.category}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#001A05]/60 block mb-1">CID</span>
                                <span className="font-mono text-xs text-[#001A05] break-all">
                                    {file.cid.slice(0, 10)}...{file.cid.slice(-10)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#001A05]/60 block mb-1">Date</span>
                                <span className="font-medium text-[#001A05]">
                                    {new Date(file.timestampDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    {isImage ? (
                        <div className="bg-[#001A05]/5 border border-[#001A05]/10 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
                            <p className="text-[#001A05]/60 text-center text-lg">
                                <FileText className="w-16 h-16 mx-auto mb-4 text-[#042B0B]/30" />
                                Image preview requires file download for security
                            </p>
                        </div>
                    ) : isPDF ? (
                        <div className="bg-[#001A05]/5 border border-[#001A05]/10 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                            <p className="text-[#001A05]/60 text-center text-lg">
                                <FileText className="w-16 h-16 mx-auto mb-4 text-[#042B0B]/30" />
                                PDF preview requires file download for security
                            </p>
                        </div>
                    ) : (
                        <div className="bg-[#001A05]/5 border border-[#001A05]/10 rounded-lg p-12 text-center">
                            <FileText className="w-20 h-20 text-[#001A05]/20 mx-auto mb-6" />
                            <p className="text-[#001A05]/80 text-xl font-medium">
                                Preview not available for {file.fileType.toUpperCase()} files
                            </p>
                            <p className="text-[#001A05]/60 mt-2">
                                Download the file to view its contents securely
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#001A05]/10 bg-white/50">
                    <button onClick={onClose} className="btn bg-[#042B0B] text-[#F7EFE6] hover:bg-[#042B0B]/90 w-full shadow-md hover:shadow-lg transition-all">
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
    );
}
