'use client';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Home, Users, BookOpen, Settings, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import CreateCampaignModal from '@/components/CreateCampaignModal';
import ReportModal from '@/components/ReportModal';
import CampaignCard from '@/components/CampaignCard';
import ServiceStatus from '@/components/ServiceStatus';

const navItems = [
  { icon: Home, label: 'Dashboard', id: 'dashboard' },
  { icon: Users, label: 'Users', id: 'users' },
  { icon: BookOpen, label: 'Training', id: 'training' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [campaigns, setCampaigns] = useState([]);
  const { searchQuery, setSearchQuery, openCreateCampaign } = useStore();

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/v1/reports`);
      const data = await res.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const filteredCampaigns = campaigns.filter((c: any) =>
    searchQuery ? c.ai_summary?.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="flex h-screen">
          {/* Navigation Rail */}
          <nav className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-8">
            <div className="text-2xl font-bold text-blue-600">S</div>
            <div className="flex-1 flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`group relative p-2 rounded-lg transition-all ${
                    activeView === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                  title={item.label}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </nav>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
              <h1 className="text-xl font-semibold">Project Sentinel</h1>
              <div className="flex-1 mx-8">
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="w-full max-w-md px-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <ServiceStatus />
            </header>

            {/* Content Area */}
            <main className="flex-1 p-6 overflow-auto">
              {activeView === 'dashboard' && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCampaigns.map((campaign: any) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              )}
              {activeView === 'users' && <div className="text-center py-12">Users View</div>}
              {activeView === 'training' && <div className="text-center py-12">Training Content</div>}
              {activeView === 'settings' && <div className="text-center py-12">Settings</div>}
            </main>
          </div>

          {/* Floating Action Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={openCreateCampaign}
            className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Modals */}
        <CreateCampaignModal />
        <ReportModal />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
