const BASE_URL = 'http://localhost:5000/api';

async function debugOpportunities() {
    console.log('--- Starting Opportunity Debugging ---');

    const timestamp = Date.now();
    const email = `opp_debug_${timestamp}@example.com`;

    // 1. Create Org
    console.log('Creating Org...');
    const orgRes = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Opp Debug Org', email, password: 'password123', role: 'ORGANIZATION' })
    });
    const orgData = await orgRes.json();
    const orgToken = orgData.data.token;

    // 2. Create Opportunity (Future Date)
    console.log('Creating Future Opportunity...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    const oppRes = await fetch(`${BASE_URL}/org/opportunities`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${orgToken}`
        },
        body: JSON.stringify({
            title: `Future Opportunity ${timestamp}`,
            description: 'Test Description',
            requiredSkills: 'Node.js',
            location: 'Remote',
            date: futureDate.toISOString()
        })
    });
    const oppData = await oppRes.json();
    console.log('Future Opp Created:', oppRes.status, oppData.data?.title);

    // 3. Create Opportunity (Past Date) - to verify it's NOT returned
    console.log('Creating Past Opportunity...');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7); // 7 days ago
    await fetch(`${BASE_URL}/org/opportunities`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${orgToken}`
        },
        body: JSON.stringify({
            title: `Past Opportunity ${timestamp}`,
            description: 'Test Description',
            requiredSkills: 'Node.js',
            location: 'Remote',
            date: pastDate.toISOString()
        })
    });

    // 4. Create Volunteer
    console.log('Creating Volunteer...');
    const volRes = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Vol Debug', email: `vol_${timestamp}@example.com`, password: 'password123', role: 'VOLUNTEER' })
    });
    const volData = await volRes.json();
    const volToken = volData.data.token;

    // 5. Fetch Opportunities as Volunteer
    console.log('Fetching Opportunities as Volunteer...');
    const browseRes = await fetch(`${BASE_URL}/volunteer/opportunities/browse`, {
        headers: { 'Authorization': `Bearer ${volToken}` }
    });
    const browseData = await browseRes.json();

    console.log(`Found ${browseData.data?.length} opportunities.`);
    if (browseData.data) {
        browseData.data.forEach(o => {
            console.log(`- ${o.title} (${o.date})`);
        });
    }

}

debugOpportunities();
