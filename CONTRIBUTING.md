# 🤝 Contributing to SlimeTube

Thank you for your interest in contributing to SlimeTube! This guide will help you understand our development process, coding standards, and how to submit your contributions effectively.

## 📑 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation Guidelines](#documentation-guidelines)
- [Issue Reporting](#issue-reporting)
- [Community Guidelines](#community-guidelines)

---

## 📜 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
Examples of behavior that contributes to creating a positive environment include:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

---

## 🚀 Getting Started

### Prerequisites
Before contributing, ensure you have:
- Node.js 18.x or higher
- npm 9.x or higher
- Git 2.x or higher
- A GitHub account
- Basic knowledge of React, TypeScript, and modern web development

### First-time Contributors
1. **Fork the repository** on GitHub
2. **Star the repository** to show your support
3. **Read through the documentation** (README.md, FEATURES.md, TESTING.md)
4. **Look for "good first issue" labels** for beginner-friendly tasks
5. **Join our discussions** to introduce yourself and ask questions

### Finding Issues to Work On
- 🟢 **Good First Issue**: Perfect for newcomers
- 🟡 **Help Wanted**: Community contributions welcomed
- 🔴 **Bug**: Something isn't working correctly
- 🟦 **Enhancement**: New feature or improvement
- 📝 **Documentation**: Documentation improvements needed

---

## 💻 Development Setup

### 1. Fork and Clone
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/StreamFlix.git
cd StreamFlix

# Add the upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/StreamFlix.git
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Verify installation
npm run type-check
```

### 3. Environment Setup
```bash
# Copy environment variables (if needed)
cp .env.example .env.local

# Edit environment variables as needed
# Note: Current version uses local storage, no external APIs required
```

### 4. Development Server
```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
# The app will automatically reload when you make changes
```

### 5. Verify Setup
```bash
# Run tests to ensure everything works
npm run test

# Run linting
npm run lint

# Check TypeScript
npm run type-check

# Build project
npm run build
```

---

## 🔄 Contributing Process

### 1. Planning Your Contribution
- **Check existing issues** for similar work
- **Create an issue** for new features or major changes
- **Discuss your approach** before starting significant work
- **Break large features** into smaller, manageable pieces

### 2. Development Workflow
```bash
# 1. Sync with upstream
git checkout main
git pull upstream main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes
# ... develop your feature ...

# 4. Test your changes
npm run test
npm run lint
npm run type-check

# 5. Commit your changes
git add .
git commit -m "feat: add your feature description"

# 6. Push to your fork
git push origin feature/your-feature-name

# 7. Create pull request on GitHub
```

### 3. Types of Contributions

#### 🐛 Bug Fixes
- Identify the root cause
- Write a test that reproduces the bug
- Fix the issue
- Ensure the test passes
- Update documentation if needed

#### ✨ New Features
- Create an issue to discuss the feature
- Design the feature with community input
- Implement with proper tests
- Update documentation
- Consider accessibility and performance

#### 📚 Documentation
- Fix typos and grammar
- Improve clarity and examples
- Add missing documentation
- Update outdated information
- Translate content (future)

#### 🎨 UI/UX Improvements
- Follow the design system
- Ensure responsive design
- Test across different devices
- Maintain accessibility standards
- Consider dark theme compatibility

---

## 📝 Coding Standards

### TypeScript Guidelines

#### Type Definitions
```typescript
// ✅ Good: Explicit types for interfaces
interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  uploadDate: string
  category: VideoCategory
  tags: string[]
  views: number
  duration: string
  quality: VideoQuality
  userId: string
  isPublic: boolean
}

// ✅ Good: Use enums for constants
enum VideoCategory {
  ENTERTAINMENT = 'Entertainment',
  EDUCATION = 'Education',
  MUSIC = 'Music',
  SPORTS = 'Sports',
  NEWS = 'News',
  GAMING = 'Gaming',
}

// ❌ Avoid: Any types
const data: any = fetchData()

// ✅ Good: Proper typing
const data: VideoData = fetchData()
```

#### Function Components
```typescript
// ✅ Good: Proper component typing
interface VideoCardProps {
  video: Video
  onPlay?: (videoId: string) => void
  className?: string
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  onPlay, 
  className 
}) => {
  const handlePlay = useCallback(() => {
    onPlay?.(video.id)
  }, [video.id, onPlay])

  return (
    <div className={cn('video-card', className)}>
      {/* Component content */}
    </div>
  )
}

// ❌ Avoid: Untyped props
export const VideoCard = ({ video, onPlay }) => {
  // ...
}
```

#### Hooks
```typescript
// ✅ Good: Custom hook with proper typing
interface UseVideoPlayerReturn {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  play: () => void
  pause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
}

export const useVideoPlayer = (videoRef: RefObject<HTMLVideoElement>): UseVideoPlayerReturn => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  // ... rest of implementation

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    seek,
    setVolume,
  }
}
```

### React Guidelines

#### Component Structure
```typescript
// ✅ Good: Well-structured component
import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2 } from 'lucide-react'

import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/utils/cn'

interface VideoPlayerProps {
  src: string
  poster?: string
  autoPlay?: boolean
  className?: string
  onPlay?: () => void
  onPause?: () => void
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  autoPlay = false,
  className,
  onPlay,
  onPause,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { isPlaying, volume, play, pause, setVolume } = useVideoPlayer(videoRef)

  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      pause()
      onPause?.()
    } else {
      play()
      onPlay?.()
    }
  }, [isPlaying, play, pause, onPlay, onPause])

  return (
    <motion.div 
      className={cn('video-player', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        className="w-full h-full object-cover"
      />
      
      <div className="video-controls">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlayToggle}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
        
        <div className="flex items-center gap-2">
          <Volume2 size={16} />
          <Slider
            value={[volume]}
            onValueChange={([value]) => setVolume(value)}
            max={100}
            step={1}
            className="w-20"
          />
        </div>
      </div>
    </motion.div>
  )
}
```

#### State Management
```typescript
// ✅ Good: Using context for global state
interface VideoContextValue {
  videos: Video[]
  isLoading: boolean
  error: string | null
  addVideo: (video: Omit<Video, 'id'>) => Promise<void>
  updateVideo: (id: string, updates: Partial<Video>) => Promise<void>
  deleteVideo: (id: string) => Promise<void>
  refreshVideos: () => Promise<void>
}

export const VideoContext = createContext<VideoContextValue | undefined>(undefined)

export const useVideo = (): VideoContextValue => {
  const context = useContext(VideoContext)
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider')
  }
  return context
}
```

### CSS/Styling Guidelines

#### Tailwind CSS Usage
```typescript
// ✅ Good: Semantic class grouping
<div className="
  flex items-center justify-between
  p-4 bg-gray-900 border border-gray-700 rounded-lg
  hover:bg-gray-800 transition-colors duration-200
">
  <h3 className="text-lg font-semibold text-white truncate">
    {title}
  </h3>
  <Badge variant="secondary" className="ml-2">
    {category}
  </Badge>
</div>

// ✅ Good: Using cn utility for conditional classes
<Button
  className={cn(
    'video-play-button',
    isPlaying && 'bg-green-600 hover:bg-green-700',
    !isPlaying && 'bg-gray-600 hover:bg-gray-700',
    className
  )}
  onClick={handlePlay}
>
  {isPlaying ? 'Pause' : 'Play'}
</Button>

// ❌ Avoid: Inline styles unless absolutely necessary
<div style={{ backgroundColor: 'red', padding: '10px' }}>
  Content
</div>
```

#### Responsive Design
```typescript
// ✅ Good: Mobile-first responsive design
<div className="
  grid grid-cols-1 gap-4
  sm:grid-cols-2 sm:gap-6
  md:grid-cols-3 md:gap-8
  lg:grid-cols-4
  xl:grid-cols-5
">
  {videos.map(video => (
    <VideoCard key={video.id} video={video} />
  ))}
</div>
```

### Error Handling
```typescript
// ✅ Good: Comprehensive error handling
const uploadVideo = async (videoData: VideoUploadData): Promise<void> => {
  try {
    setIsUploading(true)
    setError(null)

    // Validate input
    if (!videoData.file) {
      throw new Error('Video file is required')
    }

    if (videoData.file.size > MAX_FILE_SIZE) {
      throw new Error(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`)
    }

    // Upload video
    await videoService.upload(videoData)
    
    // Success feedback
    toast.success('Video uploaded successfully!')
    onUploadComplete?.()
    
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to upload video'
    
    setError(errorMessage)
    toast.error(errorMessage)
    
    // Log error for debugging
    console.error('Video upload failed:', error)
    
  } finally {
    setIsUploading(false)
  }
}
```

---

## 📋 Commit Guidelines

### Commit Message Format
We use the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Examples
```bash
# Good commit messages
git commit -m "feat(video-player): add fullscreen support"
git commit -m "fix(upload): handle quota exceeded error"
git commit -m "docs(readme): update installation instructions"
git commit -m "style(header): improve navigation spacing"
git commit -m "refactor(storage): extract IndexedDB operations"
git commit -m "test(video-card): add interaction tests"
git commit -m "perf(search): optimize search algorithm"
git commit -m "chore(deps): update dependencies"

# Multi-line commit with body
git commit -m "feat(search): add advanced filtering options

- Add category filter dropdown
- Add date range picker
- Add duration filter options
- Update search results layout
- Add filter persistence

Closes #123"
```

### Commit Best Practices
- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests when applicable
- Include breaking changes in the footer

---

## 🔀 Pull Request Process

### Before Creating a PR
- [ ] Your code follows the project's coding standards
- [ ] You have performed a self-review of your code
- [ ] Your changes generate no new warnings
- [ ] You have added tests that prove your fix is effective or that your feature works
- [ ] New and existing unit tests pass locally with your changes
- [ ] Any dependent changes have been merged and published

### PR Title Format
Use the same format as commit messages:
```
feat(video-player): add keyboard shortcuts for video controls
fix(upload): resolve thumbnail upload issue
docs(contributing): update development setup instructions
```

### PR Description Template
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes Made
- List the specific changes made
- Include any new dependencies
- Mention any configuration changes

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Accessibility testing completed (if UI changes)

## Screenshots (if applicable)
Include screenshots or GIFs of UI changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Related Issues
Closes #(issue number)
```

### Review Process
1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Verify all tests pass and coverage is maintained
4. **Documentation**: Ensure documentation is updated if needed
5. **Manual Testing**: Test the changes in development environment

### After PR Approval
1. **Squash and Merge**: We use squash merging to maintain clean history
2. **Delete Branch**: Delete the feature branch after merging
3. **Update Local**: Sync your local repository with the upstream

---

## 🧪 Testing Requirements

### Test Coverage Standards
- **Minimum Coverage**: 80% overall
- **New Features**: 90% coverage required
- **Bug Fixes**: Must include regression tests
- **UI Components**: Visual and interaction tests required

### Types of Tests Required

#### Unit Tests
```typescript
// ✅ Required: Test pure functions and utilities
describe('formatDuration', () => {
  test('formats seconds correctly', () => {
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(3661)).toBe('1:01:01')
  })
})

// ✅ Required: Test component logic
describe('VideoCard', () => {
  test('displays video information correctly', () => {
    render(<VideoCard video={mockVideo} />)
    expect(screen.getByText(mockVideo.title)).toBeInTheDocument()
  })
})
```

#### Integration Tests
```typescript
// ✅ Required: Test component interactions
describe('Video Upload Flow', () => {
  test('uploads video successfully', async () => {
    const user = userEvent.setup()
    render(<VideoUploadModal isOpen={true} onClose={vi.fn()} />)
    
    // Test complete upload flow
    const fileInput = screen.getByLabelText(/video file/i)
    await user.upload(fileInput, mockVideoFile)
    
    await user.type(screen.getByLabelText(/title/i), 'Test Video')
    await user.click(screen.getByRole('button', { name: /upload/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument()
    })
  })
})
```

#### E2E Tests (for major features)
```typescript
// ✅ Required: Test critical user journeys
test('user can upload and play video', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('text=Upload Video')
  
  // Upload flow
  await page.setInputFiles('input[type="file"]', 'test-video.mp4')
  await page.fill('[placeholder="Video title"]', 'E2E Test Video')
  await page.click('button:has-text("Upload")')
  
  // Verify upload success
  await expect(page.locator('text=Upload Successful')).toBeVisible()
  
  // Test playback
  await page.click('text=E2E Test Video')
  await page.click('[aria-label="Play"]')
  
  // Verify video plays
  const video = page.locator('video')
  await expect(video).toHaveJSProperty('paused', false)
})
```

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm run test VideoCard.test.tsx

# Run tests matching pattern
npm run test -- --grep "upload"
```

---

## 📖 Documentation Guidelines

### Documentation Standards
- **README**: Keep up-to-date with current features
- **Code Comments**: Explain complex logic and business rules
- **API Documentation**: Document all public interfaces
- **Type Definitions**: Use descriptive type names and JSDoc
- **Examples**: Provide practical usage examples

### JSDoc Comments
```typescript
/**
 * Uploads a video file to the storage system
 * 
 * @param videoData - The video data including file and metadata
 * @param options - Upload options including progress callback
 * @returns Promise that resolves to the uploaded video data
 * 
 * @example
 * ```typescript
 * const result = await uploadVideo(
 *   { 
 *     file: videoFile, 
 *     title: 'My Video',
 *     category: 'Entertainment' 
 *   },
 *   { onProgress: (progress) => console.log(progress) }
 * )
 * ```
 * 
 * @throws {Error} When file is too large or invalid format
 * @throws {QuotaExceededError} When storage quota is exceeded
 */
export async function uploadVideo(
  videoData: VideoUploadData,
  options?: UploadOptions
): Promise<Video> {
  // Implementation
}
```

### README Updates
When adding new features, update the README with:
- Feature description
- Usage examples
- Configuration options
- Screenshots (if UI changes)

---

## 🐛 Issue Reporting

### Bug Reports
Use the bug report template and include:
- **Environment**: OS, browser, Node.js version
- **Steps to Reproduce**: Clear, numbered steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Console Errors**: Any JavaScript errors
- **Additional Context**: Relevant information

### Feature Requests
Use the feature request template and include:
- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: How should it work?
- **Alternatives Considered**: Other approaches considered
- **Additional Context**: Examples, mockups, etc.

### Issue Labels
- 🐛 **bug**: Something isn't working
- ✨ **enhancement**: New feature or request
- 📝 **documentation**: Improvements or additions to documentation
- 🟢 **good first issue**: Good for newcomers
- 🟡 **help wanted**: Extra attention is needed
- 🔴 **priority-high**: High priority issue
- 🟦 **question**: Further information is requested

---

## 👥 Community Guidelines

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code review and collaboration
- **Email**: [Contact information if available]

### Getting Help
1. **Check Documentation**: README, wiki, existing issues
2. **Search Issues**: Someone might have asked before
3. **Create Discussion**: For questions and ideas
4. **Create Issue**: For bugs and feature requests

### Helping Others
- **Answer Questions**: Help other community members
- **Review PRs**: Provide constructive feedback
- **Improve Documentation**: Fix typos and add examples
- **Share Knowledge**: Write blog posts or tutorials

### Recognition
We recognize contributors through:
- **Contributors Section**: Listed in README
- **Release Notes**: Major contributions highlighted
- **Hall of Fame**: Outstanding contributors recognized
- **Recommendations**: LinkedIn recommendations for significant contributions

---

## 🏷️ Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/) (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Schedule
- **Patch Releases**: As needed for bug fixes
- **Minor Releases**: Monthly for new features
- **Major Releases**: When significant breaking changes occur

### Release Notes
Each release includes:
- **New Features**: What's new
- **Bug Fixes**: What was fixed
- **Breaking Changes**: What might break
- **Deprecations**: What's being phased out
- **Contributors**: Who helped make it happen

---

## 🎉 Recognition and Rewards

### Contributor Levels
- **First-time Contributor**: Welcome badge
- **Regular Contributor**: 5+ accepted PRs
- **Core Contributor**: 20+ accepted PRs + consistent quality
- **Maintainer**: Trusted with repository access

### Rewards
- **Swag**: Stickers, t-shirts for significant contributions
- **LinkedIn Recommendations**: For professional recognition
- **Conference Talks**: Opportunities to present about the project
- **Mentorship**: One-on-one guidance for career development

---

## 📞 Contact

### Maintainers
- **Primary Maintainer**: [Name] - [Email]
- **Technical Lead**: [Name] - [Email]
- **Community Manager**: [Name] - [Email]

### Quick Links
- 🐛 [Report a Bug](https://github.com/OWNER/StreamFlix/issues/new?template=bug_report.md)
- ✨ [Request a Feature](https://github.com/OWNER/StreamFlix/issues/new?template=feature_request.md)
- 💬 [Join Discussion](https://github.com/OWNER/StreamFlix/discussions)
- 📖 [View Documentation](https://github.com/OWNER/StreamFlix/wiki)

---

**Thank you for contributing to SlimeTube! 🎬**

Your contributions help make SlimeTube better for everyone. Whether you're fixing a bug, adding a feature, or improving documentation, your efforts are appreciated and valued by the entire community.

*Last updated: August 2025*
