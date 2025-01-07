"use client"

import React, { useState } from 'react';
import { Eye, EyeOff, Clipboard, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PasswordTool = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const checkStrength = (pass) => {
    let score = 0;
    const checks = {
      length: pass.length >= 8,
      hasUpperCase: /[A-Z]/.test(pass),
      hasLowerCase: /[a-z]/.test(pass),
      hasNumbers: /\d/.test(pass),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
      hasNoRepeating: !/(.)\1{2,}/.test(pass),
    };

    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    if (pass.length >= 12) score++;
    if (pass.length >= 16) score++;

    return {
      score: score,
      checks,
      strength: 
        score <= 2 ? 'Very Weak' :
        score <= 4 ? 'Weak' :
        score <= 6 ? 'Moderate' :
        score <= 7 ? 'Strong' : 'Very Strong'
    };
  };

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*(),.?":{}|<>';
    const all = uppercase + lowercase + numbers + special;
    
    let generated = '';
    // Ensure at least one of each type
    generated += uppercase[Math.floor(Math.random() * uppercase.length)];
    generated += lowercase[Math.floor(Math.random() * lowercase.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += special[Math.floor(Math.random() * special.length)];
    
    // Fill rest with random chars
    for (let i = 0; i < 12; i++) {
      generated += all[Math.floor(Math.random() * all.length)];
    }
    
    // Shuffle the password
    generated = generated.split('').sort(() => Math.random() - 0.5).join('');
    setGeneratedPassword(generated);
    setCopied(false);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const strength = checkStrength(password);
  const strengthColors = {
    'Very Weak': 'bg-red-500',
    'Weak': 'bg-orange-500',
    'Moderate': 'bg-yellow-500',
    'Strong': 'bg-green-500',
    'Very Strong': 'bg-emerald-500'
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Password Strength Analyzer</h2>
        
        {/* Password Input */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to check"
            className="w-full p-2 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Strength Indicator */}
        {password && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Strength: {strength.strength}</span>
              <span className="text-sm">{Math.round((strength.score / 8) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded">
              <div
                className={`h-full rounded transition-all ${strengthColors[strength.strength]}`}
                style={{ width: `${(strength.score / 8) * 100}%` }}
              />
            </div>

            {/* Checks List */}
            <div className="mt-4 space-y-2">
              <div className={strength.checks.length ? "text-green-600" : "text-red-600"}>
                • Minimum 8 characters
              </div>
              <div className={strength.checks.hasUpperCase ? "text-green-600" : "text-red-600"}>
                • Contains uppercase letters
              </div>
              <div className={strength.checks.hasLowerCase ? "text-green-600" : "text-red-600"}>
                • Contains lowercase letters
              </div>
              <div className={strength.checks.hasNumbers ? "text-green-600" : "text-red-600"}>
                • Contains numbers
              </div>
              <div className={strength.checks.hasSpecialChars ? "text-green-600" : "text-red-600"}>
                • Contains special characters
              </div>
              <div className={strength.checks.hasNoRepeating ? "text-green-600" : "text-red-600"}>
                • No repeating characters
              </div>
            </div>
          </div>
        )}

        {/* Password Generator */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Password Generator</h2>
          <div className="flex gap-2">
            <button
              onClick={generatePassword}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <RefreshCw size={20} />
              Generate
            </button>
          </div>

          {generatedPassword && (
            <div className="mt-4">
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded">
                <span className="flex-1 font-mono">{generatedPassword}</span>
                <button
                  onClick={() => copyToClipboard(generatedPassword)}
                  className="p-1 hover:text-blue-500"
                >
                  <Clipboard size={20} />
                </button>
              </div>
              {copied && (
                <Alert className="mt-2">
                  <AlertDescription>
                    Password copied to clipboard!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordTool;