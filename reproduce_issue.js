
const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
    const testUser = {
        name: 'Test User',
        email: 'test' + Date.now() + '@example.com',
        password: 'password123',
        role: 'VOLUNTEER'
    };

    console.log('Testing with user:', testUser.email);

    // 1. Signup
    console.log('\n--- Attempting Signup ---');
    try {
        const signupRes = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const signupData = await signupRes.json();
        console.log('Signup Status:', signupRes.status);
        console.log('Signup Body:', JSON.stringify(signupData, null, 2));

        if (!signupRes.ok) {
            console.error('Signup failed, cannot proceed to login test (unless user exists)');
        }
    } catch (e) {
        console.error('Signup error:', e.message);
    }

    // 2. Login
    console.log('\n--- Attempting Login ---');
    try {
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Body:', JSON.stringify(loginData, null, 2));
    } catch (e) {
        console.error('Login error:', e.message);
    }

    // 3. Login with wrong password
    console.log('\n--- Attempting Login (Wrong Password) ---');
    try {
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: 'wrongpassword'
            })
        });
        console.log('Login (WrongPW) Status:', loginRes.status);
    } catch (e) {
        console.error('Login (WrongPW) error:', e.message);
    }
}

testAuth();
