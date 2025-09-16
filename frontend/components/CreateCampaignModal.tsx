'use client';
import { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Send, Calendar, RefreshCw } from 'lucide-react';
import { useStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateCampaignModal() {
  const { createCampaignModal, closeCreateCampaign } = useStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    targetUsers: [],
    difficulty: 'medium',
    schedule: 'now',
    recurring: '',
    date: '',
    time: ''
  });

  if (!createCampaignModal) return null;

  const handleSubmit = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        raw_email: `Campaign: ${formData.name}\nDifficulty: ${formData.difficulty}\nSchedule: ${formData.schedule}`
      })
    });
    
    if (response.ok) {
      toast.success('Campaign created successfully!');
      closeCreateCampaign();
      setStep(1);
    } else {
      toast.error('Failed to create campaign');
    }
  };

  const emailPreview = {
    easy: 'Dear User, Please update your password at your convenience.',
    medium: 'Urgent: Your account requires immediate verification to prevent suspension.',
    hard: 'IT Security Alert: Mandatory password reset required within 24 hours.'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create Campaign</h2>
          <button onClick={closeCreateCampaign} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center px-6 py-3 border-b">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <h3 className="font-semibold mb-4">Campaign Setup</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Campaign Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Q1 Security Training"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Target Users</label>
                    <div className="border rounded-lg p-3 space-y-2">
                      {['All Users', 'Sales Team', 'Engineering', 'Marketing'].map(group => (
                        <label key={group} className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm">{group}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <h3 className="font-semibold mb-4">Email Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['easy', 'medium', 'hard'].map(level => (
                        <button
                          key={level}
                          onClick={() => setFormData({ ...formData, difficulty: level })}
                          className={`py-3 px-4 rounded-lg border capitalize ${
                            formData.difficulty === level
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">AI-Generated Preview</label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">{emailPreview[formData.difficulty as keyof typeof emailPreview]}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <h3 className="font-semibold mb-4">Schedule Campaign</h3>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="schedule"
                        value="now"
                        checked={formData.schedule === 'now'}
                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                        className="mr-3"
                      />
                      <Send className="w-5 h-5 mr-2 text-gray-500" />
                      <span>Send Now</span>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="schedule"
                        value="scheduled"
                        checked={formData.schedule === 'scheduled'}
                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                        className="mr-3"
                      />
                      <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                      <span>Schedule for specific date/time</span>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="schedule"
                        value="recurring"
                        checked={formData.schedule === 'recurring'}
                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                        className="mr-3"
                      />
                      <RefreshCw className="w-5 h-5 mr-2 text-gray-500" />
                      <span>Set Recurring Schedule</span>
                    </label>
                  </div>

                  {formData.schedule === 'recurring' && (
                    <div className="ml-10 p-3 bg-gray-50 rounded-lg">
                      <select className="w-full px-3 py-2 border rounded-lg">
                        <option>Every Monday</option>
                        <option>Every 2nd Tuesday of the month</option>
                        <option>Quarterly (First Monday)</option>
                        <option>Monthly (Last Friday)</option>
                      </select>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center px-4 py-2 text-gray-600 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Campaign
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
