const http = require('node:http');
const fs = require('node:fs');

const requests = new Map();
const heldResponses = new Map();
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const id = url.searchParams.get('id');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Cache-Control', 'no-store');

  if (url.pathname === '/slow' && id) {
    const state = requests.get(id) ?? { started: true, closed: false, count: 0, active: 0 };
    state.count++;
    state.active++;
    state.closed = false;
    requests.set(id, state);
    const held = heldResponses.get(id) ?? new Set();
    held.add(response);
    heldResponses.set(id, held);
    response.setHeader('Content-Type', url.searchParams.get('type') ?? 'application/octet-stream');
    response.flushHeaders();
    response.on('close', () => {
      held.delete(response);
      state.active--;
      state.closed = state.active === 0;
    });
  } else if (url.pathname === '/finish' && id) {
    for (const held of heldResponses.get(id) ?? []) {
      held.end('sometext');
    }
    response.end('finished');
  } else if (url.pathname === '/empty') {
    response.setHeader('Content-Type', 'text/plain');
    response.end('');
  } else if (url.pathname === '/state' && id) {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(requests.get(id) ?? { started: false, closed: false }));
  } else {
    response.statusCode = 404;
    response.end();
  }
});

server.listen(0, '127.0.0.1', () => {
  fs.writeFileSync(process.argv[2], String(server.address().port));
});
