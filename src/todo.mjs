import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// The store is deliberately module-local/in-memory.  Other task endpoints can
// use this same map when they are added.
export const tasks = new Map();

const MAX_BODY_SIZE = 1024 * 1024;

function sendJson(response, statusCode, value, headers = {}) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    ...headers,
  });
  response.end(JSON.stringify(value));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;

    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      size += Buffer.byteLength(chunk);
      if (size > MAX_BODY_SIZE) {
        reject(Object.assign(new Error('Request body is too large'), { statusCode: 413 }));
        request.resume();
        return;
      }
      body += chunk;
    });
    request.on('end', () => {
      if (size > MAX_BODY_SIZE) return;
      try {
        const value = JSON.parse(body);
        if (value === null || Array.isArray(value) || typeof value !== 'object') {
          throw new Error('Task must be a JSON object');
        }
        resolve(value);
      } catch (error) {
        error.statusCode = 400;
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

/** Create a server backed by the supplied in-memory task store. */
export function createTodoServer(store = tasks) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const path = url.pathname;
    const taskMatch = /^\/tasks\/([^/]+)$/.exec(path);

    if (request.method === 'GET' && path === '/tasks') {
      const completed = url.searchParams.get('completed');
      const dueDate = url.searchParams.get('dueDate');
      let result = [...store.values()];

      // Query parameters are strings, while completed is stored as a boolean.
      // Only recognised boolean values filter the result; an absent parameter
      // leaves the corresponding field unfiltered.
      if (completed === 'true' || completed === 'false') {
        const isCompleted = completed === 'true';
        result = result.filter((task) => task.completed === isCompleted);
      }

      if (dueDate !== null) {
        result = result.filter((task) => task.dueDate === dueDate);
      }

      sendJson(response, 200, result);
      return;
    }

    if (request.method === 'GET' && taskMatch) {
      let id;
      try {
        id = decodeURIComponent(taskMatch[1]);
      } catch {
        sendJson(response, 404, { error: 'Not found' });
        return;
      }

      const task = store.get(id);
      if (task === undefined) {
        sendJson(response, 404, { error: 'Not found' });
        return;
      }

      sendJson(response, 200, task);
      return;
    }

    if (request.method === 'DELETE' && taskMatch) {
      let id;
      try {
        id = decodeURIComponent(taskMatch[1]);
      } catch {
        sendJson(response, 404, { error: 'Not found' });
        return;
      }

      if (!store.delete(id)) {
        sendJson(response, 404, { error: 'Not found' });
        return;
      }

      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method === 'PUT' && taskMatch) {
      let id;
      try {
        id = decodeURIComponent(taskMatch[1]);
      } catch {
        sendJson(response, 404, { error: 'Not found' });
        return;
      }

      const existingTask = store.get(id);
      if (existingTask === undefined) {
        sendJson(response, 404, { error: 'Not found' });
        return;
      }

      try {
        const input = await readJson(request);
        // Preserve the resource identity from the URL, regardless of an id
        // supplied in the request body.
        const updatedTask = { ...existingTask, ...input, id };
        store.set(id, updatedTask);
        sendJson(response, 200, updatedTask);
      } catch (error) {
        sendJson(response, error.statusCode ?? 400, { error: error.message || 'Invalid JSON' });
      }
      return;
    }

    if (request.method !== 'POST' || request.url !== '/tasks') {
      sendJson(response, 404, { error: 'Not found' });
      return;
    }

    try {
      const input = await readJson(request);
      const id = randomUUID();
      // Keep additional task fields while ensuring the shared fields always
      // have sensible values.  A client-supplied id is never trusted.
      const task = {
        ...input,
        id,
        title: input.title ?? '',
        completed: input.completed ?? false,
        dueDate: input.dueDate ?? null,
      };

      store.set(id, task);
      sendJson(response, 201, task, { location: `/tasks/${id}` });
    } catch (error) {
      sendJson(response, error.statusCode ?? 400, { error: error.message || 'Invalid JSON' });
    }
  });
}

// Only listen when this file is run as the application, so importing it in a
// test (or from future endpoints) does not leave an open HTTP handle.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const port = Number(process.env.PORT) || 3000;
  const server = createTodoServer();
  server.listen(port, () => {
    console.log(`Todo server listening on port ${port}`);
  });
}
