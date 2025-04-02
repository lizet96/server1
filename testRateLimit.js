// Use dynamic import for node-fetch
const main = async () => {
  const fetch = (await import('node-fetch')).default;

  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJCc09VNlZURHJSc0ZyTkgydWpNbCIsImVtYWlsIjoiZ29uemFsZXpAZ21haWwuY29tIiwiaWF0IjoxNzQzNjM1ODY0LCJleHAiOjE3NDM2Mzk0NjR9.wMuUsHY5bnY8cG4ijdGydPrNsDGug1adkPp1uae5Irc';
  const URL = 'https://server1-z2k2.onrender.com/api/info/getInfo';

  async function spamRequests() {
    for (let i = 1; i <= 150; i++) {
      try {
        const res = await fetch(URL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const body = await res.text();
        console.log(`Request ${i}: ${res.status} - ${body}`);
      } catch (err) {
        console.error(`Error en request ${i}:`, err.message);
      }
    }
  }

  await spamRequests();
};

main().catch(err => console.error('Error in main:', err));
