'use strict'

const request = require('supertest')
const should = require('should')
const cache = require('..')
const koa = require('koa')

describe('## default options', () => {
  let app = koa()
  app.use(cache())
  app.use(function* () {
    if (this.path === '/app/json') {
      this.body = {
        name: 'hello'
      }
      return
    }
    if (this.path === '/app/text') {
      this.body = 'hello'
      return
    }
    if (this.path === '/app/type') {
      this.body = 'default type: html'
      this.res.removeHeader('Content-Type')
    }
    if (this.path === '/app/html') {
      this.body = '<h1>hello</h1>'
      if (this.query.v) {
        this.body += this.query.v
      }
      return
    }
    if (this.path === '/app/buffer') {
      this.body = new Buffer('buffer')
      return
    }
    if (this.path === '/app/500') {
      this.status = 500
      this.body = 'no cache'
    }
  })

  app = app.listen(3001)

  describe('# no cache', () => {
    it('get json', (done) => {
      request(app)
        .get('/app/json')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('application/json; charset=utf-8')
          should.not.exist(res.headers['x-koa-redis-cache'])
          res.body.name.should.equal('hello')
          done()
        })
    })

    it('get text', (done) => {
      request(app)
        .get('/app/text')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('text/plain; charset=utf-8')
          should.not.exist(res.headers['x-koa-redis-cache'])
          res.text.should.equal('hello')
          done()
        })
    })

    it('get type', (done) => {
      request(app)
        .get('/app/type')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          should.not.exist(res.headers['content-type'])
          should.not.exist(res.headers['x-koa-redis-cache'])
          res.text.should.equal('default type: html')
          done()
        })
    })

    it('get html', (done) => {
      request(app)
        .get('/app/html')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('text/html; charset=utf-8')
          should.not.exist(res.headers['x-koa-redis-cache'])
          res.text.should.equal('<h1>hello</h1>')
          done()
        })
    })

    it('get buffer', (done) => {
      request(app)
        .get('/app/buffer')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('application/octet-stream')
          should.not.exist(res.headers['x-koa-redis-cache'])
          res.text.should.equal('buffer')
          done()
        })
    })
  })

  describe('# from cache', () => {
    it('get json', (done) => {
      request(app)
        .get('/app/json')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('application/json; charset=utf-8')
          res.headers['x-koa-redis-cache'].should.equal('true')
          res.body.name.should.equal('hello')
          done()
        })
    })

    it('get text', (done) => {
      request(app)
        .get('/app/text')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('text/plain; charset=utf-8')
          res.headers['x-koa-redis-cache'].should.equal('true')
          res.text.should.equal('hello')
          done()
        })
    })

    it('get type', (done) => {
      request(app)
        .get('/app/type')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('text/html; charset=utf-8')
          res.headers['x-koa-redis-cache'].should.equal('true')
          res.text.should.equal('default type: html')
          done()
        })
    })

    it('get html', (done) => {
      request(app)
        .get('/app/html')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('text/html; charset=utf-8')
          res.headers['x-koa-redis-cache'].should.equal('true')
          res.text.should.equal('<h1>hello</h1>')
          done()
        })
    })

    it('get buffer', (done) => {
      request(app)
        .get('/app/buffer')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('application/octet-stream')
          res.headers['x-koa-redis-cache'].should.equal('true')
          res.text.should.equal('buffer')
          done()
        })
    })
  })

  describe('# different params', () => {
    it('no cache', (done) => {
      request(app)
        .get('/app/html?v=1')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('text/html; charset=utf-8')
          should.not.exist(res.headers['x-koa-redis-cache'])
          res.text.should.equal('<h1>hello</h1>1')
          done()
        })
    })

    it('from cache', (done) => {
      request(app)
        .get('/app/html?v=1')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('text/html; charset=utf-8')
          res.headers['x-koa-redis-cache'].should.equal('true')
          res.text.should.equal('<h1>hello</h1>1')
          done()
        })
    })

    it('no cache', (done) => {
      request(app)
        .get('/app/html?v=2')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('text/html; charset=utf-8')
          should.not.exist(res.headers['x-koa-redis-cache'])
          res.text.should.equal('<h1>hello</h1>2')
          done()
        })
    })

    it('no cache', (done) => {
      request(app)
        .get('/app/html?v=3')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('text/html; charset=utf-8')
          should.not.exist(res.headers['x-koa-redis-cache'])
          res.text.should.equal('<h1>hello</h1>3')
          done()
        })
    })

    it('from cache', (done) => {
      request(app)
        .get('/app/html?v=3')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(200)
          res.headers['content-type'].should.equal('text/html; charset=utf-8')
          res.headers['x-koa-redis-cache'].should.equal('true')
          res.text.should.equal('<h1>hello</h1>3')
          done()
        })
    })
  })

  describe('# not 200, no cache', () => {
    it('first: no cache', (done) => {
      request(app)
        .get('/app/500')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(500)
          res.headers['content-type'].should.equal('text/plain; charset=utf-8')
          should.not.exist(res.headers['x-koa-redis-cache'])
          res.text.should.equal('no cache')
          done()
        })
    })

    it('second: no cache', (done) => {
      request(app)
        .get('/app/500')
        .end((err, res) => {
          should.not.exist(err)
          res.status.should.equal(500)
          res.headers['content-type'].should.equal('text/plain; charset=utf-8')
          should.not.exist(res.headers['x-koa-redis-cache'])
          res.text.should.equal('no cache')
          done()
        })
    })
  })
})
