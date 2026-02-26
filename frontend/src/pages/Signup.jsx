import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, MapPin, Briefcase, Heart, Building2, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function RoleBasedSignup() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    skills: '',
    location: ''
  });
  const [focusedField, setFocusedField] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      value: 'VOLUNTEER',
      label: 'Volunteer',
      icon: Heart,
      description: 'Join opportunities and make a difference',
      color: 'from-pink-500 to-rose-600'
    },
    {
      value: 'ORGANIZATION',
      label: 'Organization',
      icon: Building2,
      description: 'Post opportunities and find volunteers',
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
          skills: formData.skills.trim() || null,
          location: formData.location.trim() || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Store token in localStorage
      if (data.data?.token) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('userRole', data.data.user.role);
        localStorage.setItem('userId', data.data.user.id);
      }

      // Show success message
      alert('Account created successfully!');

      // Redirect based on role
      if (data.data?.user?.role === 'VOLUNTEER') {
        window.location.href = '/volunteer-dashboard';
      } else if (data.data?.user?.role === 'ORGANIZATION') {
        window.location.href = '/organization-dashboard';
      }

    } catch (err) {
      setError(err.message || 'An error occurred during signup');
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
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Create Your Account</h2>
            <p className="text-gray-500">
              {step === 1 ? 'Choose your role to get started' : 'Complete your profile'}
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
                    disabled={loading}
                    className="group relative p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-xl text-left disabled:cursor-not-allowed disabled:opacity-50"
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

          {/* Step 2: Form Details */}
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
                    Signing up as {formData.role === 'VOLUNTEER' ? 'Volunteer' : 'Organization'}
                  </span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-purple-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loading}
                >
                  Change
                </button>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {formData.role === 'VOLUNTEER' ? 'Full Name' : 'Organization Name'} <span className="text-red-500">*</span>
                </label>
                <div className={`relative transition-all duration-200 ${focusedField === 'name' ? 'scale-[1.01]' : ''}`}>
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField('')}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={formData.role === 'VOLUNTEER' ? 'Peace Huang' : 'Organization Name'}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
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
                    placeholder="peace@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
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
                <p className="text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              {/* Skills Field (Volunteer only) */}
              {formData.role === 'VOLUNTEER' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Skills (Optional)</label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'skills' ? 'scale-[1.01]' : ''}`}>
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('skills')}
                      onBlur={() => setFocusedField('')}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="e.g., Teaching, Coding, Healthcare"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Separate multiple skills with commas</p>
                </div>
              )}

              {/* Location Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location (Optional)</label>
                <div className={`relative transition-all duration-200 ${focusedField === 'location' ? 'scale-[1.01]' : ''}`}>
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('location')}
                    onBlur={() => setFocusedField('')}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="City, State"
                    disabled={loading}
                  />
                </div>
              </div>


              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
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

          {/* Sign In Link */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-600 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
