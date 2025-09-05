# 🧪 SlimeTube Testing Documentation

This document provides comprehensive testing guidelines, strategies, and examples for the SlimeTube video platform.

## 📑 Table of Contents

- [Testing Strategy](#testing-strategy)
- [Testing Environment Setup](#testing-environment-setup)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [End-to-End Tests](#end-to-end-tests)
- [Component Testing](#component-testing)
- [Manual Testing](#manual-testing)
- [Performance Testing](#performance-testing)
- [Accessibility Testing](#accessibility-testing)
- [Test Coverage](#test-coverage)
- [Continuous Integration](#continuous-integration)

---

## 🎯 Testing Strategy

### Testing Pyramid
```
        /\
       /  \    E2E Tests (10%)
      /____\   
     /      \  Integration Tests (20%)
    /________\ 
   /          \ Unit Tests (70%)
  /____________\
```

### Core Principles
- **Test-Driven Development (TDD)**: Write tests before implementation
- **Behavior-Driven Development (BDD)**: Focus on user behavior
- **Fast Feedback Loop**: Quick test execution for rapid development
- **Comprehensive Coverage**: Aim for 80%+ code coverage
- **Real-world Scenarios**: Test with realistic data and user flows

---

## 🛠️ Testing Environment Setup

### Prerequisites
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev vitest jsdom @vitest/ui
npm install --save-dev playwright @playwright/test
npm install --save-dev @storybook/react @storybook/addon-testing
```

### Configuration Files

#### `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
      ],
    },
  },
})
```

#### `src/test/setup.ts`
```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock IndexedDB
const mockIDBRequest = {
  result: {},
  error: null,
  source: null,
  transaction: null,
  readyState: 'done',
  onsuccess: null,
  onerror: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}

global.indexedDB = {
  open: vi.fn(() => mockIDBRequest),
  deleteDatabase: vi.fn(() => mockIDBRequest),
  databases: vi.fn(() => Promise.resolve([])),
}

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

---

## 🔬 Unit Tests

### Component Unit Tests

#### Example: VideoCard Component Test
```typescript
// src/components/__tests__/VideoCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { VideoCard } from '../VideoCard'
import { Video } from '../../types'

const mockVideo: Video = {
  id: '1',
  title: 'Test Video',
  description: 'Test Description',
  thumbnail: 'test-thumbnail.jpg',
  videoUrl: 'test-video.mp4',
  uploadDate: '2024-01-01',
  category: 'Entertainment',
  tags: ['test', 'video'],
  views: 100,
  duration: '10:30',
  quality: '1080p',
  userId: 'user1',
  isPublic: true,
}

const renderVideoCard = (video: Video = mockVideo) => {
  return render(
    <BrowserRouter>
      <VideoCard video={video} />
    </BrowserRouter>
  )
}

describe('VideoCard', () => {
  test('renders video title and thumbnail', () => {
    renderVideoCard()
    expect(screen.getByText('Test Video')).toBeInTheDocument()
    expect(screen.getByAltText('Test Video')).toBeInTheDocument()
  })

  test('displays video duration', () => {
    renderVideoCard()
    expect(screen.getByText('10:30')).toBeInTheDocument()
  })

  test('navigates to video details on click', () => {
    renderVideoCard()
    const videoLink = screen.getByRole('link')
    expect(videoLink).toHaveAttribute('href', '/video/1')
  })

  test('handles missing thumbnail gracefully', () => {
    const videoWithoutThumbnail = { ...mockVideo, thumbnail: '' }
    renderVideoCard(videoWithoutThumbnail)
    
    const thumbnail = screen.getByAltText('Test Video')
    expect(thumbnail).toHaveAttribute('src', '/placeholder-thumbnail.jpg')
  })
})
```

### Service Unit Tests

#### Example: IndexedDBStorageService Test
```typescript
// src/services/__tests__/IndexedDBStorageService.test.ts
import { IndexedDBStorageService } from '../IndexedDBStorageService'

// Mock IndexedDB
const mockDB = {
  transaction: vi.fn(),
  createObjectStore: vi.fn(),
  close: vi.fn(),
}

const mockTransaction = {
  objectStore: vi.fn(),
  oncomplete: null,
  onerror: null,
}

const mockObjectStore = {
  add: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(),
  put: vi.fn(),
}

describe('IndexedDBStorageService', () => {
  let service: IndexedDBStorageService

  beforeEach(() => {
    service = new IndexedDBStorageService()
    mockTransaction.objectStore.mockReturnValue(mockObjectStore)
    mockDB.transaction.mockReturnValue(mockTransaction)
  })

  test('stores video file successfully', async () => {
    const mockFile = new File(['test content'], 'test.mp4', { type: 'video/mp4' })
    const videoData = {
      id: '1',
      title: 'Test Video',
      file: mockFile,
      thumbnail: 'thumbnail-data',
    }

    mockObjectStore.add.mockResolvedValue(undefined)
    
    await expect(service.storeVideoFile(videoData)).resolves.not.toThrow()
  })

  test('retrieves stored video URL', async () => {
    const mockStoredData = {
      id: '1',
      file: new Blob(['test'], { type: 'video/mp4' }),
    }

    mockObjectStore.get.mockResolvedValue(mockStoredData)
    
    const url = await service.getStoredVideoUrl('1')
    expect(url).toBe('mock-url')
  })

  test('handles storage quota exceeded error', async () => {
    const mockFile = new File(['large content'], 'large.mp4', { type: 'video/mp4' })
    const videoData = {
      id: '1',
      title: 'Large Video',
      file: mockFile,
      thumbnail: 'thumbnail-data',
    }

    const quotaError = new Error('QuotaExceededError')
    quotaError.name = 'QuotaExceededError'
    mockObjectStore.add.mockRejectedValue(quotaError)

    await expect(service.storeVideoFile(videoData)).rejects.toThrow('Storage quota exceeded')
  })
})
```

### Utility Function Tests

#### Example: Video Utilities Test
```typescript
// src/utils/__tests__/videoUtils.test.ts
import { formatDuration, validateVideoFile, generateThumbnail } from '../videoUtils'

describe('videoUtils', () => {
  describe('formatDuration', () => {
    test('formats seconds correctly', () => {
      expect(formatDuration(65)).toBe('1:05')
      expect(formatDuration(3665)).toBe('1:01:05')
      expect(formatDuration(30)).toBe('0:30')
    })

    test('handles zero duration', () => {
      expect(formatDuration(0)).toBe('0:00')
    })

    test('handles invalid input', () => {
      expect(formatDuration(NaN)).toBe('0:00')
      expect(formatDuration(-1)).toBe('0:00')
    })
  })

  describe('validateVideoFile', () => {
    test('accepts valid video files', () => {
      const validFile = new File(['content'], 'video.mp4', { type: 'video/mp4' })
      expect(validateVideoFile(validFile)).toBe(true)
    })

    test('rejects non-video files', () => {
      const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' })
      expect(validateVideoFile(invalidFile)).toBe(false)
    })

    test('rejects files exceeding size limit', () => {
      const largeFile = new File(['x'.repeat(100 * 1024 * 1024 + 1)], 'large.mp4', { type: 'video/mp4' })
      expect(validateVideoFile(largeFile, 100)).toBe(false)
    })
  })
})
```

---

## 🔧 Integration Tests

### API Integration Tests

#### Example: Video Upload Integration Test
```typescript
// src/__tests__/integration/videoUpload.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VideoProvider } from '../../contexts/VideoContext'
import { AuthProvider } from '../../contexts/AuthContext'
import { VideoUploadModal } from '../../components/VideoUploadModal'

const MockProviders = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <VideoProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </VideoProvider>
  </AuthProvider>
)

describe('Video Upload Integration', () => {
  test('complete video upload flow', async () => {
    const user = userEvent.setup()
    const mockOnClose = vi.fn()

    render(
      <MockProviders>
        <VideoUploadModal isOpen={true} onClose={mockOnClose} />
      </MockProviders>
    )

    // Upload video file
    const fileInput = screen.getByLabelText(/video file/i)
    const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' })
    await user.upload(fileInput, videoFile)

    // Fill form fields
    await user.type(screen.getByLabelText(/title/i), 'Integration Test Video')
    await user.type(screen.getByLabelText(/description/i), 'Test description')
    await user.selectOptions(screen.getByLabelText(/category/i), 'Entertainment')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /upload video/i })
    await user.click(submitButton)

    // Verify upload progress
    await waitFor(() => {
      expect(screen.getByText(/uploading/i)).toBeInTheDocument()
    })

    // Verify success state
    await waitFor(() => {
      expect(screen.getByText(/upload successful/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  test('handles upload errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock storage service to throw error
    vi.spyOn(IndexedDBStorageService.prototype, 'storeVideoFile')
      .mockRejectedValue(new Error('Storage failed'))

    render(
      <MockProviders>
        <VideoUploadModal isOpen={true} onClose={vi.fn()} />
      </MockProviders>
    )

    const fileInput = screen.getByLabelText(/video file/i)
    const videoFile = new File(['content'], 'test.mp4', { type: 'video/mp4' })
    await user.upload(fileInput, videoFile)

    await user.type(screen.getByLabelText(/title/i), 'Test Video')
    await user.click(screen.getByRole('button', { name: /upload video/i }))

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
    })
  })
})
```

### Context Integration Tests

#### Example: Authentication Flow Test
```typescript
// src/__tests__/integration/authentication.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { AuthModal } from '../../components/AuthModal'

const TestComponent = () => {
  const { user, login, logout } = useAuth()
  
  return (
    <div>
      {user ? (
        <div>
          <span>Welcome, {user.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('test@example.com', 'password')}>
          Login
        </button>
      )}
    </div>
  )
}

describe('Authentication Integration', () => {
  test('complete login/logout flow', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Initial state - not logged in
    expect(screen.getByText('Login')).toBeInTheDocument()

    // Login
    await user.click(screen.getByText('Login'))
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome/)).toBeInTheDocument()
    })

    // Logout
    await user.click(screen.getByText('Logout'))
    
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument()
    })
  })
})
```

---

## 🎭 End-to-End Tests

### Playwright E2E Tests

#### Setup Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

#### Example E2E Tests
```typescript
// e2e/video-upload.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Video Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    
    // Login with demo account
    await page.click('text=Login')
    await page.fill('[placeholder="Email"]', 'demo@slimetube.com')
    await page.fill('[placeholder="Password"]', 'demo123')
    await page.click('button:has-text("Login")')
    
    await expect(page.locator('text=Welcome')).toBeVisible()
  })

  test('should upload video successfully', async ({ page }) => {
    // Navigate to dashboard
    await page.click('text=Dashboard')
    
    // Open upload modal
    await page.click('text=Upload Video')
    
    // Upload video file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('test-assets/sample-video.mp4')
    
    // Fill form
    await page.fill('[placeholder="Enter video title"]', 'E2E Test Video')
    await page.fill('[placeholder="Enter description"]', 'This is an E2E test video')
    await page.selectOption('select[name="category"]', 'Entertainment')
    
    // Submit upload
    await page.click('button:has-text("Upload Video")')
    
    // Wait for upload completion
    await expect(page.locator('text=Upload Successful')).toBeVisible({ timeout: 30000 })
    
    // Verify video appears in dashboard
    await page.click('button:has-text("Close")')
    await expect(page.locator('text=E2E Test Video')).toBeVisible()
  })

  test('should handle upload errors gracefully', async ({ page }) => {
    await page.click('text=Dashboard')
    await page.click('text=Upload Video')
    
    // Try to upload invalid file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('test-assets/invalid-file.txt')
    
    await expect(page.locator('text=Invalid file type')).toBeVisible()
  })
})

// e2e/video-playback.spec.ts
test.describe('Video Playback', () => {
  test('should play video with controls', async ({ page }) => {
    await page.goto('/video/demo-video-1')
    
    // Wait for video to load
    await expect(page.locator('video')).toBeVisible()
    
    // Test play button
    await page.click('[aria-label="Play"]')
    
    // Verify video is playing
    const video = page.locator('video')
    await expect(video).toHaveJSProperty('paused', false)
    
    // Test pause
    await page.click('[aria-label="Pause"]')
    await expect(video).toHaveJSProperty('paused', true)
    
    // Test volume control
    await page.click('[aria-label="Mute"]')
    await expect(video).toHaveJSProperty('muted', true)
    
    // Test fullscreen
    await page.click('[aria-label="Fullscreen"]')
    await expect(page.locator('video')).toHaveCSS('width', '100vw')
  })
})

// e2e/search.spec.ts
test.describe('Search Functionality', () => {
  test('should search and filter videos', async ({ page }) => {
    await page.goto('/')
    
    // Test search
    await page.fill('[placeholder="Search videos..."]', 'test')
    await page.press('[placeholder="Search videos..."]', 'Enter')
    
    // Wait for search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
    
    // Test category filter
    await page.selectOption('[data-testid="category-filter"]', 'Entertainment')
    
    // Verify filtered results
    const results = page.locator('[data-testid="video-card"]')
    await expect(results).toHaveCountGreaterThan(0)
  })
})
```

---

## 🎨 Component Testing

### Storybook Component Tests

#### Example Story with Tests
```typescript
// src/components/VideoCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { VideoCard } from './VideoCard'

const meta: Meta<typeof VideoCard> = {
  title: 'Components/VideoCard',
  component: VideoCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div style={{ width: '300px' }}>
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof VideoCard>

export const Default: Story = {
  args: {
    video: {
      id: '1',
      title: 'Sample Video',
      description: 'This is a sample video description',
      thumbnail: 'https://via.placeholder.com/300x200',
      videoUrl: 'sample-video.mp4',
      uploadDate: '2024-01-15',
      category: 'Entertainment',
      tags: ['sample', 'test'],
      views: 1234,
      duration: '5:30',
      quality: '1080p',
      userId: 'user1',
      isPublic: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Test that title is visible
    await expect(canvas.getByText('Sample Video')).toBeInTheDocument()
    
    // Test thumbnail loading
    const thumbnail = canvas.getByAltText('Sample Video')
    await expect(thumbnail).toBeInTheDocument()
    
    // Test duration display
    await expect(canvas.getByText('5:30')).toBeInTheDocument()
  },
}

export const LongTitle: Story = {
  args: {
    ...Default.args,
    video: {
      ...Default.args.video,
      title: 'This is a very long video title that should be truncated properly to fit within the card layout',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const titleElement = canvas.getByText(/This is a very long video title/)
    
    // Check if title is truncated with ellipsis
    await expect(titleElement).toHaveStyle('text-overflow: ellipsis')
  },
}
```

### React Testing Library Component Tests

#### Example: Modal Component Test
```typescript
// src/components/__tests__/Modal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '../Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  }

  test('renders when open', () => {
    render(<Modal {...defaultProps} />)
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  test('does not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  test('calls onClose when close button clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    await user.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('calls onClose when escape key pressed', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('does not close when clicking inside modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    await user.click(screen.getByText('Modal content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  test('closes when clicking backdrop', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    // Click on backdrop (modal overlay)
    const backdrop = screen.getByRole('dialog').parentElement
    await user.click(backdrop!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
```

---

## 🔍 Manual Testing

### Test Cases Checklist

#### Video Upload
- [ ] Upload MP4 video file
- [ ] Upload AVI video file
- [ ] Upload MOV video file
- [ ] Try uploading non-video file (should fail)
- [ ] Try uploading file larger than 100MB (should fail)
- [ ] Upload with custom thumbnail
- [ ] Upload without thumbnail (should auto-generate)
- [ ] Cancel upload mid-process
- [ ] Upload with special characters in filename
- [ ] Upload with very long filename

#### Video Playback
- [ ] Play/pause functionality
- [ ] Volume control (0-100%)
- [ ] Mute/unmute
- [ ] Seek bar functionality
- [ ] Fullscreen mode
- [ ] Keyboard shortcuts (space, arrows, F)
- [ ] Video quality selection
- [ ] Auto-play behavior
- [ ] Video loading states
- [ ] Error handling for corrupted videos

#### User Interface
- [ ] Responsive design on mobile
- [ ] Responsive design on tablet
- [ ] Dark theme consistency
- [ ] Button hover states
- [ ] Loading animations
- [ ] Toast notifications
- [ ] Modal interactions
- [ ] Navigation between pages
- [ ] Breadcrumb navigation
- [ ] Search functionality

#### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Registration process
- [ ] Logout functionality
- [ ] Session persistence
- [ ] Protected route access
- [ ] Profile page updates
- [ ] Password validation
- [ ] Email validation
- [ ] Demo account access

#### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Internet Explorer 11 (if supported)

### Performance Testing Checklist
- [ ] Page load times under 3 seconds
- [ ] Video upload progress tracking
- [ ] Large file handling (up to limit)
- [ ] Multiple concurrent uploads
- [ ] Memory usage during video playback
- [ ] CPU usage during video processing
- [ ] Network request optimization
- [ ] Bundle size optimization

---

## ♿ Accessibility Testing

### Automated Accessibility Tests

#### Example: axe-core Integration
```typescript
// src/__tests__/accessibility/a11y.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { HomePage } from '../../pages/HomePage'
import { BrowserRouter } from 'react-router-dom'

expect.extend(toHaveNoViolations)

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Accessibility Tests', () => {
  test('HomePage should have no accessibility violations', async () => {
    const { container } = renderWithRouter(<HomePage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('VideoCard should be keyboard navigable', async () => {
    const { container } = renderWithRouter(
      <VideoCard video={mockVideo} />
    )
    
    const results = await axe(container, {
      rules: {
        'keyboard-navigation': { enabled: true },
        'focus-management': { enabled: true },
      },
    })
    
    expect(results).toHaveNoViolations()
  })
})
```

### Manual Accessibility Checklist
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] Keyboard navigation works throughout app
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader compatibility
- [ ] ARIA labels for interactive elements
- [ ] Semantic HTML structure
- [ ] Skip links for main content
- [ ] Error messages are accessible

---

## 📊 Test Coverage

### Coverage Goals
- **Overall Coverage**: 80%+
- **Statements**: 85%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 85%+

### Coverage Commands
```bash
# Run tests with coverage
npm run test:coverage

# Generate coverage report
npm run coverage:report

# View coverage in browser
npm run coverage:view
```

### Coverage Configuration
```typescript
// vitest.config.ts coverage settings
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.stories.tsx',
        'src/main.tsx',
        'vite.config.ts',
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 80,
          lines: 85,
          statements: 85,
        },
      },
    },
  },
})
```

---

## 🚀 Continuous Integration

### GitHub Actions Workflow

#### `.github/workflows/test.yml`
```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Run build
      run: npm run build

  e2e:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    
    - name: Run Playwright tests
      run: npx playwright test
    
    - name: Upload Playwright Report
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

### Quality Gates
- [ ] All tests must pass
- [ ] Coverage threshold met (80%+)
- [ ] No linting errors
- [ ] TypeScript compilation successful
- [ ] Build process successful
- [ ] No accessibility violations
- [ ] Performance benchmarks met

### Pre-commit Hooks

#### `package.json`
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "*.{js,jsx,ts,tsx}": [
      "npm run test:related"
    ]
  }
}
```

---

## 📝 Testing Best Practices

### General Guidelines
1. **Write tests before code** (TDD approach)
2. **Test behavior, not implementation**
3. **Use descriptive test names**
4. **Keep tests simple and focused**
5. **Avoid testing external dependencies**
6. **Mock appropriately, don't over-mock**
7. **Clean up after tests (teardown)**
8. **Use data-testid for stable element selection**

### Common Anti-patterns to Avoid
- ❌ Testing implementation details
- ❌ Over-mocking everything
- ❌ Tests that depend on other tests
- ❌ Unclear or generic test names
- ❌ Testing the framework itself
- ❌ Ignoring test failures
- ❌ Not cleaning up resources

### Test Data Management
```typescript
// src/test/fixtures/index.ts
export const createMockVideo = (overrides: Partial<Video> = {}): Video => ({
  id: '1',
  title: 'Mock Video',
  description: 'Mock Description',
  thumbnail: 'mock-thumbnail.jpg',
  videoUrl: 'mock-video.mp4',
  uploadDate: '2024-01-01',
  category: 'Entertainment',
  tags: ['mock', 'test'],
  views: 0,
  duration: '5:00',
  quality: '1080p',
  userId: 'user1',
  isPublic: true,
  ...overrides,
})

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'test-avatar.jpg',
  createdAt: '2024-01-01',
  ...overrides,
})
```

---

*Last updated: August 2025*
*For testing questions or issues, please create an issue on GitHub or contact the development team.*
