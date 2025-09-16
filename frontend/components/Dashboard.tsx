'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import CampaignCard from '@/components/CampaignCard';

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const { searchQuery } = useStore();

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/reports`);
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredCampaigns.map((campaign: any) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
