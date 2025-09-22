import {
  cn,
  getInitials,
  formatDateTime,
  formatDate,
  formatCurrency,
  truncateText,
  generateSlug,
  validateEmail,
  validatePhone,
  getFileExtension,
  formatFileSize,
  debounce,
  throttle,
  formatTimeAgo,
  safeNumber,
  safeSum,
  safePercentage,
} from '@/lib/utils'

describe('Utils Functions', () => {
  describe('cn (className merger)', () => {
    it('merges class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('handles conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
    })

    it('handles Tailwind conflicts', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })
  })

  describe('getInitials', () => {
    it('returns initials from first and last name', () => {
      expect(getInitials('Juan', 'Pérez')).toBe('JP')
    })

    it('handles missing last name', () => {
      expect(getInitials('Juan')).toBe('J')
    })

    it('handles missing first name', () => {
      expect(getInitials(undefined, 'Pérez')).toBe('P')
    })

    it('handles empty strings', () => {
      expect(getInitials('', '')).toBe('')
    })

    it('handles undefined values', () => {
      expect(getInitials()).toBe('')
    })
  })

  describe('formatDateTime', () => {
    it('formats date correctly in Spanish', () => {
      const date = new Date('2023-12-25T15:30:00')
      const formatted = formatDateTime(date)
      expect(formatted).toContain('25')
      expect(formatted).toContain('diciembre')
      expect(formatted).toContain('2023')
    })

    it('handles string dates', () => {
      const formatted = formatDateTime('2023-12-25T15:30:00')
      expect(formatted).toContain('25')
    })
  })

  describe('formatDate', () => {
    it('formats date without time', () => {
      const date = new Date('2023-12-25T15:30:00')
      const formatted = formatDate(date)
      expect(formatted).not.toContain('15:30')
      expect(formatted).toContain('25')
      expect(formatted).toContain('diciembre')
    })
  })

  describe('formatCurrency', () => {
    it('formats currency in BOB by default', () => {
      const formatted = formatCurrency(1500)
      expect(formatted).toContain('1500')
      expect(formatted).toContain('Bs')
    })

    it('formats currency in specified currency', () => {
      const formatted = formatCurrency(1500, 'USD')
      expect(formatted).toContain('1500')
    })
  })

  describe('truncateText', () => {
    it('truncates long text', () => {
      const text = 'This is a very long text that should be truncated'
      expect(truncateText(text, 20)).toBe('This is a very long ...')
    })

    it('returns original text if shorter than max length', () => {
      const text = 'Short text'
      expect(truncateText(text, 20)).toBe('Short text')
    })

    it('handles exact length', () => {
      const text = 'Exact length text'
      expect(truncateText(text, 17)).toBe('Exact length text')
    })
  })

  describe('generateSlug', () => {
    it('generates URL-friendly slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('handles special characters', () => {
      expect(generateSlug('Café & Restaurant')).toBe('cafe-restaurant')
    })

    it('handles Spanish characters', () => {
      expect(generateSlug('Niño pequeño')).toBe('nino-pequeno')
    })

    it('removes multiple spaces and dashes', () => {
      expect(generateSlug('Multiple   spaces---and-dashes')).toBe('multiple-spaces-and-dashes')
    })
  })

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('test..test@domain.com')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('validates Bolivian phone numbers', () => {
      expect(validatePhone('12345678')).toBe(true)
      expect(validatePhone('+59112345678')).toBe(true)
    })

    it('handles spaces in phone numbers', () => {
      expect(validatePhone('1234 5678')).toBe(true)
      expect(validatePhone('+591 1234 5678')).toBe(true)
    })

    it('rejects invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('123456789')).toBe(false)
      expect(validatePhone('abcd1234')).toBe(false)
    })
  })

  describe('getFileExtension', () => {
    it('extracts file extension', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf')
      expect(getFileExtension('image.jpg')).toBe('jpg')
      expect(getFileExtension('archive.tar.gz')).toBe('gz')
    })

    it('handles files without extension', () => {
      expect(getFileExtension('filename')).toBe('')
    })

    it('returns lowercase extension', () => {
      expect(getFileExtension('FILE.PDF')).toBe('pdf')
    })
  })

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })

    it('handles decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB')
    })
  })

  describe('debounce', () => {
    jest.useFakeTimers()

    it('delays function execution', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('cancels previous calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    afterEach(() => {
      jest.clearAllTimers()
    })
  })

  describe('throttle', () => {
    jest.useFakeTimers()

    it('limits function execution', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(mockFn).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(100)
      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    afterEach(() => {
      jest.clearAllTimers()
    })
  })

  describe('formatTimeAgo', () => {
    it('formats time ago correctly', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const result = formatTimeAgo(oneHourAgo)
      expect(result).toContain('hace')
    })

    it('handles invalid dates', () => {
      expect(formatTimeAgo('invalid-date')).toBe('Fecha no disponible')
    })

    it('uses custom fallback', () => {
      expect(formatTimeAgo('invalid-date', 'Custom fallback')).toBe('Custom fallback')
    })
  })

  describe('safeNumber', () => {
    it('converts valid numbers', () => {
      expect(safeNumber('123')).toBe(123)
      expect(safeNumber(456)).toBe(456)
      expect(safeNumber('123.45')).toBe(123.45)
    })

    it('returns default for invalid numbers', () => {
      expect(safeNumber('abc')).toBe(0)
      expect(safeNumber(null)).toBe(0)
      expect(safeNumber(undefined)).toBe(0)
    })

    it('uses custom default value', () => {
      expect(safeNumber('abc', 100)).toBe(100)
    })
  })

  describe('safeSum', () => {
    it('sums valid numbers', () => {
      expect(safeSum([1, 2, 3, 4])).toBe(10)
      expect(safeSum(['1', '2', '3'])).toBe(6)
    })

    it('handles mixed valid and invalid values', () => {
      expect(safeSum([1, 'abc', 3, null])).toBe(4)
    })

    it('returns default for empty array', () => {
      expect(safeSum([])).toBe(0)
    })
  })

  describe('safePercentage', () => {
    it('calculates percentage correctly', () => {
      expect(safePercentage(25, 100)).toBe('25.0')
      expect(safePercentage(1, 3, 2)).toBe('33.33')
    })

    it('handles division by zero', () => {
      expect(safePercentage(25, 0)).toBe('0')
    })

    it('handles invalid inputs', () => {
      expect(safePercentage('abc', 100)).toBe('0.0')
      expect(safePercentage(25, 'def')).toBe('0')
    })

    it('respects decimal places', () => {
      expect(safePercentage(1, 3, 0)).toBe('33')
      expect(safePercentage(1, 3, 3)).toBe('33.333')
    })
  })
})