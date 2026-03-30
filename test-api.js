const axios = require('axios');
const fs = require('fs');

async function testApi() {
  try {
    const res = await axios.get('http://localhost:5001/api/medical-certificates/all');
    fs.writeFileSync('out3.json', JSON.stringify(res.data, null, 2), 'utf-8');
    console.log("Written to out3.json");
  } catch (err) {
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testApi();
