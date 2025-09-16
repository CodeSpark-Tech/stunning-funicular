'use client';
import { Eye, Edit, Copy, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function CampaignCard({ campaign }: any) {
  const { openReport } = useStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Malicious': return 'bg-red-100 text-red-800';
      case 'Spam': return 'bg-yellow-100 text-yellow-800';
      case 'Safe': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAction = (action: string) => {
    toast.success(`${action} campaign #${campaign.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900">Campaign #{campaign.id}</h3>
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(campaign.status)}`}>
          {campaign.status}
        </span>
      </div>

      {campaign.verdict && (
        <span className={`inline-block px-2 py-1 rounded text-xs mb-3 ${getVerdictColor(campaign.verdict)}`}>
          {campaign.verdict}
        </span>
      )}

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {campaign.ai_summary || 'Processing...'}
      </p>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {campaign.ai_confidence && `${(campaign.ai_confidence * 100).toFixed(0)}% confidence`}
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => openReport(campaign.id)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
            title="View Report"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAction('Edit')}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAction('Duplicate')}
            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-all"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAction('Delete')}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
