'use client';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function ServiceStatus() {
  const { serviceStatus, setServiceStatus } = useStore();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/health`);
        setServiceStatus(res.ok ? 'healthy' : 'degraded');
      } catch {
        setServiceStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [setServiceStatus]);

  const statusConfig = {
    healthy: { color: 'bg-green-500', label: 'All Systems Operational' },
    degraded: { color: 'bg-yellow-500', label: 'Degraded Performance' },
    offline: { color: 'bg-red-500', label: 'Service Offline' }
  };

  const config = statusConfig[serviceStatus];

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <span className="text-xs text-gray-500">{config.label}</span>
    </div>
  );
}
