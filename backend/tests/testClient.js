/**
 * In-Memory HTTP Test Client for Express
 * Allows full integration testing of Express routes, middlewares, and controllers
 * in isolated sandbox environments where localhost TCP sockets are restricted.
 */

const http = require('node:http');
const { Duplex } = require('node:stream');

class MockSocket extends Duplex {
  constructor(options) {
    super(options);
    this.remoteAddress = '127.0.0.1';
    this.remotePort = 50000;
  }

  _read() {}

  _write(chunk, encoding, callback) {
    callback();
  }
}

class TestRequest {
  constructor(app, method, url) {
    this.app = app;
    this.method = method.toUpperCase();
    this.url = url;
    this.headers = {
      'content-type': 'application/json',
      host: 'localhost'
    };
    this.data = null;
  }

  set(field, val) {
    this.headers[field.toLowerCase()] = val;
    return this;
  }

  send(body) {
    this.data = body;
    return this;
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  execute() {
    return new Promise((resolve, reject) => {
      const payloadString = this.data
        ? (typeof this.data === 'string' ? this.data : JSON.stringify(this.data))
        : '';

      const socket = new MockSocket();
      const req = new http.IncomingMessage(socket);
      req.method = this.method;
      req.url = this.url;
      req.httpVersion = '1.1';
      req.httpVersionMajor = 1;
      req.httpVersionMinor = 1;

      for (const [k, v] of Object.entries(this.headers)) {
        req.headers[k.toLowerCase()] = v;
      }
      if (payloadString) {
        req.headers['content-length'] = Buffer.byteLength(payloadString).toString();
      }

      const res = new http.ServerResponse(req);
      let resBody = '';

      const originalWrite = res.write.bind(res);
      res.write = (chunk, encoding, callback) => {
        if (chunk) resBody += chunk.toString();
        return originalWrite(chunk, encoding, callback);
      };

      const originalEnd = res.end.bind(res);
      res.end = (chunk, encoding, callback) => {
        if (chunk) resBody += chunk.toString();
        originalEnd(chunk, encoding, callback);

        let parsed = resBody;
        try {
          parsed = JSON.parse(resBody);
        } catch (_) {}

        resolve({
          statusCode: res.statusCode,
          status: res.statusCode,
          body: parsed,
          text: resBody,
          headers: res.getHeaders()
        });
      };

      try {
        this.app.handle(req, res);
        if (payloadString) {
          req.push(Buffer.from(payloadString));
        }
        req.push(null);
      } catch (err) {
        reject(err);
      }
    });
  }
}

function request(app) {
  return {
    get: (url) => new TestRequest(app, 'GET', url),
    post: (url) => new TestRequest(app, 'POST', url),
    put: (url) => new TestRequest(app, 'PUT', url),
    patch: (url) => new TestRequest(app, 'PATCH', url),
    delete: (url) => new TestRequest(app, 'DELETE', url)
  };
}

module.exports = request;
