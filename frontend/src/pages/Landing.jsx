import React, { useState } from 'react';
import { Heart, Building2, ArrowRight, CheckCircle, Menu, X, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import logooo from '../assets/logooo.png'

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const features = [
        {
            image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
            title: 'Find Opportunities',
            description: 'Browse and discover volunteer opportunities that match your skills and interests.'
        },
        {
            image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop',
            title: 'Connect & Apply',
            description: 'Apply to opportunities and connect directly with organizations making a difference.'
        },
        {
            image: 'https://static.vecteezy.com/system/resources/previews/022/385/788/non_2x/abbreviation-dm-direct-message-png.png',
            title: 'Direct Messaging',
            description: 'Communicate seamlessly with organizations and volunteers through our platform.'
        },
        {
            image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200&auto=format&fit=crop',
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
                        <div className="flex items-center space-x-3">
                            <img src={logooo} alt="Logo" className="w-10 h-10 rounded-lg object-cover" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
                            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Volunify</span>
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
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left space-y-8 surface p-10">
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
                                <span>Join as Volunteer</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/signup" className="group outline-button px-8 py-4 font-semibold text-lg transition-all duration-200 flex items-center space-x-2">
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
                        <div className="relative">
                            <img
                                src="https://nourishcowichan.ca/wp-content/uploads/2024/02/hands-old-young-supporting-each-other.jpg"
                                alt="Hero volunteering"
                                className="w-full h-[480px] object-cover rounded-2xl shadow-lg"
                                onError={(e) => { e.currentTarget.src = 'https://dummyimage.com/1600x480/eeeeee/aaaaaa.png&text=Volunteering'; }}
                            />
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
                            return (
                                <div key={index} className="group overflow-hidden rounded-xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                                    <img src={feature.image} alt={feature.title} className="w-full h-40 object-cover" onError={(e) => { e.currentTarget.src = 'https://dummyimage.com/1200x160/eeeeee/aaaaaa.png&text=Image'; }} />
                                    <div className="p-6 bg-white">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                        <p className="text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore by Category</h2>
                        <p className="text-xl text-gray-600">Find opportunities tailored to your interests</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { key: 'Education', image: 'data:image/jpeg;base64,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' },
                            { key: 'Health', image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=1200&auto=format&fit=crop' },
                            { key: 'Disaster Relief', image: 'https://spweb-uploads.s3.theark.cloud/2013/04/volunteer-blog-1174US-C-273.jpg' },
                            { key: 'Community Development', image: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?q=80&w=1200&auto=format&fit=crop' },
                            { key: 'Environment', image: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?q=80&w=1200&auto=format&fit=crop' },
                            { key: 'Animal Welfare', image: 'https://images.unsplash.com/photo-1518378188025-22bd89516ee2?q=80&w=1200&auto=format&fit=crop' }
                        ].map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => { window.location.href = '/signup'; }}
                                className="group text-left overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-xl transition-all duration-300"
                                title={`Browse ${cat.key} opportunities`}
                            >
                                <div className="relative">
                                    <img src={cat.image} alt={cat.key} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.currentTarget.src = 'https://dummyimage.com/600x160/eeeeee/aaaaaa.png&text=Category'; }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3 text-white text-lg font-semibold">{cat.key}</div>
                                </div>
                                <div className="p-4 text-gray-600">
                                    Discover roles in {cat.key.toLowerCase()} — mentors, coordinators, field support and more.
                                </div>
                            </button>
                        ))}
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
                            <img
                                src="https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=1600&auto=format&fit=crop"
                                alt="Organizations"
                                className="w-full h-96 object-cover rounded-2xl shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* For Volunteers Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative order-2 md:order-1">
                            <img
                                src="https://images.unsplash.com/photo-1488521789041-141b4f9cbd62?q=80&w=1600&auto=format&fit=crop"
                                alt="Volunteers"
                                className="w-full h-96 object-cover rounded-2xl shadow-lg"
                            />
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
