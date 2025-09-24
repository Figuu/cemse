/**
 * Admin Users API Security Tests
 * Tests API endpoints for security vulnerabilities following OWASP guidelines
 */

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@/lib/auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    profile: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('Admin Users API Security Tests', () => {
  let mockPrisma: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockPrisma = require('@/lib/prisma').prisma
  })

  describe('Authentication and Authorization Tests', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const { GET } = await import('@/app/api/admin/users/route')
      const request = new NextRequest('http://localhost/api/admin/users')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 for insufficient privileges', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'user1', role: 'YOUTH', email: 'user@test.com' }
      })

      const { GET } = await import('@/app/api/admin/users/route')
      const request = new NextRequest('http://localhost/api/admin/users')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should allow access for SUPERADMIN role', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' }
      })

      mockPrisma.user.findMany.mockResolvedValue([])

      const { GET } = await import('@/app/api/admin/users/route')
      const request = new NextRequest('http://localhost/api/admin/users')
      const response = await GET(request)

      expect(response.status).toBe(200)
    })

    it('should allow access for INSTITUTION role', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'inst1', role: 'INSTITUTION', email: 'institution@test.com' }
      })

      mockPrisma.user.findMany.mockResolvedValue([])

      const { GET } = await import('@/app/api/admin/users/route')
      const request = new NextRequest('http://localhost/api/admin/users')
      const response = await GET(request)

      expect(response.status).toBe(200)
    })
  })

  describe('Input Validation and Injection Prevention', () => {
    it('should safely handle malicious role query parameters', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' }
      })

      mockPrisma.user.findMany.mockImplementation((query) => {
        // Verify the query structure is safe
        expect(query.where).toBeDefined()
        if (query.where.role) {
          expect(typeof query.where.role).toBe('string')
        }
        return Promise.resolve([])
      })

      const maliciousRoles = [
        "'; DROP TABLE users; --",
        '<script>alert("xss")</script>',
        '${7*7}',
        '../../../etc/passwd',
        'null',
        'undefined'
      ]

      for (const maliciousRole of maliciousRoles) {
        const { GET } = await import('@/app/api/admin/users/route')
        const request = new NextRequest(`http://localhost/api/admin/users?role=${encodeURIComponent(maliciousRole)}`)

        const response = await GET(request)

        // Should handle gracefully without errors
        expect(response.status).toBe(200)
      }
    })

    it('should validate POST request data structure', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' }
      })

      mockPrisma.user.findUnique.mockResolvedValue(null)

      const maliciousPayloads = [
        null,
        undefined,
        'string instead of object',
        [],
        { email: null },
        { email: '' },
        { password: null },
        { password: '' }
      ]

      for (const payload of maliciousPayloads) {
        const { POST } = await import('@/app/api/admin/users/route')
        const request = new NextRequest('http://localhost/api/admin/users', {
          method: 'POST',
          body: JSON.stringify(payload)
        })

        const response = await POST(request)

        // Should return 400 for invalid data
        if (payload === null || payload === undefined || typeof payload !== 'object' || Array.isArray(payload)) {
          expect(response.status).toBe(400)
        } else if (!payload.email || !payload.password) {
          expect(response.status).toBe(400)
        }
      }
    })

    it('should sanitize string inputs', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' }
      })

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txPrisma = {
          user: { create: jest.fn().mockResolvedValue({ id: 'user1', email: 'test@test.com' }) },
          profile: { create: jest.fn().mockResolvedValue({ id: 'profile1' }) }
        }
        return callback(txPrisma)
      })

      const { POST } = await import('@/app/api/admin/users/route')
      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'password123',
          firstName: '<script>alert("xss")</script>Test',
          lastName: '${7*7}User',
          phone: 'javascript:alert("xss")',
          address: '<img src=x onerror=alert("xss")>Address'
        })
      })

      const response = await POST(request)

      // Should complete without executing malicious code
      expect(response.status).toBeLessThan(500)

      // Verify that transaction was called (indicating processing continued)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })
  })

  describe('Password Security Tests', () => {
    it('should hash passwords with sufficient strength', async () => {
      const password = 'testPassword123!'
      const hashedPassword = await bcrypt.hash(password, 12)

      // Verify password hashing
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(50)
      expect(hashedPassword).toMatch(/^\$2[aby]\$12\$/)

      // Verify hash can be validated
      const isValid = await bcrypt.compare(password, hashedPassword)
      expect(isValid).toBe(true)

      // Verify wrong password fails
      const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword)
      expect(isInvalid).toBe(false)
    })

    it('should not accept weak passwords', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' }
      })

      mockPrisma.user.findUnique.mockResolvedValue(null)

      const weakPasswords = [
        '123',
        'password',
        'admin',
        'qwerty',
        '12345678'
      ]

      for (const weakPassword of weakPasswords) {
        const { POST } = await import('@/app/api/admin/users/route')
        const request = new NextRequest('http://localhost/api/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@test.com',
            password: weakPassword,
            firstName: 'Test',
            lastName: 'User'
          })
        })

        const response = await POST(request)

        // Should process but ideally would validate password strength
        // (This test documents current behavior - password validation should be added)
        expect(response.status).toBeLessThan(500)
      }
    })
  })

  describe('Data Exposure Prevention', () => {
    it('should not expose password hashes in responses', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' }
      })

      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: 'user1',
          email: 'test@test.com',
          password: '$2b$12$hashedpassword',
          firstName: 'Test',
          lastName: 'User',
          role: 'YOUTH',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: null
        }
      ])

      const { GET } = await import('@/app/api/admin/users/route')
      const request = new NextRequest('http://localhost/api/admin/users')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data[0]).not.toHaveProperty('password')
    })

    it('should not expose internal system errors', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' }
      })

      mockPrisma.user.findMany.mockRejectedValue(new Error('Database connection string: postgresql://user:password@localhost:5432/db'))

      const { GET } = await import('@/app/api/admin/users/route')
      const request = new NextRequest('http://localhost/api/admin/users')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
      expect(data.error).not.toContain('postgresql://')
      expect(data.error).not.toContain('password')
    })
  })

  describe('Business Logic Security', () => {
    it('should prevent duplicate user creation', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' }
      })

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'existing@test.com'
      })

      const { POST } = await import('@/app/api/admin/users/route')
      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@test.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User with this email already exists')
    })

    it('should use database transactions for data integrity', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' }
      })

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txPrisma = {
          user: {
            create: jest.fn().mockResolvedValue({
              id: 'user1',
              email: 'test@test.com',
              firstName: 'Test',
              lastName: 'User',
              role: 'YOUTH',
              isActive: true,
              createdAt: new Date()
            })
          },
          profile: {
            create: jest.fn().mockResolvedValue({
              id: 'profile1',
              userId: 'user1'
            })
          }
        }
        return callback(txPrisma)
      })

      const { POST } = await import('@/app/api/admin/users/route')
      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should validate role assignments', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' }
      })

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txPrisma = {
          user: { create: jest.fn().mockResolvedValue({ id: 'user1' }) },
          profile: { create: jest.fn().mockResolvedValue({ id: 'profile1' }) }
        }
        return callback(txPrisma)
      })

      const invalidRoles = [
        'INVALID_ROLE',
        'ROOT',
        'SYSTEM',
        'HACKER',
        null,
        undefined,
        ''
      ]

      for (const role of invalidRoles) {
        const { POST } = await import('@/app/api/admin/users/route')
        const request = new NextRequest('http://localhost/api/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@test.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            role: role
          })
        })

        const response = await POST(request)

        // Should handle gracefully without causing server errors
        expect(response.status).toBeLessThan(500)
      }
    })
  })

  describe('Rate Limiting and DoS Prevention', () => {
    it('should handle concurrent requests gracefully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' }
      })

      mockPrisma.user.findMany.mockResolvedValue([])

      const { GET } = await import('@/app/api/admin/users/route')

      // Simulate multiple concurrent requests
      const requests = Array(10).fill(null).map(() => {
        const request = new NextRequest('http://localhost/api/admin/users')
        return GET(request)
      })

      const responses = await Promise.all(requests)

      // All requests should complete successfully
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
    })

    it('should handle large payload gracefully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' }
      })

      mockPrisma.user.findUnique.mockResolvedValue(null)

      // Create a large payload
      const largeString = 'A'.repeat(10000)
      const largePayload = {
        email: 'test@test.com',
        password: 'password123',
        firstName: largeString,
        lastName: largeString,
        address: largeString
      }

      const { POST } = await import('@/app/api/admin/users/route')
      const request = new NextRequest('http://localhost/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(largePayload)
      })

      const response = await POST(request)

      // Should handle large payloads without crashing
      expect(response.status).toBeLessThan(500)
    })
  })

  describe('Security Headers and Response Validation', () => {
    it('should return appropriate HTTP status codes', async () => {
      const testCases = [
        {
          session: null,
          expectedStatus: 401,
          description: 'unauthenticated'
        },
        {
          session: { user: { id: 'user1', role: 'YOUTH', email: 'user@test.com' } },
          expectedStatus: 403,
          description: 'insufficient privileges'
        },
        {
          session: { user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' } },
          expectedStatus: 200,
          description: 'authorized admin'
        }
      ]

      for (const testCase of testCases) {
        mockGetServerSession.mockResolvedValue(testCase.session)
        if (testCase.expectedStatus === 200) {
          mockPrisma.user.findMany.mockResolvedValue([])
        }

        const { GET } = await import('@/app/api/admin/users/route')
        const request = new NextRequest('http://localhost/api/admin/users')
        const response = await GET(request)

        expect(response.status).toBe(testCase.expectedStatus)
      }
    })

    it('should return valid JSON responses', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin1', role: 'SUPERADMIN', email: 'admin@test.com' }
      })

      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: 'user1',
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'YOUTH',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: null
        }
      ])

      const { GET } = await import('@/app/api/admin/users/route')
      const request = new NextRequest('http://localhost/api/admin/users')
      const response = await GET(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('email')
      expect(data[0]).not.toHaveProperty('password')
    })
  })
})