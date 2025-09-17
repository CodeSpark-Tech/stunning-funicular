'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, AlertTriangle, CheckCircle, BookOpen, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-red-400 bg-red-500/20';
    if (score > 40) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  const getRiskLabel = (score: number) => {
    if (score > 70) return 'High Risk';
    if (score > 40) return 'Medium Risk';
    return 'Low Risk';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">User Risk Assessment</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Department</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Risk Score</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Campaigns</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Training</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-300">{user.department}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${user.risk_score}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full ${
                          user.risk_score > 70 ? 'bg-red-500' :
                          user.risk_score > 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      />
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${getRiskColor(user.risk_score)}`}>
                      {user.risk_score.toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-300">
                      <span className="text-white font-medium">{user.campaigns_clicked}</span>/{user.campaigns_received}
                    </span>
                    {user.campaigns_clicked > user.campaigns_received * 0.3 && (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  {user.training_completed ? (
                    <span className="flex items-center space-x-1 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Completed</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-yellow-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Pending</span>
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <button className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">Train</span>
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
