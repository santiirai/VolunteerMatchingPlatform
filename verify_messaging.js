
const BASE_URL = 'http://localhost:5000/api';

async function testMessaging() {
    console.log('--- Starting Messaging Verification ---');

    // Helper to create user
    const createUser = async (role, name) => {
        const email = `msg_test_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
        const res = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: 'password123', role })
        });
        const data = await res.json();
        return { ...data.data.user, token: data.data.token };
    };

    try {
        // 1. Create Organization
        const org = await createUser('ORGANIZATION', 'Org One');
        console.log(`Created Org: ${org.email}`);

        // 2. Create Volunteer
        const vol = await createUser('VOLUNTEER', 'Vol One');
        console.log(`Created Vol: ${vol.email}`);

        // 3. Org sends message to Vol
        console.log('\n--- Org Sending Message ---');
        const sendRes = await fetch(`${BASE_URL}/messages/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${org.token}`
            },
            body: JSON.stringify({ receiverId: vol.id, content: 'Hello Volunteer!' })
        });
        const sendData = await sendRes.json();
        console.log('Send Status:', sendRes.status);
        if (!sendRes.ok) console.log(sendData);

        // 4. Vol checks conversations
        console.log('\n--- Vol Checking Conversations ---');
        const volConvRes = await fetch(`${BASE_URL}/volunteer/messages/conversations`, {
            headers: { 'Authorization': `Bearer ${vol.token}` }
        });
        const volConvData = await volConvRes.json();
        console.log('Vol Conversations:', volConvData.data.length);
        if (volConvData.data.length > 0) {
            console.log('Latest msg:', volConvData.data[0].lastMessage);
        }

        // 5. Vol replies
        console.log('\n--- Vol Replying ---');
        const replyRes = await fetch(`${BASE_URL}/volunteer/messages/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${vol.token}`
            },
            body: JSON.stringify({ receiverId: org.id, content: 'Hello Org, thanks for reaching out!' })
        });
        console.log('Reply Status:', replyRes.status);

        // 6. Org checks chat history
        console.log('\n--- Org Checking Chat History ---');
        const historyRes = await fetch(`${BASE_URL}/messages/${vol.id}`, {
            headers: { 'Authorization': `Bearer ${org.token}` }
        });
        const historyData = await historyRes.json();
        console.log('Chat History Length:', historyData.data.length);
        historyData.data.forEach(msg => {
            console.log(`[${msg.senderId === org.id ? 'Org' : 'Vol'}]: ${msg.content}`);
        });

    } catch (e) {
        console.error('Test Failed:', e);
    }
}

testMessaging();
