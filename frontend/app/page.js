'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/reports`);
        const data = await res.json();
        setReports(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: reports.length,
    malicious: reports.filter(r => r.verdict === 'Malicious').length,
    spam: reports.filter(r => r.verdict === 'Spam').length,
    safe: reports.filter(r => r.verdict === 'Safe').length,
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Project Sentinel</h1>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Malicious</div>
          <div className="text-2xl font-bold text-red-600">{stats.malicious}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Spam</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.spam}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Safe</div>
          <div className="text-2xl font-bold text-green-600">{stats.safe}</div>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Verdict</th>
              <th className="px-4 py-2 text-left">Confidence</th>
              <th className="px-4 py-2 text-left">Summary</th>
              <th className="px-4 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id} className="border-t">
                <td className="px-4 py-2">#{report.id}</td>
                <td className="px-4 py-2">{report.status}</td>
                <td className="px-4 py-2">{report.verdict || '-'}</td>
                <td className="px-4 py-2">
                  {report.ai_confidence ? `${(report.ai_confidence * 100).toFixed(0)}%` : '-'}
                </td>
                <td className="px-4 py-2">{report.ai_summary || '-'}</td>
                <td className="px-4 py-2">
                  {new Date(report.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
