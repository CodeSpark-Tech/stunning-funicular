'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Users, BarChart3, Settings, Plus, Shield, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import CreateCampaignModal from '@/components/CreateCampaignModal';
import CampaignCard from '@/components/CampaignCard';
import StatsCard from '@/components/StatsCard';
import UsersList from '@/components/UsersList';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchData();
    connectWebSocket();
    
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const connectWebSocket = () => {
    const socket = new WebSocket(`ws://localhost:8001/ws`);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'campaign_created') {
        toast.success(`Campaign "${data.data.name}" created!`);
        fetchCampaigns();
      }
      if (data.event === 'user_clicked') {
        toast(`User clicked phishing link in campaign ${data.data.campaign_id}`, {
          icon: '⚠️',
        });
        fetchCampaigns();
      }
    };
    
    setWs(socket);
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchCampaigns(), fetchStats()]);
    setLoading(false);
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_URL}/api/campaigns`);
      const data = await res.json();
      setCampaigns(data);
    } catch (error) {
      toast.error('Failed to load campaigns');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/stats`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load statistics');
    }
  };

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'campaigns', icon: Shield, label: 'Campaigns' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <nav className="w-20 bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-8">
          <div className="mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`group relative p-3 rounded-xl transition-all ${
                  activeView === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={item.label}
              >
                <item.icon className="w-6 h-6" />
                <span className="absolute left-full ml-3 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-20 bg-black/20 backdrop-blur-xl border-b border-white/10 flex items-center px-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Project Sentinel</h1>
              <p className="text-gray-400 text-sm">Phishing Simulation Platform</p>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">All Systems Operational</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {activeView === 'dashboard' && (
              <>
                {/* Stats */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                      title="Total Campaigns"
                      value={stats.total_campaigns}
                      icon={Shield}
                      trend="+12%"
                      color="from-blue-500 to-blue-600"
                    />
                    <StatsCard
                      title="Active Campaigns"
                      value={stats.active_campaigns}
                      icon={Activity}
                      trend="+5%"
                      color="from-green-500 to-green-600"
                    />
                    <StatsCard
                      title="High Risk Users"
                      value={stats.high_risk_users}
                      icon={AlertTriangle}
                      trend="-8%"
                      color="from-red-500 to-red-600"
                    />
                    <StatsCard
                      title="Avg Click Rate"
                      value={`${stats.avg_click_rate}%`}
                      icon={TrendingUp}
                      trend="-15%"
                      color="from-purple-500 to-purple-600"
                    />
                  </div>
                )}

                {/* Recent Campaigns */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Recent Campaigns</h2>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="group flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      <span>New Campaign</span>
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {campaigns.map((campaign: any) => (
                        <CampaignCard
                          key={campaign.id}
                          campaign={campaign}
                          onRefresh={fetchCampaigns}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeView === 'campaigns' && (
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">All Campaigns</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((campaign: any) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onRefresh={fetchCampaigns}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeView === 'users' && (
              <UsersList />
            )}

            {activeView === 'analytics' && (
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Analytics Dashboard</h2>
                <p className="text-gray-300">Detailed analytics coming soon...</p>
              </div>
            )}

            {activeView === 'settings' && (
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
                <button
                  onClick={() => {
                    localStorage.removeItem('sentinel_onboarded');
                    window.location.reload();
                  }}
                  className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Reset Onboarding
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center"
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCampaigns();
          }}
        />
      )}
    </div>
  );
}
