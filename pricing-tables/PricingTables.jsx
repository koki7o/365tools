"use client"

import React, { useState } from 'react';
import { Check, Sparkles, Star, Zap, Shield } from 'lucide-react';

const PricingTables = () => {
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'STARTER',
      price: { monthly: 12, yearly: 120 },
      icon: Star,
      features: [
        'Basic features included',
        '1 user account',
        'Up to 10 projects',
        'Community support'
      ]
    },
    {
      name: 'BUSINESS',
      price: { monthly: 24, yearly: 240 },
      icon: Zap,
      features: [
        'All Starter features',
        'Up to 5 user accounts',
        'Up to 50 projects',
        'Priority support'
      ]
    },
    {
      name: 'PROFESSIONAL',
      price: { monthly: 48, yearly: 480 },
      icon: Shield,
      features: [
        'All Business features',
        'Unlimited users',
        'Unlimited projects',
        '24/7 dedicated support'
      ],
      isPopular: true
    },
    {
      name: 'PREMIUM',
      price: { monthly: 96, yearly: 960 },
      icon: Sparkles,
      features: [
        'All Professional features',
        'Custom solutions',
        'API access',
        'Custom integrations'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">PRICING TABLES</h1>
        
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-full p-1 shadow-lg">
            <div className="relative flex">
              <button
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  !isYearly ? 'bg-blue-600 text-white' : 'text-gray-600'
                }`}
                onClick={() => setIsYearly(false)}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  isYearly ? 'bg-blue-600 text-white' : 'text-gray-600'
                }`}
                onClick={() => setIsYearly(true)}
              >
                Yearly
                <span className="ml-1 text-xs text-emerald-500 font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isHovered = hoveredPlan === index;
            const currentPrice = isYearly ? plan.price.yearly : plan.price.monthly;
            
            return (
              <div
                key={index}
                className={`relative rounded-2xl p-6 transition-all duration-500 transform
                  ${isHovered ? 'scale-105 -translate-y-2' : 'scale-100 translate-y-0'}
                  ${isHovered ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-white'}
                  hover:shadow-2xl`}
                onMouseEnter={() => setHoveredPlan(index)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-4 transition-transform duration-300 
                    ${isHovered ? 'scale-110 rotate-12 text-white' : 'text-blue-600'}`} 
                  />
                  
                  <h3 className={`text-lg font-bold mb-4 transition-colors duration-300
                    ${isHovered ? 'text-white' : 'text-gray-800'}`}>
                    {plan.name}
                  </h3>
                  
                  <div className={`text-3xl font-bold mb-1 transition-all duration-300
                    ${isHovered ? 'text-white scale-110' : 'text-gray-900 scale-100'}`}>
                    ${currentPrice}
                  </div>
                  
                  <div className={`text-sm mb-6 transition-colors duration-300
                    ${isHovered ? 'text-gray-100' : 'text-gray-500'}`}>
                    PER {isYearly ? 'YEAR' : 'MONTH'}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} 
                      className={`flex items-center transition-all duration-300
                        ${isHovered ? 'translate-x-2' : ''}`}>
                      <Check className={`w-5 h-5 mr-2 transition-colors duration-300
                        ${isHovered ? 'text-white' : 'text-blue-600'}`} />
                      <span className={`text-sm transition-colors duration-300
                        ${isHovered ? 'text-gray-100' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300
                    transform hover:scale-105 hover:shadow-lg
                    ${isHovered 
                      ? 'bg-white text-blue-600 hover:bg-gray-50' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'}`}
                >
                  ORDER NOW
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingTables;