import { render, screen } from '@testing-library/react'
import { StatCard, StatsCards } from '@/components/dashboard/StatsCards'
import { Users, Briefcase, TrendingUp, Award } from 'lucide-react'

describe('StatCard Component', () => {
  it('renders basic stat card with title and value', () => {
    render(
      <StatCard
        title="Total Users"
        value={1250}
        icon={Users}
      />
    )

    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('1250')).toBeInTheDocument()
  })

  it('renders stat card with change indicator - increase', () => {
    render(
      <StatCard
        title="Active Jobs"
        value={85}
        icon={Briefcase}
        change={{ value: 12, type: 'increase' }}
      />
    )

    expect(screen.getByText('Active Jobs')).toBeInTheDocument()
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('↗ 12%')).toBeInTheDocument()
    expect(screen.getByText('vs mes anterior')).toBeInTheDocument()
  })

  it('renders stat card with change indicator - decrease', () => {
    render(
      <StatCard
        title="Pending Applications"
        value={45}
        icon={TrendingUp}
        change={{ value: 8, type: 'decrease' }}
      />
    )

    expect(screen.getByText('↘ 8%')).toBeInTheDocument()
    const changeElement = screen.getByText('↘ 8%')
    expect(changeElement).toHaveClass('text-red-600')
  })

  it('renders stat card with change indicator - neutral', () => {
    render(
      <StatCard
        title="Completed Courses"
        value={120}
        icon={Award}
        change={{ value: 0, type: 'neutral' }}
      />
    )

    expect(screen.getByText('→ 0%')).toBeInTheDocument()
    const changeElement = screen.getByText('→ 0%')
    expect(changeElement).toHaveClass('text-gray-600')
  })

  it('renders stat card with description', () => {
    render(
      <StatCard
        title="Revenue"
        value="$12,450"
        icon={TrendingUp}
        description="Monthly recurring revenue"
      />
    )

    expect(screen.getByText('Monthly recurring revenue')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <StatCard
        title="Test"
        value={100}
        icon={Users}
        className="custom-stat-card"
      />
    )

    expect(container.firstChild).toHaveClass('custom-stat-card')
  })

  it('applies correct change colors', () => {
    const { rerender } = render(
      <StatCard
        title="Test"
        value={100}
        icon={Users}
        change={{ value: 10, type: 'increase' }}
      />
    )

    expect(screen.getByText('↗ 10%')).toHaveClass('text-green-600')

    rerender(
      <StatCard
        title="Test"
        value={100}
        icon={Users}
        change={{ value: 5, type: 'decrease' }}
      />
    )

    expect(screen.getByText('↘ 5%')).toHaveClass('text-red-600')
  })
})

describe('StatsCards Component', () => {
  const mockStats = [
    {
      title: 'Total Users',
      value: 1250,
      icon: Users,
      change: { value: 12, type: 'increase' as const },
    },
    {
      title: 'Active Jobs',
      value: 85,
      icon: Briefcase,
      change: { value: 8, type: 'decrease' as const },
    },
    {
      title: 'Revenue',
      value: '$12,450',
      icon: TrendingUp,
      description: 'Monthly recurring revenue',
    },
    {
      title: 'Certificates',
      value: 340,
      icon: Award,
    },
  ]

  it('renders multiple stat cards', () => {
    render(<StatsCards stats={mockStats} />)

    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('Active Jobs')).toBeInTheDocument()
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('Certificates')).toBeInTheDocument()
  })

  it('renders correct number of stat cards', () => {
    render(<StatsCards stats={mockStats} />)

    const cards = screen.getAllByRole('region') // Cards have role="region" by default
    expect(cards).toHaveLength(4)
  })

  it('applies grid layout classes', () => {
    const { container } = render(<StatsCards stats={mockStats} />)

    const gridContainer = container.firstChild
    expect(gridContainer).toHaveClass('grid')
    expect(gridContainer).toHaveClass('grid-cols-1')
    expect(gridContainer).toHaveClass('gap-4')
    expect(gridContainer).toHaveClass('sm:grid-cols-2')
    expect(gridContainer).toHaveClass('lg:grid-cols-4')
  })

  it('applies custom className to grid container', () => {
    const { container } = render(
      <StatsCards stats={mockStats} className="custom-grid" />
    )

    expect(container.firstChild).toHaveClass('custom-grid')
  })

  it('renders empty state when no stats provided', () => {
    render(<StatsCards stats={[]} />)

    const gridContainer = document.querySelector('.grid')
    expect(gridContainer?.children).toHaveLength(0)
  })

  it('renders stat cards with all properties correctly', () => {
    render(<StatsCards stats={mockStats} />)

    // Check specific stat card content
    expect(screen.getByText('1250')).toBeInTheDocument()
    expect(screen.getByText('↗ 12%')).toBeInTheDocument()
    expect(screen.getByText('↘ 8%')).toBeInTheDocument()
    expect(screen.getByText('Monthly recurring revenue')).toBeInTheDocument()
    expect(screen.getByText('340')).toBeInTheDocument()
  })
})