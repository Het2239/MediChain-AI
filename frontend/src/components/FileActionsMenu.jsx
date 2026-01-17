import { useState } from 'react';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

export default function FileActionsMenu({ file, onPreview, onEdit, onDelete }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (action) => {
        setIsOpen(false);
        action();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                        <div className="py-1">
                            <button
                                onClick={() => handleAction(onPreview)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                            </button>

                            <button
                                onClick={() => handleAction(onEdit)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Category
                            </button>

                            <button
                                onClick={() => handleAction(onDelete)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete File
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
