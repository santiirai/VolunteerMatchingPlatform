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


/**
 * Get list of people the user has chatted with
 */
export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all messages where user is sender or receiver
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                sender: { select: { id: true, name: true, email: true, role: true } },
                receiver: { select: { id: true, name: true, email: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Extract unique contacts
        const contactsMap = new Map();

        messages.forEach(msg => {
            const isSender = msg.senderId === userId;
            const contact = isSender ? msg.receiver : msg.sender;

            if (!contactsMap.has(contact.id)) {
                contactsMap.set(contact.id, {
                    ...contact,
                    lastMessage: msg.content,
                    lastMessageTime: msg.createdAt,
                    unreadCount: (!isSender && !msg.isRead) ? 1 : 0
                });
            } else {
                const existing = contactsMap.get(contact.id);
                if (!isSender && !msg.isRead) {
                    existing.unreadCount += 1;
                }
            }
        });

        res.status(200).json({
            success: true,
            data: Array.from(contactsMap.values())
        });
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations',
            error: error.message
        });
    }
};

/**
 * Get full chat history with a specific user
 */
export const getMessagesWithUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = parseInt(req.params.userId);

        if (!otherUserId) {
            return res.status(400).json({ success: false, message: 'User ID required' });
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            include: {
                sender: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                senderId: otherUserId,
                receiverId: userId,
                isRead: false
            },
            data: { isRead: true }
        });

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};
