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
                        email: true
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
            skills: 'N/A', // Schema doesn't strictly have skills per application, could fetch from user profile if needed
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
