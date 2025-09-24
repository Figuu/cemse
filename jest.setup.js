import '@testing-library/jest-dom'

// Mock fetch and related APIs for Node.js environment
global.fetch = global.fetch || jest.fn()
global.Request = global.Request || class Request {
  constructor(url, options = {}) {
    this.url = url
    this.method = options.method || 'GET'
    this.headers = options.headers || {}
    this._body = options.body
  }

  async json() {
    return JSON.parse(this._body || '{}')
  }
}

global.Response = global.Response || class Response {
  constructor(body, options = {}) {
    this._body = body
    this.status = options.status || 200
    this.statusText = options.statusText || 'OK'
    this.headers = options.headers || {}
  }

  async json() {
    return JSON.parse(this._body || '{}')
  }
}

global.Headers = global.Headers || class Headers {
  constructor(init = {}) {
    this._headers = init
  }
}

// Mock URL constructor
global.URL = global.URL || class URL {
  constructor(url) {
    this.href = url
    this.searchParams = new URLSearchParams()
  }
}

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'YOUTH',
      },
    },
    status: 'authenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(url, options = {}) {
      this.url = url
      this.method = options.method || 'GET'
      this.headers = new Headers(options.headers || {})
      this._body = options.body
    }

    async json() {
      return JSON.parse(this._body || '{}')
    }
  },
  NextResponse: {
    json: (data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ...init
    })
  }
}))

// Mock environment variables
process.env = {
  ...process.env,
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'test-secret',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
}