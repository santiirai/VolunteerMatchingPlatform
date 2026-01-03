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
