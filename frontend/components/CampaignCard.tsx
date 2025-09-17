'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Eye, Clock, CheckCircle, AlertCircle, Users, MousePointer } from 'lucide-react';
import toast from 'react-hot-toast';

interface CampaignCardProps {
  campaign: any;
  onRefresh: () => void;
}

export default function CampaignCard({ campaign, onRefresh }: CampaignCardProps) {
  const [loading, setLoading] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  const statusConfig = {
    active: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle, label: 'Active' },
    scheduled: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock, label: 'Scheduled' },
    completed: { color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle, label: 'Completed' },
    draft: { color: 'bg-gray-500/20 text-gray-400', icon: AlertCircle, label: 'Draft' }
  };

  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    hard: 'bg-red-500/20 text-red-400'
  };

  const config = statusConfig[campaign.status] || statusConfig.draft;
  const StatusIcon = config.icon;

  const launchCampaign = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${campaign.id}/launch`, {
        method: 'PUT'
      });
      
      if (res.ok) {
        toast.success('Campaign launched successfully!');
        onRefresh();
      } else {
        toast.error('Failed to launch campaign');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const simulateClick = async () => {
    try {
      await fetch(`${API_URL}/api/simulate-click/${campaign.id}`, {
        method: 'POST'
      });
      toast('Simulated phishing click!', { icon: '🎣' });
      onRefresh();
    } catch (error) {
      toast.error('Failed to simulate click');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{campaign.name}</h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs ${config.color}`}>
              <StatusIcon className="w-3 h-3" />
              <span>{config.label}</span>
            </span>
            <span className={`px-2 py-1 rounded-lg text-xs ${difficultyColors[campaign.difficulty]}`}>
              {campaign.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">Sent</span>
          </div>
          <p className="text-xl font-bold text-white">{campaign.sent_count}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-400 mb-1">
            <MousePointer className="w-4 h-4" />
            <span className="text-xs">Clicks</span>
          </div>
          <p className="text-xl font-bold text-white">{campaign.click_count}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-400 mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-xs">Rate</span>
          </div>
          <p className="text-xl font-bold text-white">{campaign.click_rate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${campaign.click_rate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {campaign.status === 'scheduled' && (
          <button
            onClick={launchCampaign}
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400" />
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="text-sm">Launch</span>
              </>
            )}
          </button>
        )}
        
        {campaign.status === 'active' && (
          <button
            onClick={simulateClick}
            className="flex-1 flex items-center justify-center space-x-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-2 rounded-lg transition-colors"
          >
            <MousePointer className="w-4 h-4" />
            <span className="text-sm">Simulate Click</span>
          </button>
        )}
        
        <button className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors">
          <Eye className="w-4 h-4" />
          <span className="text-sm">View</span>
        </button>
      </div>
    </motion.div>
  );
}
