const http = require('http');
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data.json');

function loadData() {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.createReadStream(path.join(__dirname, 'public', 'index.html')).pipe(res);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/items') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(loadData()));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/items') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const item = JSON.parse(body);
        const data = loadData();
        data.push({ prompt: item.prompt || '', usecase: item.usecase || '' });
        saveData(data);
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(item));
      } catch (e) {
        res.statusCode = 400;
        res.end('Invalid JSON');
      }
    });
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

