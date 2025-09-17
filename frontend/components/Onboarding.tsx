'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, BarChart3, Zap, ChevronRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Shield,
      title: 'Welcome to Project Sentinel',
      description: 'Your AI-powered phishing simulation platform. Train your team to recognize and report phishing attacks.',
      color: 'from-blue-500 to-purple-600',
    },
    {
      icon: Users,
      title: 'Manage Your Team',
      description: 'Import users, organize them by department, and track individual risk scores.',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Monitor campaign performance, click rates, and training progress with live dashboards.',
      color: 'from-pink-500 to-red-600',
    },
    {
      icon: Zap,
      title: 'Ready to Start',
      description: "Let's create your first phishing simulation campaign. It only takes 2 minutes!",
      color: 'from-red-500 to-orange-600',
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-8">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-2xl w-full"
      >
        {/* Progress Dots */}
        <div className="flex justify-center mb-12 space-x-2">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`h-2 w-2 rounded-full transition-all ${
                index === step
                  ? 'w-8 bg-white'
                  : index < step
                  ? 'bg-white/60'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Icon */}
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${currentStep.color} p-4 mb-6`}>
                <currentStep.icon className="w-full h-full text-white" />
              </div>

              {/* Content */}
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {currentStep.title}
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                {currentStep.description}
              </p>

              {/* Features for last step */}
              {step === 3 && (
                <div className="space-y-3 mb-8">
                  {[
                    'Create realistic phishing emails',
                    'Track user interactions in real-time',
                    'Generate comprehensive reports',
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                )}
                <div className="ml-auto">
                  {step < steps.length - 1 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      className="group flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onComplete}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                    >
                      Get Started
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
