import React, { useState, useEffect } from 'react';
import { Heart, User, Award, MessageCircle, Search, Filter, Menu, LogOut, Bell, Settings, Calendar, MapPin, Clock, Building2, Send, Download, Eye, Loader2, X, CheckCircle } from 'lucide-react';

export default function VolunteerDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    // State for data
    const [stats, setStats] = useState({
        name: "Volunteer",
        email: "",
        totalApplications: 0,
        acceptedApplications: 0,
        pendingApplications: 0,
        certificatesEarned: 0
    });
    const [opportunities, setOpportunities] = useState([]);
    const [applications, setApplications] = useState([]);
    const [messages, setMessages] = useState([]);
    const [certificates, setCertificates] = useState([]);

    // Forms
    const [applicationForm, setApplicationForm] = useState({
        message: ''
    });

    // Fetch Data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setDataLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Parallel fetching
            const [oppsRes, appsRes, msgsRes, certsRes, userRes] = await Promise.all([
                fetch('/api/volunteer/opportunities/browse', { headers }),
                fetch('/api/volunteer/applications/my', { headers }),
                fetch('/api/volunteer/messages/my', { headers }),
                fetch('/api/volunteer/certificates/my', { headers }),
                fetch('/api/auth/me', { headers })
            ]);

            if (oppsRes.ok && appsRes.ok && msgsRes.ok && certsRes.ok && userRes.ok) {
                const oppsData = await oppsRes.json();
                const appsData = await appsRes.json();
                const msgsData = await msgsRes.json();
                const certsData = await certsRes.json();
                const userData = await userRes.json();

                setOpportunities(oppsData.data);
                setApplications(appsData.data);
                setMessages(msgsData.data);
                setCertificates(certsData.data);

                // Calculate stats
                const pendingApps = appsData.data.filter(app => app.status === 'PENDING').length;
                const acceptedApps = appsData.data.filter(app => app.status === 'ACCEPTED' || app.status === 'COMPLETED').length;

                setStats({
                    name: userData.data.user.name,
                    email: userData.data.user.email,
                    totalApplications: appsData.data.length,
                    acceptedApplications: acceptedApps,
                    pendingApplications: pendingApps,
                    certificatesEarned: certsData.data.length
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setDataLoading(false);
        }
    };

    const handleApplyToOpportunity = async () => {
        if (!selectedOpportunity) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/volunteer/opportunities/${selectedOpportunity.id}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ message: applicationForm.message })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to apply');
            }

            alert('Application submitted successfully!');
            setShowApplyModal(false);
            setApplicationForm({ message: '' });
            setSelectedOpportunity(null);
            fetchDashboardData(); // Refresh data
        } catch (error) {
            alert('Error applying: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'ACCEPTED': return 'bg-green-100 text-green-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Check if volunteer has already applied to an opportunity
    const hasApplied = (opportunityId) => {
        return applications.some(app => app.opportunityId === opportunityId);
    };

    if (dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 fixed h-full z-30`}>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    {sidebarOpen && (
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 text-sm">ConnectGood</div>
                                <div className="text-xs text-gray-500">Volunteer</div>
                            </div>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {[
                        { id: 'overview', icon: User, label: 'Overview' },
                        { id: 'opportunities', icon: Heart, label: 'Opportunities' },
                        { id: 'applications', icon: CheckCircle, label: 'My Applications' },
                        { id: 'messages', icon: MessageCircle, label: 'Messages' },
                        { id: 'certificates', icon: Award, label: 'Certificates' }
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.id
                                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
                    <button
                        onClick={() => {
                            localStorage.removeItem('authToken');
                            window.location.href = '/login';
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{stats.name}</h1>
                            <p className="text-sm text-gray-500">{stats.email}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="relative p-2 text-gray-500 hover:text-gray-700">
                                <Bell className="w-6 h-6" />
                                {messages.length > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>
                            <button className="p-2 text-gray-500 hover:text-gray-700">
                                <Settings className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Applications', value: stats.totalApplications, icon: CheckCircle, color: 'from-blue-500 to-cyan-600' },
                                    { label: 'Accepted', value: stats.acceptedApplications, icon: Heart, color: 'from-green-500 to-emerald-600' },
                                    { label: 'Pending', value: stats.pendingApplications, icon: Clock, color: 'from-yellow-500 to-orange-600' },
                                    { label: 'Certificates Earned', value: stats.certificatesEarned, icon: Award, color: 'from-purple-500 to-indigo-600' }
                                ].map((stat, index) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                                            <div className="text-sm text-gray-500">{stat.label}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Applications</h3>
                                <div className="space-y-4">
                                    {applications.length > 0 ? applications.slice(0, 3).map((app) => (
                                        <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {app.organizationName[0]}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{app.opportunityTitle}</div>
                                                    <div className="text-sm text-gray-500">{app.organizationName}</div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    )) : (
                                        <div className="text-center text-gray-500 py-4">No applications yet</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'opportunities' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Browse Opportunities</h2>
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search opportunities..."
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <Filter className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-6">
                                {opportunities.length > 0 ? opportunities.map((opp) => (
                                    <div key={opp.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">{opp.title}</h3>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                                    <div className="flex items-center space-x-1">
                                                        <Building2 className="w-4 h-4" />
                                                        <span>{opp.organizationName}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{opp.location || 'Remote'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{new Date(opp.date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 line-clamp-2">{opp.description}</p>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                Active
                                            </span>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedOpportunity(opp);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>View Details</span>
                                            </button>
                                            {hasApplied(opp.id) ? (
                                                <button
                                                    disabled
                                                    className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed flex items-center space-x-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>Applied</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOpportunity(opp);
                                                        setShowApplyModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    <span>Apply Now</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                                        <p className="text-gray-500">No opportunities available at the moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Opportunity</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Organization</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Applied On</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {applications.length > 0 ? applications.map((app) => (
                                            <tr key={app.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">{app.opportunityTitle}</div>
                                                    <div className="text-sm text-gray-500">{app.location || 'Remote'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{app.organizationName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{new Date(app.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{app.appliedDate}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                    No applications found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                {messages.length > 0 ? (
                                    <div className="divide-y divide-gray-200">
                                        {messages.map((msg) => (
                                            <div key={msg.id} className="p-6 hover:bg-gray-50">
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {msg.senderName[0]}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="font-semibold text-gray-900">{msg.senderName}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {new Date(msg.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-600">{msg.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No messages yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'certificates' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">My Certificates</h2>
                            <div className="grid gap-6">
                                {certificates.length > 0 ? certificates.map((cert) => (
                                    <div key={cert.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                                    <Award className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{cert.opportunityTitle}</div>
                                                    <div className="text-sm text-gray-500">{cert.organizationName}</div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        Issued on {new Date(cert.issuedAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => window.open(cert.certificateUrl, '_blank')}
                                                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>Download</span>
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No certificates earned yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {showApplyModal && selectedOpportunity && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Apply to Opportunity</h3>
                            <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600">Applying for: <span className="font-semibold text-gray-900">{selectedOpportunity.title}</span></p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Message (Optional)</label>
                                <textarea
                                    value={applicationForm.message}
                                    onChange={(e) => setApplicationForm({ message: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Tell the organization why you're interested..."
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleApplyToOpportunity}
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Submit Application</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowApplyModal(false)}
                                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDetailsModal && selectedOpportunity && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">{selectedOpportunity.title}</h3>
                            <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                                        <Building2 className="w-4 h-4" />
                                        <span className="text-sm">Organization</span>
                                    </div>
                                    <div className="font-semibold">{selectedOpportunity.organizationName}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">Date</span>
                                    </div>
                                    <div className="font-semibold">{new Date(selectedOpportunity.date).toLocaleDateString()}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">Location</span>
                                    </div>
                                    <div className="font-semibold">{selectedOpportunity.location || 'Remote'}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">Status</span>
                                    </div>
                                    <span className="px-2 py-1 rounded-full text-xs font-semibold inline-block mt-1 bg-green-100 text-green-700">
                                        Active
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                <p className="text-gray-600 leading-relaxed">
                                    {selectedOpportunity.description || 'No description provided.'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedOpportunity.requiredSkills ? (
                                        selectedOpportunity.requiredSkills.split(',').map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                                {skill.trim()}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500">None specified</span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Close
                                </button>
                                {hasApplied(selectedOpportunity.id) ? (
                                    <button
                                        disabled
                                        className="px-6 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed font-medium flex items-center space-x-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Applied</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            setShowApplyModal(true);
                                        }}
                                        className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                                    >
                                        Apply Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
