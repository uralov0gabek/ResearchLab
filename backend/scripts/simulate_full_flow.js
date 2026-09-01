const http = require('http');

const API_BASE = 'http://localhost:5000/api';

async function fetchQuestions() {
  return new Promise((resolve, reject) => {
    http.get(`${API_BASE}/questions`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) throw new Error(`HTTP Error: ${res.statusCode} - ${data}`);
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function submitResponses(userId, answers) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ userId, answers });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/responses',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode !== 201 && res.statusCode !== 200) throw new Error(`HTTP Error: ${res.statusCode} - ${data}`);
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log("🚀 Starting A-Z API Flow Test...");
  try {
    console.log("1️⃣ Fetching questions from Backend API...");
    const questions = await fetchQuestions();
    console.log(`✅ Successfully fetched ${questions.length} questions.`);

    console.log("\n2️⃣ Generating simulated answers...");
    const answers = {};
    for (const q of questions) {
      if (q.type === 'short_text') answers[q.id] = "Simulated Text Answer";
      else if (q.type === 'number_input') answers[q.id] = 42;
      else if (q.type === 'single_choice' && q.options && q.options.length > 0) {
        answers[q.id] = q.options[0];
      }
      else if (q.type === 'lottery') {
        answers[q.id] = {
          type: 'lottery_response',
          choices: ['A', 'B', 'A'],
          selectedValues: { "0": "A", "1": "B", "2": "A" },
          rows: q.options && Array.isArray(q.options) ? q.options : []
        };
      }
      else if (q.type === 'matrix') {
        answers[q.id] = { "Statement 1": "Option 1" };
      }
      else if (q.type === 'slider') {
        answers[q.id] = 50;
      }
      else {
        answers[q.id] = "Test Value";
      }
    }
    console.log("✅ Simulated answers payload created.");

    console.log("\n3️⃣ Submitting response payload to backend...");
    const userId = "auto-test-user-" + Date.now();
    const result = await submitResponses(userId, answers);
    console.log(`✅ Successfully submitted! Response:`, result);

    console.log("\n🎉 All A-Z Tests Passed Successfully! Platform is fully operational.");
  } catch (error) {
    console.error("\n❌ Test Failed!");
    console.error(error.message);
    process.exit(1);
  }
}

runTests();
