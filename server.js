'use strict';

/**
 * 面经本 · 本地服务
 * 零依赖：只使用 Node.js 内置模块。
 * 数据保存在 data/mianjing.json，写入采用「临时文件 + 原子替换」。
 */

const http = require('node:http');
const fs = require('node:fs');
const fsp = fs.promises;
const path = require('node:path');
const { exec } = require('node:child_process');

const HOST = '127.0.0.1';
const DEFAULT_PORT = 8788;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;
let activePort = PORT;
let portRetries = 0;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'mianjing.json');
const BACKUP_FILE = path.join(DATA_DIR, 'mianjing.backup.json');
const MAX_BODY = 8 * 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function sendText(res, status, text) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(text);
}

async function readData() {
  try {
    const raw = await fsp.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.interviews)) {
      throw new Error('数据文件缺少 interviews 数组');
    }
    return parsed;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { version: 1, interviews: [], knowledge: [], updatedAt: new Date().toISOString() };
    }
    throw err;
  }
}

async function writeData(data) {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  try {
    await fsp.copyFile(DATA_FILE, BACKUP_FILE);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  const tmp = DATA_FILE + '.tmp';
  const body = JSON.stringify(data, null, 2) + '\n';
  await fsp.writeFile(tmp, body, 'utf8');
  await fsp.rename(tmp, DATA_FILE);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let done = false;
    const chunks = [];
    req.on('data', (chunk) => {
      if (done) return;
      size += chunk.length;
      if (size > MAX_BODY) {
        done = true;
        const err = new Error('数据超过 8 MB，无法保存');
        err.status = 413;
        reject(err);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (done) return;
      done = true;
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', (err) => {
      if (done) return;
      done = true;
      reject(err);
    });
  });
}

async function serveStatic(req, res, pathname) {
  let rel;
  try {
    rel = decodeURIComponent(pathname);
  } catch (err) {
    return sendText(res, 400, 'Bad Request');
  }
  if (rel === '/' || rel === '') rel = '/index.html';

  const filePath = path.resolve(PUBLIC_DIR, '.' + rel);
  const relative = path.relative(PUBLIC_DIR, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return sendText(res, 403, 'Forbidden');
  }

  let stat;
  try {
    stat = await fsp.stat(filePath);
  } catch (err) {
    return sendText(res, 404, 'Not Found');
  }
  if (!stat.isFile()) return sendText(res, 404, 'Not Found');

  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': stat.size,
    'Cache-Control': ext === '.html' ? 'no-store' : 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  });
  if (req.method === 'HEAD') return res.end();
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => res.destroy());
  stream.pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://' + HOST + ':' + PORT);

    if (url.pathname === '/api/data') {
      if (req.method === 'GET') {
        try {
          return sendJson(res, 200, await readData());
        } catch (err) {
          console.error('[读取失败]', err.message);
          return sendJson(res, 500, { error: '读取数据失败：' + err.message });
        }
      }

      if (req.method === 'PUT' || req.method === 'POST') {
        let data;
        try {
          const text = await readBody(req);
          data = JSON.parse(text);
          if (!data || typeof data !== 'object' || !Array.isArray(data.interviews)) {
            throw new Error('数据格式不正确：缺少 interviews 数组');
          }
        } catch (err) {
          return sendJson(res, err.status || 400, { error: err.message || '请求格式不正确' });
        }
        try {
          await writeData(data);
          return sendJson(res, 200, { ok: true });
        } catch (err) {
          console.error('[写入失败]', err.message);
          return sendJson(res, 500, { error: '写入数据失败：' + err.message });
        }
      }

      res.setHeader('Allow', 'GET, PUT');
      return sendJson(res, 405, { error: 'Method Not Allowed' });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return sendText(res, 405, 'Method Not Allowed');
    }

    return serveStatic(req, res, url.pathname);
  } catch (err) {
    console.error('[服务器错误]', err);
    if (!res.headersSent) return sendJson(res, 500, { error: '服务器内部错误' });
    res.end();
  }
});

server.on('error', (err) => {
  const retryable = err.code === 'EADDRINUSE' || err.code === 'EACCES';
  if (retryable && !process.env.PORT && portRetries < 12) {
    portRetries += 1;
    const blockedPort = activePort;
    activePort += 1;
    console.warn('端口 ' + blockedPort + ' 不可用（' + err.code + '），尝试 ' + activePort + ' …');
    setTimeout(() => server.listen(activePort, HOST), 80);
    return;
  }
  if (err.code === 'EADDRINUSE') {
    console.error('\n[启动失败] 端口 ' + activePort + ' 已被占用。');
    console.error('可能已经打开了一个面经本，或者别的程序占用了这个端口。');
    console.error('可以设置环境变量 PORT 换一个端口，例如：set PORT=8899 && node server.js\n');
  } else {
    console.error('\n[启动失败]', err.message, '\n');
  }
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  const address = server.address();
  const actualPort = address && typeof address === 'object' ? address.port : PORT;
  const url = 'http://' + HOST + ':' + actualPort + '/';
  console.log('');
  console.log('  面经本 · 本地服务已启动');
  console.log('  地址：' + url);
  console.log('  数据：' + DATA_FILE);
  console.log('  停止：按 Ctrl + C');
  console.log('');

  if (process.env.OPEN_BROWSER === '1' && process.platform === 'win32') {
    exec('start "" "' + url + '"', { windowsHide: true }, () => {});
  }
});
