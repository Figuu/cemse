import { POST } from '@/app/api/auth/register/route'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}))

const { prisma } = require('@/lib/prisma')

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register a new user successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'YOUTH',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
      },
    }

    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.create.mockResolvedValue(mockUser)
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword')

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'YOUTH',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('user-1')
    expect(data.data.email).toBe('test@example.com')
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
  })

  it('should return error if user already exists', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'existing-user',
      email: 'test@example.com',
    })

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'YOUTH',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('El correo electrónico ya está registrado')
  })

  it('should validate password confirmation', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password456',
        role: 'YOUTH',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Las contraseñas no coinciden')
  })

  it('should validate required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'YOUTH',
        firstName: '',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('El nombre es requerido')
  })

  it('should validate email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'YOUTH',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Correo electrónico inválido')
  })

  it('should validate password length', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123',
        role: 'YOUTH',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('La contraseña debe tener al menos 6 caracteres')
  })
})