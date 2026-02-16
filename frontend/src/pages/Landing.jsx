import React, { useState } from 'react';
import { Heart, Building2, Users, Award, MessageCircle, Search, ArrowRight, CheckCircle, Menu, X, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const features = [
        {
            icon: Search,
            title: 'Find Opportunities',
            description: 'Browse and discover volunteer opportunities that match your skills and interests.'
        },
        {
            icon: Users,
            title: 'Connect & Apply',
            description: 'Apply to opportunities and connect directly with organizations making a difference.'
        },
        {
            icon: MessageCircle,
            title: 'Direct Messaging',
            description: 'Communicate seamlessly with organizations and volunteers through our platform.'
        },
        {
            icon: Award,
            title: 'Earn Certificates',
            description: 'Download certificates after completing your volunteer work as proof of contribution.'
        }
    ];

    const howItWorks = [
        {
            step: '1',
            title: 'Sign Up',
            description: 'Choose your role as a volunteer or organization and create your account.',
            color: 'bg-pink-500'
        },
        {
            step: '2',
            title: 'Explore or Post',
            description: 'Volunteers browse opportunities. Organizations post and manage opportunities.',
            color: 'bg-purple-500'
        },
        {
            step: '3',
            title: 'Connect & Collaborate',
            description: 'Apply to opportunities, message each other, and make an impact together.',
            color: 'bg-indigo-500'
        },
        {
            step: '4',
            title: 'Get Recognition',
            description: 'Volunteers receive certificates after completing their volunteer work.',
            color: 'bg-blue-500'
        }
    ];

    const stats = [
        { number: '10K+', label: 'Active Volunteers' },
        { number: '500+', label: 'Organizations' },
        { number: '5K+', label: 'Opportunities' },
        { number: '15K+', label: 'Certificates Issued' }
    ];

    return (
        <div className="min-h-screen brand-bg">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                Volunify
                            </span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors">Features</a>
                            <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-colors">How It Works</a>
                            <a href="#about" className="text-gray-700 hover:text-purple-600 transition-colors">About</a>
                            <Link to="/login" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/signup" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                                Get Started
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-gray-700"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 space-y-3">
                            <a href="#features" className="block text-gray-700 hover:text-purple-600 transition-colors">Features</a>
                            <a href="#how-it-works" className="block text-gray-700 hover:text-purple-600 transition-colors">How It Works</a>
                            <a href="#about" className="block text-gray-700 hover:text-purple-600 transition-colors">About</a>
                            <Link to="/login" className="block w-full text-left text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/signup" className="block w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold text-center">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center space-y-8 surface p-10">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                            Connect Volunteers with
                            <span className="block stat-number">
                                Meaningful Opportunities
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Join our platform to find volunteer opportunities, make an impact in your community,
                            and earn certificates for your contributions.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/signup" className="group brand-button px-8 py-4 font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2">
                                <Heart className="w-5 h-5" />
                                <span>Join as Volunteer</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/signup" className="group outline-button px-8 py-4 font-semibold text-lg transition-all duration-200 flex items-center space-x-2">
                                <Building2 className="w-5 h-5" />
                                <span>Register Organization</span>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold stat-number">
                                        {stat.number}
                                    </div>
                                    <div className="text-gray-600 mt-2">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-xl text-gray-600">
                            Powerful features to connect volunteers and organizations
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="group p-6 surface hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                    <div className="w-12 h-12 brand-button rounded-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600">
                            Get started in four simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {howItWorks.map((item, index) => (
                            <div key={index} className="relative">
                                <div className="surface p-6 hover:shadow-xl transition-shadow">
                                    <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4`}>
                                        {item.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-600">{item.description}</p>
                                </div>
                                {index < howItWorks.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                        <ArrowRight className="w-8 h-8 text-purple-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Organizations Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center space-x-2 brand-badge px-4 py-2 rounded-full">
                                <Building2 className="w-5 h-5" />
                                <span className="font-semibold">For Organizations</span>
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900">
                                Manage Your Volunteer Programs Effortlessly
                            </h2>
                            <p className="text-xl text-gray-600">
                                Create opportunities, review applications, communicate with volunteers,
                                and track contributions all in one place.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start space-x-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">Post unlimited volunteer opportunities</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">Review and manage applications efficiently</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">Direct messaging with volunteers</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">Issue certificates to volunteers</span>
                                </li>
                            </ul>
                            <Link to="/signup" className="inline-block brand-button px-8 py-4 font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                                Register Your Organization
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="glass rounded-2xl p-8 h-96 flex items-center justify-center">
                                <Building2 className="w-48 h-48 text-indigo-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Volunteers Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative order-2 md:order-1">
                            <div className="glass rounded-2xl p-8 h-96 flex items-center justify-center">
                                <Heart className="w-48 h-48 text-pink-400" />
                            </div>
                        </div>
                        <div className="space-y-6 order-1 md:order-2">
                            <div className="inline-flex items-center space-x-2 brand-badge px-4 py-2 rounded-full">
                                <Heart className="w-5 h-5" />
                                <span className="font-semibold">For Volunteers</span>
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900">
                                Find Your Perfect Volunteering Match
                            </h2>
                            <p className="text-xl text-gray-600">
                                Discover opportunities that align with your skills and passion.
                                Make a difference and get recognized for your contributions.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start space-x-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">Browse diverse volunteer opportunities</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">Apply with one click</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">Message organizations directly</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    <span className="text-gray-700">Download certificates after completion</span>
                                </li>
                            </ul>
                            <Link to="/signup" className="inline-block brand-button px-8 py-4 font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                                Start Volunteering Today
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                        Ready to Make a Difference?
                    </h2>
                    <p className="text-xl text-gray-700">
                        Join thousands of volunteers and organizations creating positive change in communities.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup" className="outline-button px-8 py-4 font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                            Sign Up Now
                        </Link>
                        <button className="outline-button px-8 py-4 font-semibold text-lg hover:bg-purple-50 transition-all duration-200">
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Heart className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold">Volunify</span>
                            </div>
                            <p className="text-gray-400">
                                Connecting volunteers with meaningful opportunities to create positive change.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Platform</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">For Volunteers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">For Organizations</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Legal</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 Volunify. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
