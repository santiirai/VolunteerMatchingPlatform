import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn, Heart, Building2, AlertCircle, Loader2 } from 'lucide-react';

export default function RoleBasedLogin() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      value: 'VOLUNTEER',
      label: 'Volunteer',
      icon: Heart,
      description: 'Access volunteer opportunities',
      color: 'from-pink-500 to-rose-600'
    },
    {
      value: 'ORGANIZATION',
      label: 'Organization',
      icon: Building2,
      description: 'Manage your opportunities',
      color: 'from-blue-500 to-indigo-600'
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on input change
  };

  const handleRoleSelect = (roleValue) => {
    setFormData({
      ...formData,
      role: roleValue
    });
    setStep(2);
    setError('');
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          rememberMe: rememberMe
        }),
      });

      const jsonResponse = await response.json();

      if (!response.ok) {
        throw new Error(jsonResponse.error || jsonResponse.message || 'Login failed');
      }

      // Store token in localStorage or cookie
      if (jsonResponse.success && jsonResponse.data) {
        const { token, user } = jsonResponse.data;

        if (token) {
          localStorage.setItem('authToken', token);
          localStorage.setItem('userRole', user.role);
          localStorage.setItem('userId', user.id);
        }

        // Redirect based on role
        if (user.role === 'VOLUNTEER') {
          window.location.href = '/volunteer/dashboard';
        } else if (user.role === 'ORGANIZATION') {
          window.location.href = '/organization/dashboard';
        }
      }

    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full mb-2">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500">
              {step === 1 ? 'Select your account type to continue' : 'Sign in to your account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`w-12 h-1 rounded transition-all duration-300 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-4">
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-xl text-left"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${role.color} rounded-lg mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{role.label}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                    <div className="absolute top-4 right-4 w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-purple-500 transition-colors"></div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Login Form */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Selected Role Display */}
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  {formData.role === 'VOLUNTEER' ? (
                    <Heart className="w-6 h-6 text-pink-600" />
                  ) : (
                    <Building2 className="w-6 h-6 text-blue-600" />
                  )}
                  <span className="font-semibold text-gray-800">
                    Logging in as {formData.role === 'VOLUNTEER' ? 'Volunteer' : 'Organization'}
                  </span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-purple-600 hover:underline"
                  disabled={loading}
                >
                  Change
                </button>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="john@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <button
                  className="text-sm text-purple-600 hover:underline font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <LogIn className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Back Button */}
              <button
                onClick={() => setStep(1)}
                className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                Back to role selection
              </button>
            </div>
          )}

          {/* Sign Up Link */}
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-600 font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
