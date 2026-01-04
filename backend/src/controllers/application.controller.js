import { prisma } from '../libs/prisma.js';

export const getOrgApplications = async (req, res) => {
    try {
        const organizationId = req.user.id;

        const applications = await prisma.application.findMany({
            where: {
                opportunity: {
                    organizationId: organizationId
                }
            },
            include: {
                volunteer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        skills: true
                    }
                },
                opportunity: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format for frontend
        const formattedApplications = applications.map(app => ({
            id: app.id,
            volunteerId: app.volunteer.id,
            volunteerName: app.volunteer.name,
            opportunityId: app.opportunity.id,
            opportunityTitle: app.opportunity.title,
            skills: app.volunteer.skills || 'Not specified',
            status: app.status,
            appliedDate: app.createdAt.toISOString().split('T')[0]
        }));

        res.status(200).json({
            success: true,
            data: formattedApplications
        });
    } catch (error) {
        console.error('Get Applications Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: error.message
        });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const organizationId = req.user.id;

        // Verify ownership
        const application = await prisma.application.findUnique({
            where: { id: parseInt(id) },
            include: { opportunity: true }
        });

        if (!application || application.opportunity.organizationId !== organizationId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this application'
            });
        }

        const updatedApplication = await prisma.application.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.status(200).json({
            success: true,
            message: 'Application status updated',
            data: updatedApplication
        });
    } catch (error) {
        console.error('Update Application Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update application',
            error: error.message
        });
    }
};

export const applyToOpportunity = async (req, res) => {
    try {
        const { opportunityId } = req.params;
        const { message } = req.body;
        const volunteerId = req.user.id;

        // Check if already applied
        const existingApplication = await prisma.application.findFirst({
            where: {
                opportunityId: parseInt(opportunityId),
                volunteerId
            }
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this opportunity'
            });
        }

        const application = await prisma.application.create({
            data: {
                opportunityId: parseInt(opportunityId),
                volunteerId,
                message: message || null
            }
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: application
        });
    } catch (error) {
        console.error('Apply to Opportunity Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit application',
            error: error.message
        });
    }
};

export const getVolunteerApplications = async (req, res) => {
    try {
        const volunteerId = req.user.id;

        const applications = await prisma.application.findMany({
            where: { volunteerId },
            include: {
                opportunity: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        location: true,
                        date: true,
                        organization: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedApplications = applications.map(app => ({
            id: app.id,
            opportunityId: app.opportunity.id,
            opportunityTitle: app.opportunity.title,
            opportunityDescription: app.opportunity.description,
            location: app.opportunity.location,
            date: app.opportunity.date,
            organizationId: app.opportunity.organization.id,
            organizationName: app.opportunity.organization.name,
            status: app.status,
            appliedDate: app.createdAt.toISOString().split('T')[0],
            message: app.message
        }));

        res.status(200).json({
            success: true,
            data: formattedApplications
        });
    } catch (error) {
        console.error('Get Volunteer Applications Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: error.message
        });
    }
};
