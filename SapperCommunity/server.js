const {spl2nl} = require('./sapperchain/sapperSpl2nl.js');
const {nl2spl} = require('./sapperchain/sapperNl2spl.js');
const {require2json} = require('./sapperchain/sapperRequire2json.js');
const {formAssit} = require('./sapperchain/sapperForm.js');
const express = require('express');
const fs = require('fs');
const https = require('https');
const http = require('http');
const request = require('request');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());
const path = require('path');
let OpenaiKey = ''
app.use(express.static(__dirname + '/build'))
app.get('/sappercommunity', function(req, res) {
  res.sendFile(path.join(__dirname, 'build/sappercommunity', 'sappercommunity.html'));
});

app.use(express.static(path.join(__dirname, 'build')));
app.get('/sappercommunity/workspace', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});



app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// 前端项目的部署位置
app.use(express.static('front'));

app.post('/sappercommunity/sapperchian/getreqCount', (req, res) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const reqCountData = readReqCountData();
  const userData = reqCountData[ipAddress] || { count: 0, lastAccess: null };
    // Call the spl2nl function with the provided data
    res.json({ data: 20 - userData.count }); // Return the result as a JSON response
});

async function checkApiKeyValidity(apiKey) {
  const url = "https://api.openai.com/v1/engines";
  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    if (response.ok) {
      console.log("API key is valid. Available engines:", data.data);
      return true;
    } else {
      console.error("API key is invalid.");
      return false;
    }
  } catch (error) {
    console.error("Error checking API key:", error);
    return false;
  }
}

app.post('/sappercommunity/sapperchain/getResFromGPT', async (req, res) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const reqCountData = readReqCountData();
  const userData = reqCountData[ipAddress] || { count: 0, lastAccess: null };
  let apiKey = req.body.apiKey;
  console.log(req.body.apiKey);
  const messages = req.body.messages;

  if (!(await checkApiKeyValidity(apiKey)) && userData.count < 20) {
    userData.count += 1;
    reqCountData[ipAddress] = userData;
    saveReqCountData(reqCountData);
    apiKey = OpenaiKey;
  }

  const options = {
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'POST',
    headers: {
      "Authorization": 'Bearer ' + apiKey,
      "Content-Type": "application/json",
    },
    json: {
      "model": "gpt-3.5-turbo",
      "stream": true,
      "messages": messages
    }
  };

  const proxyReq = request(options);
  proxyReq.on('response', function(response) {
    response.pipe(res);
  });
});

app.post('/sappercommunity/sapperchian/sapperSpl2nl', async (req, res) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const reqCountData = readReqCountData();
  const userData = reqCountData[ipAddress] || { count: 0, lastAccess: null };

  let apiKey = req.body.apiKey;
  const NL = req.body.NL;
  const oldSPL = req.body.oldSPL;
  const newSPL = req.body.newSPL;

  if (!(await checkApiKeyValidity(apiKey)) && userData.count < 20) {
    userData.count += 1;
    reqCountData[ipAddress] = userData;
    saveReqCountData(reqCountData);
    apiKey = OpenaiKey;
  }
  // Call the spl2nl function with the provided data
  spl2nl(NL, oldSPL, newSPL, apiKey)
    .then((result) => {
      console.log(result); // Assuming the result is logged for testing purposes
      res.json({ data: result }); // Return the result as a JSON response
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while processing the request.' });
    });
});

app.post('/sappercommunity/sapperchian/sapperNl2spl', async (req, res) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const reqCountData = readReqCountData();
  const userData = reqCountData[ipAddress] || { count: 0, lastAccess: null };

//   jsonData = sapperNl2spl.nl2spl(data['oldNL'], data['newNL'], data['oldSPL'])
  let apiKey = req.body.apiKey;
  const oldN = req.body.oldNL;
  const newNL = req.body.newNL;
  const oldSPL = req.body.oldSPL;
  if (!(await checkApiKeyValidity(apiKey)) && userData.count < 20) {
    userData.count += 1;
    reqCountData[ipAddress] = userData;
    saveReqCountData(reqCountData);
    apiKey = OpenaiKey;
  }
  // Call the spl2nl function with the provided data
  nl2spl(oldNL, newNL, oldSPL, apiKey)
    .then((result) => {
      console.log(result); // Assuming the result is logged for testing purposes
      res.json({ data: result }); // Return the result as a JSON response
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while processing the request.' });
    });
});

app.post('/sappercommunity/sapperchian/sapperRequire2json',async (req, res) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const reqCountData = readReqCountData();
  const userData = reqCountData[ipAddress] || { count: 0, lastAccess: null };

//   jsonData = sapperNl2spl.nl2spl(data['oldNL'], data['newNL'], data['oldSPL'])
  let apiKey = req.body.apiKey;
  const requirement = req.body.requirement;
  if (!(await checkApiKeyValidity(apiKey)) && userData.count < 20) {
    userData.count += 1;
    reqCountData[ipAddress] = userData;
    saveReqCountData(reqCountData);
    apiKey = OpenaiKey;
  }
  // Call the spl2nl function with the provided data
  require2json(requirement, apiKey)
    .then((result) => {
      console.log(result); // Assuming the result is logged for testing purposes
      res.json({ data: result }); // Return the result as a JSON response
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while processing the request.' });
    });
});

app.post('/sappercommunity/sapperchian/FormFiller', async (req, res) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const reqCountData = readReqCountData();
  const userData = reqCountData[ipAddress] || { count: 0, lastAccess: null };
//   jsonData = sapperNl2spl.nl2spl(data['oldNL'], data['newNL'], data['oldSPL'])
jsonData = sapperForm.form_assit(data['query'], data['form'], data['flag'])
  let apiKey = req.body.apiKey;
  const query = req.body.query;
  const form = req.body.form;
  if (!(await checkApiKeyValidity(apiKey)) && userData.count < 20) {
    userData.count += 1;
    reqCountData[ipAddress] = userData;
    saveReqCountData(reqCountData);
    apiKey = OpenaiKey;
  }
  // Call the spl2nl function with the provided data
  formAssit(query, form, apiKey)
    .then((result) => {
      console.log(result); // Assuming the result is logged for testing purposes
      res.json({ data: result }); // Return the result as a JSON response
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while processing the request.' });
    });
});

// app.use(express.static(__dirname + '/build'))
// app.get('/sappercommunity/workspace', function(req, res) {
// //   res.sendFile(path.join(__dirname, 'build', 'index.html'));
//     res.sendFile(path.join(__dirname, 'build/sappercommunity', 'sappercommunity.html'));
// });

// 处理其他路由或API请求

const reqCountFilePath = path.join(__dirname, 'reqCount.json');

function readReqCountData() {
  try {
    const data = fs.readFileSync(reqCountFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading reqCount.json:', error.message);
    return {};
  }
}

function saveReqCountData(data) {
  try {
    fs.writeFileSync(reqCountFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving reqCount.json:', error.message);
  }
}


const options = {
  key: fs.readFileSync('privkey.key'),  // 替换为您的私钥文件路径
  cert: fs.readFileSync('fullchain.pem')  // 替换为您的证书文件路径
};

https.createServer(options, app).listen(8001, () => {
  console.log('HTTPS server running on port 8001');
});

http.createServer((req, res) => {
  const { host } = req.headers;
  res.writeHead(2001, { 'Location': `https://${host}${req.url}` });
  res.end();
}).listen(8002, () => {
  console.log('HTTP server running on port 8002');
});
