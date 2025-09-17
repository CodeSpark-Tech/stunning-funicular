'use client';
import { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Send, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateCampaignModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCampaignModal({ onClose, onSuccess }: CreateCampaignModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetUsers: [],
    difficulty: 'medium',
    schedule_type: 'immediate',
    recurring: '',
    date: '',
    time: ''
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Please enter a campaign name');
      setStep(1);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          difficulty: formData.difficulty,
          target_users: formData.targetUsers,
          schedule_type: formData.schedule_type,
          recurring: formData.recurring || null,
          schedule_date: formData.date ? new Date(`${formData.date} ${formData.time || '00:00'}`) : null
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Campaign "${data.name}" created successfully!`);
        onSuccess();
      } else {
        toast.error('Failed to create campaign');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const emailPreview = {
    easy: {
      subject: 'Account Verification Required',
      body: 'Dear User,\n\nWe noticed unusual activity on your account. Please verify your identity to continue using our services.\n\nClick here to verify: [LINK]\n\nBest regards,\nSecurity Team'
    },
    medium: {
      subject: '[URGENT] Immediate Action Required',
      body: 'SECURITY ALERT\n\nYour account will be suspended in 24 hours due to suspicious activity.\n\nVerify now to prevent suspension: [VERIFY]\n\nThis is an automated message from IT Security.'
    },
    hard: {
      subject: 'Re: Document from CEO',
      body: 'Hi,\n\nThe CEO asked me to share this confidential document with you.\n\nView Document: [SECURE LINK]\n\nThis link expires in 2 hours.\n\n- Executive Assistant'
    }
  };

  const currentPreview = emailPreview[formData.difficulty as keyof typeof emailPreview];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="backdrop-blur-xl bg-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/20 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Create Campaign</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center px-6 py-4 border-b border-white/10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                step >= s ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-white/10 text-gray-400'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                  step > s ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-white mb-4">Campaign Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Q1 Security Assessment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Quarterly phishing simulation to test user awareness..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Target Users</label>
                  <div className="space-y-2">
                    {['All Users (50)', 'Sales Team (12)', 'Engineering (18)', 'Marketing (10)'].map(group => (
                      <label key={group} className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer">
                        <input type="checkbox" className="mr-3" />
                        <span className="text-white">{group}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-white mb-4">Email Template</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['easy', 'medium', 'hard'].map(level => (
                      <button
                        key={level}
                        onClick={() => setFormData({ ...formData, difficulty: level })}
                        className={`py-3 px-4 rounded-lg border capitalize transition-all ${
                          formData.difficulty === level
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                            : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Email Preview</label>
                  <div className="bg-white/5 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Subject:</p>
                      <p className="text-white font-medium">{currentPreview.subject}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Body:</p>
                      <p className="text-gray-300 whitespace-pre-line text-sm">{currentPreview.body}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">* AI will personalize this template for each user</p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-white mb-4">Schedule Campaign</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
                    <input
                      type="radio"
                      name="schedule"
                      value="immediate"
                      checked={formData.schedule_type === 'immediate'}
                      onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value })}
                      className="mr-3"
                    />
                    <Send className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Send Immediately</p>
                      <p className="text-gray-400 text-sm">Launch campaign right after creation</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
                    <input
                      type="radio"
                      name="schedule"
                      value="scheduled"
                      checked={formData.schedule_type === 'scheduled'}
                      onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value })}
                      className="mr-3"
                    />
                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Schedule for Later</p>
                      <p className="text-gray-400 text-sm">Choose specific date and time</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
                    <input
                      type="radio"
                      name="schedule"
                      value="recurring"
                      checked={formData.schedule_type === 'recurring'}
                      onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value })}
                      className="mr-3"
                    />
                    <RefreshCw className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Recurring Campaign</p>
                      <p className="text-gray-400 text-sm">Automatically repeat on schedule</p>
                    </div>
                  </label>
                </div>

                {formData.schedule_type === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <input
                      type="date"
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                    <input
                      type="time"
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                )}

                {formData.schedule_type === 'recurring' && (
                  <select
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white mt-4"
                    value={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.value })}
                  >
                    <option value="">Select frequency</option>
                    <option value="weekly">Every Week</option>
                    <option value="biweekly">Every 2 Weeks</option>
                    <option value="monthly">Every Month</option>
                    <option value="quarterly">Every Quarter</option>
                  </select>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-white/10">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || loading}
            className="flex items-center px-4 py-2 text-gray-400 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
