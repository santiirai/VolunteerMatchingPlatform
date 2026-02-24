import { prisma } from '../libs/prisma.js';

export const createOpportunity = async (req, res) => {
    try {
        const { title, description, requiredSkills, location, date } = req.body;
        const organizationId = req.user.id;

        if (!title || !date) {
            return res.status(400).json({
                success: false,
                message: 'Title and Date are required'
            });
        }

        const opportunity = await prisma.opportunity.create({
            data: {
                title,
                description,
                requiredSkills,
                location,
                date: new Date(date),
                organizationId
            }
        });

        res.status(201).json({
            success: true,
            message: 'Opportunity created successfully',
            data: opportunity
        });
    } catch (error) {
        console.error('Create Opportunity Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create opportunity',
            error: error.message
        });
    }
};

export const getOrgOpportunities = async (req, res) => {
    try {
        const organizationId = req.user.id;
        const opportunities = await prisma.opportunity.findMany({
            where: { organizationId },
            include: {
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform to match frontend expectation (applicants count)
        const formattedOpportunities = opportunities.map(opp => ({
            ...opp,
            applicants: opp._count.applications,
            status: new Date(opp.date) > new Date() ? 'Active' : 'Completed' // Simple status logic
        }));

        res.status(200).json({
            success: true,
            data: formattedOpportunities
        });
    } catch (error) {
        console.error('Get Org Opportunities Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch opportunities',
            error: error.message
        });
    }
};

export const getAllOpportunities = async (req, res) => {
    try {
        const { category, q } = req.query;
        const now = new Date();
        const where = {
            date: { gte: now }
        };

        if (category) {
            const c = String(category).trim();
            // Basic contains filters; case sensitivity depends on DB collation
            where.OR = [
                { title: { contains: c } },
                { description: { contains: c } },
                { requiredSkills: { contains: c } }
            ];
        }

        if (q) {
            const s = String(q).trim();
            where.OR = [
                ...(where.OR || []),
                { title: { contains: s } },
                { description: { contains: s } },
                { requiredSkills: { contains: s } }
            ];
        }

        const opportunities = await prisma.opportunity.findMany({
            where,
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { date: 'asc' }
        });

        const formattedOpportunities = opportunities.map(opp => ({
            ...opp,
            organizationName: opp.organization.name,
            applicants: opp._count.applications,
            status: 'Active'
        }));

        res.status(200).json({
            success: true,
            data: formattedOpportunities
        });
    } catch (error) {
        console.error('Get All Opportunities Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch opportunities',
            error: error.message
        });
    }
};
