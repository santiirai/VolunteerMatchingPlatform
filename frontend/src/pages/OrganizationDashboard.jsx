import React, { useState, useEffect } from 'react';
import { Heart, Building2, Users, Award, MessageCircle, Plus, Search, Filter, Menu, X, LogOut, Bell, Settings, Calendar, MapPin, Clock, CheckCircle, XCircle, Download, Send, Eye, Loader2 } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';

export default function OrganizationDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [chatUser, setChatUser] = useState(null);

    // State for data
    const [stats, setStats] = useState({
        name: "Organization",
        email: "",
        totalOpportunities: 0,
        activeVolunteers: 0,
        pendingApplications: 0,
        certificatesIssued: 0
    });
    const [opportunities, setOpportunities] = useState([]);
    const [applications, setApplications] = useState([]);

    // Forms
    const [opportunityForm, setOpportunityForm] = useState({
        title: '',
        description: '',
        requiredSkills: '',
        location: '',
        date: ''
    });

    const [messageForm, setMessageForm] = useState({
        content: ''
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

            const fetchResource = async (url, setter) => {
                try {
                    const res = await fetch(url, { headers });
                    if (res.ok) {
                        const data = await res.json();
                        setter(data.data);
                        return data.data;
                    }
                } catch (e) {
                    console.error(`Failed to fetch ${url}`, e);
                }
                return [];
            };

            // Fetch independently
            const oppsData = await fetchResource('/api/opportunities', setOpportunities);
            const appsData = await fetchResource('/api/applications', setApplications);

            // User Data
            try {
                const userRes = await fetch('/api/auth/me', { headers });
                if (userRes.ok) {
                    const userData = await userRes.json();

                    // Calculate stats
                    const pendingApps = appsData.filter(app => app.status === 'PENDING').length;
                    const activeVols = new Set(appsData.filter(app => app.status === 'ACCEPTED').map(app => app.volunteerId)).size;

                    setStats({
                        name: userData.data.user.name,
                        email: userData.data.user.email,
                        totalOpportunities: oppsData.length,
                        activeVolunteers: activeVols,
                        pendingApplications: pendingApps,
                        certificatesIssued: 0
                    });
                }
            } catch (e) {
                console.error('Failed to fetch user data', e);
            }

            // Fetch messages for badge (optional internal state)
            const msgsData = await fetchResource('/api/messages/conversations', (data) => {
                // calculating unread count could be stored in a ref or state if we add it
                // For now, let's just use it to toggle the red dot if we add state for it.
                // But we didn't add state for messages in OrgDashboard yet.
                // Let's add it or just skip this part to avoid adding state without declaring it.
            });
            // Actually, I need to add state for unread count if I want to show it.
            // Let's skip message fetching for now to avoid breaking state, or adding state.
            // Given the user didn't ask for it, maybe just stick to robust fetching.
            // Re-reading my previous thought: "I should apply the same robust fetching pattern".
            // I will stick to robust fetching only for now to be safe.
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setDataLoading(false);
        }
    };

    const handleCreateOpportunity = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/opportunities/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(opportunityForm)
            });

            if (!response.ok) throw new Error('Failed to create opportunity');

            alert('Opportunity created successfully!');
            setShowCreateModal(false);
            setOpportunityForm({ title: '', description: '', requiredSkills: '', location: '', date: '' });
            fetchDashboardData(); // Refresh list
        } catch (error) {
            alert('Error creating opportunity: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApplicationAction = async (applicationId, status) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/applications/${applicationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Failed to update application');

            alert(`Application ${status.toLowerCase()} successfully!`);
            // Update local state without full refresh for smoother UX
            setApplications(applications.map(app =>
                app.id === applicationId ? { ...app, status } : app
            ));
            // Also update stats if needed, but a refresh might be safer for consistency
            fetchDashboardData();
        } catch (error) {
            alert('Error updating application: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!selectedApplication) return;

        setLoading(true);
        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    receiverId: selectedApplication.volunteerId,
                    content: messageForm.content
                })
            });

            if (!response.ok) throw new Error('Failed to send message');

            alert('Message sent successfully!');
            setShowMessageModal(false);
            setMessageForm({ content: '' });
        } catch (error) {
            alert('Error sending message: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCertificate = async (application) => {
        setLoading(true);
        try {
            const response = await fetch('/api/certificates/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    userId: application.volunteerId,
                    opportunityId: application.opportunityId
                })
            });

            if (!response.ok) throw new Error('Failed to generate certificate');

            const data = await response.json();

            window.open(data.certificateUrl, '_blank');
            alert('Certificate generated successfully!');
        } catch (error) {
            alert('Error generating certificate: ' + error.message);
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
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 text-sm">ConnectGood</div>
                                <div className="text-xs text-gray-500">Organization</div>
                            </div>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {[
                        { id: 'overview', icon: Building2, label: 'Overview' },
                        { id: 'opportunities', icon: Heart, label: 'Opportunities' },
                        { id: 'applications', icon: Users, label: 'Applications' },
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
                        onClick={() => window.location.href = '/login'}
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
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
                                    { label: 'Total Opportunities', value: stats.totalOpportunities, icon: Heart, color: 'from-pink-500 to-rose-600' },
                                    { label: 'Active Volunteers', value: stats.activeVolunteers, icon: Users, color: 'from-blue-500 to-cyan-600' },
                                    { label: 'Pending Applications', value: stats.pendingApplications, icon: Clock, color: 'from-yellow-500 to-orange-600' },
                                    { label: 'Certificates Issued', value: stats.certificatesIssued, icon: Award, color: 'from-purple-500 to-indigo-600' }
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
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {applications.length > 0 ? applications.slice(0, 3).map((app) => (
                                        <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {app.volunteerName[0]}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{app.volunteerName}</div>
                                                    <div className="text-sm text-gray-500">Applied for {app.opportunityTitle}</div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    )) : (
                                        <div className="text-center text-gray-500 py-4">No recent activity</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'opportunities' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Manage Opportunities</h2>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Create Opportunity</span>
                                </button>
                            </div>

                            <div className="grid gap-6">
                                {opportunities.length > 0 ? opportunities.map((opp) => (
                                    <div key={opp.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">{opp.title}</h3>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{opp.location || 'Remote'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{new Date(opp.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Users className="w-4 h-4" />
                                                        <span>{opp.applicants || 0} applicants</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${opp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {opp.status}
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
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                                        <p className="text-gray-500">No opportunities created yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Manage Applications</h2>
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search volunteers..."
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <Filter className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Volunteer</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Opportunity</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Skills</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {applications.length > 0 ? applications.map((app) => (
                                            <tr key={app.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                                                            {app.volunteerName[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{app.volunteerName}</div>
                                                            <div className="text-sm text-gray-500">{app.appliedDate}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{app.opportunityTitle}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{app.skills}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        {app.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApplicationAction(app.id, 'ACCEPTED')}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                    title="Accept"
                                                                >
                                                                    <CheckCircle className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleApplicationAction(app.id, 'REJECTED')}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle className="w-5 h-5" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {app.status === 'ACCEPTED' && (
                                                            <button
                                                                onClick={() => handleApplicationAction(app.id, 'COMPLETED')}
                                                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                                            >
                                                                Mark Complete
                                                            </button>
                                                        )}
                                                        {app.status === 'COMPLETED' && (
                                                            <button
                                                                onClick={() => handleGenerateCertificate(app)}
                                                                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-1"
                                                            >
                                                                <Award className="w-4 h-4" />
                                                                <span>Certificate</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setChatUser({
                                                                    id: app.volunteerId,
                                                                    name: app.volunteerName
                                                                });
                                                                setActiveTab('messages');
                                                            }}
                                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                            title="Send Message"
                                                        >
                                                            <MessageCircle className="w-5 h-5" />
                                                        </button>
                                                    </div>
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
                        <div className="h-[calc(100vh-140px)]">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
                            <ChatInterface
                                currentUser={{ role: 'ORGANIZATION', user: { id: localStorage.getItem('userId') } }}
                                startChatWith={chatUser}
                            />
                        </div>
                    )}

                    {activeTab === 'certificates' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Certificates</h2>
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Generate certificates for completed volunteers from the Applications tab</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Create New Opportunity</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={opportunityForm.title}
                                    onChange={(e) => setOpportunityForm({ ...opportunityForm, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g., Beach Cleanup Drive"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={opportunityForm.description}
                                    onChange={(e) => setOpportunityForm({ ...opportunityForm, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Describe the volunteer opportunity..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
                                <input
                                    type="text"
                                    value={opportunityForm.requiredSkills}
                                    onChange={(e) => setOpportunityForm({ ...opportunityForm, requiredSkills: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g., Teamwork, Physical fitness"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    value={opportunityForm.location}
                                    onChange={(e) => setOpportunityForm({ ...opportunityForm, location: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g., Santa Monica Beach"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={opportunityForm.date}
                                    onChange={(e) => setOpportunityForm({ ...opportunityForm, date: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={handleCreateOpportunity}
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            <span>Create Opportunity</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showMessageModal && selectedApplication && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Send Message</h3>
                            <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600">To: <span className="font-semibold text-gray-900">{selectedApplication.volunteerName}</span></p>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                value={messageForm.content}
                                onChange={(e) => setMessageForm({ content: e.target.value })}
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Type your message..."
                            />

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleSendMessage}
                                    disabled={loading || !messageForm.content}
                                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Send Message</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowMessageModal(false)}
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
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm">Applicants</span>
                                    </div>
                                    <div className="font-semibold">{selectedOpportunity.applicants || 0}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">Status</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block mt-1 ${selectedOpportunity.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {selectedOpportunity.status}
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

                            <div className="pt-6 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
