import { prisma } from '../libs/prisma.js';
import PDFDocument from 'pdfkit';

export const generateCertificate = async (req, res) => {
    try {
        const { userId, opportunityId } = req.body;

        // Check if certificate already exists
        let certificate = await prisma.certificate.findFirst({
            where: {
                userId: parseInt(userId),
                opportunityId: parseInt(opportunityId)
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                opportunity: {
                    select: {
                        title: true
                    }
                }
            }
        });

        if (!certificate) {
            certificate = await prisma.certificate.create({
                data: {
                    userId: parseInt(userId),
                    opportunityId: parseInt(opportunityId),
                    certificateUrl: '' // Placeholder, will be updated
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    opportunity: {
                        select: {
                            title: true
                        }
                    }
                }
            });

            const certificateUrl = `/api/volunteer/certificates/download/${certificate.id}`;

            certificate = await prisma.certificate.update({
                where: { id: certificate.id },
                data: { certificateUrl },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    opportunity: {
                        select: {
                            title: true
                        }
                    }
                }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Certificate generated successfully',
            certificateUrl: certificate.certificateUrl,
            certificate: {
                id: certificate.id,
                volunteerName: certificate.user.name,
                volunteerEmail: certificate.user.email,
                opportunityTitle: certificate.opportunity.title,
                issuedAt: certificate.issuedAt,
                certificateUrl: certificate.certificateUrl
            }
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

export const downloadCertificate = async (req, res) => {
    try {
        const { id } = req.params;

        const certificate = await prisma.certificate.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
                opportunity: {
                    include: {
                        organization: true
                    }
                }
            }
        });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        // Create PDF document
        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margin: 40
        });

        // Headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=certificate-${certificate.id}.pdf`
        );

        doc.pipe(res);

        /* ======================
           Page constants (IMPORTANT)
        ====================== */
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const outerMargin = 20;
        const innerMargin = 50;
        const contentWidth = pageWidth - innerMargin * 2;

        /* ======================
           Background
        ====================== */
        doc.rect(0, 0, pageWidth, pageHeight).fill('#f9fafb');

        /* ======================
           Borders
        ====================== */
        // Outer border
        doc
            .lineWidth(8)
            .strokeColor('#4f46e5')
            .rect(
                outerMargin,
                outerMargin,
                pageWidth - outerMargin * 2,
                pageHeight - outerMargin * 2
            )
            .stroke();

        // Inner decorative border
        doc
            .lineWidth(1)
            .strokeColor('#e5e7eb')
            .rect(
                outerMargin + 8,
                outerMargin + 8,
                pageWidth - (outerMargin * 2 + 16),
                pageHeight - (outerMargin * 2 + 16)
            )
            .stroke();

        /* ======================
           Title
        ====================== */
        doc
            .font('Helvetica-Bold')
            .fontSize(30)
            .fillColor('#111827')
            .text(
                'Certificate of Completion',
                innerMargin,
                110,
                { width: contentWidth, align: 'center' }
            );

        /* ---- Proper underline (auto centered) ---- */
        const titleTextWidth = doc.widthOfString('Certificate of Completion');
        const underlineY = doc.y + 6;

        doc
            .moveTo((pageWidth - titleTextWidth) / 2, underlineY)
            .lineTo((pageWidth + titleTextWidth) / 2, underlineY)
            .lineWidth(2)
            .strokeColor('#4f46e5')
            .stroke();

        /* ======================
           Body Content
        ====================== */
        doc.y = underlineY + 30;

        doc
            .font('Helvetica')
            .fontSize(18)
            .fillColor('#374151')
            .text(
                'This is to certify that',
                innerMargin,
                doc.y,
                { width: contentWidth, align: 'center' }
            );

        doc.moveDown(0.8);

        doc
            .font('Helvetica-Bold')
            .fontSize(25)
            .fillColor('#4f46e5')
            .text(
                certificate.user.name,
                innerMargin,
                doc.y,
                { width: contentWidth, align: 'center' }
            );

        doc.moveDown(0.8);

        doc
            .font('Helvetica')
            .fontSize(17)
            .fillColor('#374151')
            .text(
                'has successfully completed the',
                innerMargin,
                doc.y,
                { width: contentWidth, align: 'center' }
            );

        doc.moveDown(0.8);

        doc
            .font('Helvetica-Bold')
            .fontSize(25)
            .fillColor('#111827')
            .text(
                certificate.opportunity.title,
                innerMargin,
                doc.y,
                { width: contentWidth, align: 'center' }
            );

        doc.moveDown(0.8);

        doc
            .font('Helvetica')
            .fontSize(16)
            .fillColor('#4b5563')
            .text(
                `Organized by ${certificate.opportunity.organization.name}`,
                innerMargin,
                doc.y,
                { width: contentWidth, align: 'center' }
            );

        /* ======================
           Recognition Statement
        ====================== */
        doc.moveDown(1.2);

        /* ======================
           Signatures (Bottom safe zone)
        ====================== */
        const signatureY = pageHeight - innerMargin - 80;
        const leftSigX = innerMargin + 120;
        const rightSigX = pageWidth - innerMargin - 320;

        doc
            .font('Helvetica')
            .fontSize(14)
            .fillColor('#111827')
            .text('__________________', leftSigX, signatureY)
            .text('Authorized Signature', leftSigX, signatureY + 18);

        doc
            .text('_________________', rightSigX, signatureY)
            .text('Program Coordinator', rightSigX, signatureY + 18);


        doc.end();


    } catch (error) {
        console.error('Download Certificate Error:', error);
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

        // Extract token from header to append to download URL
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

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

        // Deduplicate certificates based on opportunityId (keeping the latest one)
        const uniqueCertMap = new Map();
        for (const cert of certificates) {
            if (!uniqueCertMap.has(cert.opportunity.id)) {
                uniqueCertMap.set(cert.opportunity.id, cert);
            }
        }
        
        // Convert map back to array
        const uniqueCertificates = Array.from(uniqueCertMap.values());

        const formattedCertificates = uniqueCertificates.map(cert => {
            let url = cert.certificateUrl;

            // Fix legacy/mock URLs dynamically
            if (url && url.includes('api.example.com')) {
                url = `/api/volunteer/certificates/download/${cert.id}`;
            }

            return {
                id: cert.id,
                opportunityId: cert.opportunity.id,
                opportunityTitle: cert.opportunity.title,
                organizationName: cert.opportunity.organization.name,
                certificateUrl: url,
                issuedAt: cert.issuedAt
            };
        });

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

export const getOrgCertificates = async (req, res) => {
    try {
        const organizationId = req.user.id;

        const certificates = await prisma.certificate.findMany({
            where: {
                opportunity: {
                    organizationId: organizationId
                }
            },
            include: {
                user: {
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
            orderBy: { issuedAt: 'desc' }
        });

        // Deduplicate certificates
        const uniqueCertMap = new Map();
        for (const cert of certificates) {
            // Key based on user and opportunity to ensure one cert per user per opportunity
            const key = `${cert.user.id}-${cert.opportunity.id}`;
            if (!uniqueCertMap.has(key)) {
                uniqueCertMap.set(key, cert);
            }
        }
        
        const uniqueCertificates = Array.from(uniqueCertMap.values());

        const formattedCertificates = uniqueCertificates.map(cert => ({
            id: cert.id,
            volunteerName: cert.user.name,
            volunteerEmail: cert.user.email,
            opportunityTitle: cert.opportunity.title,
            issuedAt: cert.issuedAt,
            certificateUrl: `/api/volunteer/certificates/download/${cert.id}` // Use standardized URL
        }));

        res.status(200).json({
            success: true,
            data: formattedCertificates
        });
    } catch (error) {
        console.error('Get Org Certificates Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch organization certificates',
            error: error.message
        });
    }
};
