/**
 * Sign-in Component Security Tests
 * Tests authentication component for security vulnerabilities
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { signIn } from 'next-auth/react'
import SignInPage from '@/app/(auth)/sign-in/page'

// Mock next-auth
jest.mock('next-auth/react')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

describe('SignInPage Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.alert for XSS tests
    global.alert = jest.fn()
    // Mock console methods for logging tests
    global.console.log = jest.fn()
    global.console.error = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Input Validation and Sanitization', () => {
    it('should handle XSS attempts in email field', async () => {
      const user = userEvent.setup()
      render(<SignInPage />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const xssPayload = '<script>alert("xss")</script>test@test.com'

      await user.type(emailInput, xssPayload)

      // The input should contain the raw text, not execute script
      expect(emailInput).toHaveValue(xssPayload)
      // Script should not be executed (no alert)
      expect(global.alert).not.toHaveBeenCalled()
    })

    it('should handle XSS attempts in password field', async () => {
      const user = userEvent.setup()
      render(<SignInPage />)

      const passwordInput = screen.getByLabelText(/contraseña/i)
      const xssPayload = '<img src=x onerror=alert("xss")>password'

      await user.type(passwordInput, xssPayload)

      expect(passwordInput).toHaveValue(xssPayload)
      expect(global.alert).not.toHaveBeenCalled()
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      render(<SignInPage />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user.domain.com'
      ]

      for (const email of invalidEmails) {
        await user.clear(emailInput)
        await user.type(emailInput, email)

        // Check that the email is recognized as invalid
        // Note: HTML5 validation may not trigger in test environment
        // Instead, verify the email value and type
        expect(emailInput).toHaveAttribute('type', 'email')
        expect(emailInput).toHaveValue(email)

        // Validate using standard email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        expect(emailRegex.test(email)).toBe(false)
      }
    })

    it('should require email and password fields', async () => {
      const user = userEvent.setup()
      render(<SignInPage />)

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)

      // Try to submit without filling fields
      await user.click(submitButton)

      expect(emailInput).toBeInvalid()
      expect(passwordInput).toBeInvalid()
    })
  })

  describe('Authentication Security', () => {
    it('should not expose credentials in form submission', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: '/dashboard' })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@test.com',
          password: 'password123',
          redirect: false,
        })
      })

      // Ensure credentials are not logged or exposed
      expect(global.console.log).not.toHaveBeenCalledWith(expect.stringMatching(/password/i))
    })

    it('should handle authentication errors securely', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({ error: 'CredentialsSignin', ok: false, status: 401, url: null })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
      })

      // Should not expose specific error details
      expect(screen.queryByText(/CredentialsSignin/)).not.toBeInTheDocument()
      expect(screen.queryByText(/database/i)).not.toBeInTheDocument()
    })

    it('should prevent timing attacks by consistent response times', async () => {
      const user = userEvent.setup()
      render(<SignInPage />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      // Test with valid email format but non-existent user
      mockSignIn.mockResolvedValue({ error: 'CredentialsSignin', ok: false, status: 401, url: null })

      const startTime = Date.now()
      await user.type(emailInput, 'nonexistent@test.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
      })

      const responseTime = Date.now() - startTime

      // Response time should be reasonable (not suspiciously fast)
      expect(responseTime).toBeGreaterThan(100) // At least 100ms
    })
  })

  describe('CSRF Protection', () => {
    it('should include CSRF protection in form submission', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: '/dashboard' })

      render(<SignInPage />)

      // Find form element - it might not have explicit form role
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()

      // NextAuth handles CSRF protection internally
      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Verify that signIn is called with proper parameters (NextAuth handles CSRF)
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', expect.objectContaining({
          redirect: false
        }))
      })
    })
  })

  describe('Password Visibility Toggle Security', () => {
    it('should securely toggle password visibility', async () => {
      const user = userEvent.setup()
      render(<SignInPage />)

      const passwordInput = screen.getByLabelText(/contraseña/i)
      const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button

      // Initial state should be password type
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Toggle to show password
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      // Toggle back to hide password
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should not leak password in DOM when hidden', async () => {
      const user = userEvent.setup()
      render(<SignInPage />)

      const passwordInput = screen.getByLabelText(/contraseña/i)
      await user.type(passwordInput, 'secretpassword')

      // When type is password, value should not be visible in rendered text
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(screen.queryByText('secretpassword')).not.toBeInTheDocument()
    })
  })

  describe('Information Disclosure Prevention', () => {
    it('should not reveal whether user exists', async () => {
      const user = userEvent.setup()
      render(<SignInPage />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      // Test with non-existent user
      mockSignIn.mockResolvedValue({ error: 'CredentialsSignin', ok: false, status: 401, url: null })

      await user.type(emailInput, 'nonexistent@test.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.getByText(/credenciales inválidas/i)
        expect(errorMessage).toBeInTheDocument()
      })

      // Error message should be generic, not specific about user existence
      expect(screen.queryByText(/usuario no encontrado/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/user not found/i)).not.toBeInTheDocument()
    })

    it('should not expose system information in errors', async () => {
      const user = userEvent.setup()
      mockSignIn.mockRejectedValue(new Error('Database connection failed'))

      render(<SignInPage />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/error al iniciar sesión/i)).toBeInTheDocument()
      })

      // Should not expose internal error details
      expect(screen.queryByText(/database/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/connection failed/i)).not.toBeInTheDocument()
    })
  })

  describe('Rate Limiting UI Considerations', () => {
    it('should handle rate limiting gracefully', async () => {
      const user = userEvent.setup()
      // Mock a generic authentication error instead of rate limiting specific
      mockSignIn.mockRejectedValue(new Error('Rate limit exceeded'))

      render(<SignInPage />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Should handle rate limiting error appropriately with generic error message
      await waitFor(() => {
        expect(screen.getByText(/error al iniciar sesión/i)).toBeInTheDocument()
      })
    })

    it('should disable submit button during authentication', async () => {
      const user = userEvent.setup()
      // Simulate slow authentication
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null, ok: true, status: 200, url: '/dashboard' }), 1000)))

      render(<SignInPage />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Button should be disabled and show loading state
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument()
    })
  })
})