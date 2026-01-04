import { prisma } from '../libs/prisma.js';

export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Receiver and content are required'
            });
        }

        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId: parseInt(receiverId),
                content
            }
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

export const getMyMessages = async (req, res) => {
    try {
        const userId = req.user.id;

        const messages = await prisma.message.findMany({
            where: {
                receiverId: userId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            senderId: msg.sender.id,
            senderName: msg.sender.name,
            content: msg.content,
            isRead: msg.isRead,
            createdAt: msg.createdAt
        }));

        res.status(200).json({
            success: true,
            data: formattedMessages
        });
    } catch (error) {
        console.error('Get My Messages Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};
