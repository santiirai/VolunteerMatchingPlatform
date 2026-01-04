import { prisma } from '../libs/prisma.js';

export const generateCertificate = async (req, res) => {
    try {
        const { userId, opportunityId } = req.body;

        // Mock certificate generation URL
        // In a real app, this would verify completion and generate a PDF
        const certificateUrl = `https://api.example.com/certificates/${userId}-${opportunityId}.pdf`;

        const certificate = await prisma.certificate.create({
            data: {
                userId: parseInt(userId),
                opportunityId: parseInt(opportunityId),
                certificateUrl
            }
        });

        res.status(201).json({
            success: true,
            message: 'Certificate generated successfully',
            certificateUrl
        });
    } catch (error) {
        console.error('Generate Certificate Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate certificate',
            error: error.message
        });
    }
};

export const getMyCertificates = async (req, res) => {
    try {
        const userId = req.user.id;

        const certificates = await prisma.certificate.findMany({
            where: { userId },
            include: {
                opportunity: {
                    select: {
                        id: true,
                        title: true,
                        organization: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { issuedAt: 'desc' }
        });

        const formattedCertificates = certificates.map(cert => ({
            id: cert.id,
            opportunityId: cert.opportunity.id,
            opportunityTitle: cert.opportunity.title,
            organizationName: cert.opportunity.organization.name,
            certificateUrl: cert.certificateUrl,
            issuedAt: cert.issuedAt
        }));

        res.status(200).json({
            success: true,
            data: formattedCertificates
        });
    } catch (error) {
        console.error('Get My Certificates Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch certificates',
            error: error.message
        });
    }
};
