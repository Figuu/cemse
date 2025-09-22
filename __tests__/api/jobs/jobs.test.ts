import { GET } from '@/app/api/jobs/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    jobOffer: {
      findMany: jest.fn(),
    },
  },
}))

const { prisma } = require('@/lib/prisma')

describe('/api/jobs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockSession = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
      role: 'YOUTH',
    },
  }

  const mockJobs = [
    {
      id: 'job-1',
      title: 'Software Developer',
      description: 'Job description',
      location: 'Cochabamba',
      contractType: 'FULL_TIME',
      experienceLevel: 'ENTRY_LEVEL',
      salaryMin: 5000,
      salaryMax: 8000,
      salaryCurrency: 'BOB',
      workModality: 'HYBRID',
      isActive: true,
      featured: false,
      urgent: false,
      viewsCount: 10,
      applicationsCount: 5,
      createdAt: new Date(),
      applicationDeadline: new Date(),
      skillsRequired: ['JavaScript', 'React'],
      requirements: 'Experience with React',
      benefits: 'Health insurance',
      company: {
        id: 'company-1',
        name: 'Tech Corp',
        logoUrl: 'logo.png',
        address: 'Cochabamba',
        website: 'https://techcorp.com',
      },
      applications: [],
    },
  ]

  it('should fetch jobs successfully for authenticated user', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    prisma.jobOffer.findMany.mockResolvedValue(mockJobs)

    const request = new NextRequest('http://localhost:3000/api/jobs')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.jobs).toHaveLength(1)
    expect(data.jobs[0].title).toBe('Software Developer')
    expect(data.jobs[0].company.name).toBe('Tech Corp')
  })

  it('should return 401 for unauthenticated user', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/jobs')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should filter jobs by search term', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    prisma.jobOffer.findMany.mockResolvedValue(mockJobs)

    const request = new NextRequest('http://localhost:3000/api/jobs?search=developer')
    const response = await GET(request)

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { title: { contains: 'developer', mode: 'insensitive' } },
            { description: { contains: 'developer', mode: 'insensitive' } },
          ]),
        }),
      })
    )
  })

  it('should filter jobs by location', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    prisma.jobOffer.findMany.mockResolvedValue(mockJobs)

    const request = new NextRequest('http://localhost:3000/api/jobs?location=Cochabamba')
    const response = await GET(request)

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          location: { contains: 'Cochabamba', mode: 'insensitive' },
        }),
      })
    )
  })

  it('should filter jobs by contract type', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    prisma.jobOffer.findMany.mockResolvedValue(mockJobs)

    const request = new NextRequest('http://localhost:3000/api/jobs?type=FULL_TIME')
    const response = await GET(request)

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          contractType: 'FULL_TIME',
        }),
      })
    )
  })

  it('should filter jobs by experience level', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    prisma.jobOffer.findMany.mockResolvedValue(mockJobs)

    const request = new NextRequest('http://localhost:3000/api/jobs?experience=ENTRY_LEVEL')
    const response = await GET(request)

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          experienceLevel: 'ENTRY_LEVEL',
        }),
      })
    )
  })

  it('should sort jobs by newest by default', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    prisma.jobOffer.findMany.mockResolvedValue(mockJobs)

    const request = new NextRequest('http://localhost:3000/api/jobs')
    const response = await GET(request)

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  it('should sort jobs by salary when requested', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    prisma.jobOffer.findMany.mockResolvedValue(mockJobs)

    const request = new NextRequest('http://localhost:3000/api/jobs?sortBy=salary_high')
    const response = await GET(request)

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { salaryMin: 'desc' },
      })
    )
  })

  it('should include user application status', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    prisma.jobOffer.findMany.mockResolvedValue(mockJobs)

    const request = new NextRequest('http://localhost:3000/api/jobs')
    const response = await GET(request)

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          applications: {
            where: {
              applicantId: 'user-1',
            },
            select: {
              id: true,
              status: true,
            },
          },
        }),
      })
    )
  })

  it('should handle database errors gracefully', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    prisma.jobOffer.findMany.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/jobs')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch jobs')
  })
})