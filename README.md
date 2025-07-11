# 🔍 Torrify - Meta-Torrent Search Engine

A modern, fast, and user-friendly torrent meta-search engine built with **Next.js 15**, **TypeScript**, and **TailwindCSS**. Search across multiple popular torrent sources from a single interface.

![Torrify Banner](public/banner.png)

## ✨ Features

### 🎯 Core Functionality
- **Multi-Source Search**: Aggregates results from The Pirate Bay, 1337x, YTS, Nyaa, and RARBG
- **Real-time Search**: Instant results with concurrent scraping
- **Smart Caching**: 15-minute LRU cache for lightning-fast repeat searches
- **Advanced Filtering**: Filter by source, category, minimum seeds, and more
- **Intelligent Sorting**: Sort by seeds, leechers, size, date, or title

### 🖥️ User Experience
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Mobile-First**: Fully responsive design that works on all devices
- **Dark Mode**: Automatic theme detection with manual toggle
- **Keyboard Shortcuts**: Press `/` to focus search bar
- **Loading States**: Skeleton loaders and progress indicators

### ⚡ Performance
- **Concurrent Scraping**: Search multiple sites simultaneously
- **Request Limiting**: Respectful rate limiting to target sites
- **Error Handling**: Graceful degradation when sources fail
- **Optimized Caching**: Smart cache invalidation and management

### 🛡️ Safety & Legal
- **No File Hosting**: Only aggregates search results, hosts no content
- **Educational Purpose**: Clear legal disclaimers and responsible usage
- **Privacy Focused**: No user tracking or data collection
- **Open Source**: Transparent codebase under MIT license

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/torrify.git
cd torrify

# Install dependencies
npm install

# Install Playwright browsers (for 1337x scraping)
npx playwright install chromium

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Scraping Configuration
SCRAPING_TIMEOUT=10000
CACHE_TTL=900000
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

# Rate Limiting
REQUEST_DELAY=1000
MAX_CONCURRENT_REQUESTS=4

# Development
NODE_ENV=development
```

## 🏗️ Architecture

### Project Structure
```
torrify/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/search/         # Search API endpoint
│   │   ├── search/             # Search results page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/             # Reusable UI components
│   │   ├── SearchBar.tsx      # Search input component
│   │   ├── TorrentCard.tsx    # Individual result card
│   │   ├── FilterPanel.tsx    # Filtering sidebar
│   │   └── LoadingSkeletons.tsx # Loading states
│   ├── lib/                    # Utility libraries
│   │   ├── cache.ts           # LRU caching system
│   │   └── utils.ts           # Helper functions
│   ├── scrapers/               # Scraping modules
│   │   ├── BaseScraper.ts     # Base scraper class
│   │   ├── PirateBayScraper.ts # The Pirate Bay
│   │   ├── LeetxScraper.ts    # 1337x (Playwright)
│   │   ├── YTSScraper.ts      # YTS Movies
│   │   ├── NyaaScraper.ts     # Nyaa Anime
│   │   ├── RarbgScraper.ts    # RARBG Torrents
│   │   ├── config.ts          # Scraper configurations
│   │   └── index.ts           # Scraper factory
│   └── types/                  # TypeScript definitions
│       └── index.ts           # All type definitions
├── public/                     # Static assets
├── .env.local                 # Environment variables
└── README.md                  # This file
```

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **Scraping**: Cheerio (static), Playwright (dynamic)
- **Caching**: LRU Cache with TTL
- **Icons**: Lucide React
- **Deployment**: Vercel/Railway ready

## 🔧 API Reference

### Search Endpoint

**GET/POST** `/api/search`

#### Query Parameters
- `q` (required): Search query string
- `sources` (optional): Comma-separated list of sources
- `category` (optional): Filter by category (movies, tv, anime, etc.)
- `sortBy` (optional): Sort field (seeds, leechers, size, date, title)
- `limit` (optional): Maximum results (default: 50)

#### Example Request
```bash
curl "http://localhost:3000/api/search?q=avengers&category=movies&limit=20"
```

#### Response Format
```json
{
  "results": [
    {
      "title": "Avengers: Endgame (2019) [1080p]",
      "magnetLink": "magnet:?xt=urn:btih:...",
      "seeds": 1547,
      "leechers": 234,
      "size": "2.3 GB",
      "uploadDate": "2019-07-30",
      "source": "YTS",
      "link": "https://yts.mx/movies/...",
      "category": "movies",
      "verified": true
    }
  ],
  "totalCount": 1,
  "sources": [...],
  "query": "avengers",
  "cached": false,
  "executionTime": 2341
}
```

## 🎨 Customization

### Adding New Scrapers

1. Create a new scraper class extending `BaseScraperClass`:

```typescript
// src/scrapers/NewSiteScraper.ts
export class NewSiteScraper extends BaseScraperClass {
  protected async performSearch(query: string, limit?: number) {
    // Implement scraping logic
    return results;
  }
}
```

2. Add configuration in `src/scrapers/config.ts`:

```typescript
export const SCRAPER_CONFIGS = {
  // ... existing configs
  newsite: {
    name: 'New Site',
    baseUrl: 'https://newsite.com',
    timeout: 10000,
    userAgent: DEFAULT_USER_AGENT,
    enabled: true,
    usePlaywright: false,
    rateLimit: 1000,
  },
};
```

3. Register in the factory function in `src/scrapers/index.ts`.

### Customizing UI Theme

Edit TailwindCSS classes in components or add custom CSS variables:

```css
/* src/app/globals.css */
:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #3b82f6;
}
```

## 📱 Mobile Support

Torrify is built with mobile-first responsive design:

- **Touch-Friendly**: Large tap targets and optimized spacing
- **Adaptive Layout**: Sidebar filters become bottom sheets on mobile
- **Optimized Performance**: Reduced payload and smart loading
- **PWA Ready**: Can be installed as a mobile app

## 🔒 Security & Privacy

### Privacy Features
- **No Tracking**: Zero analytics or user tracking
- **Local Storage Only**: Search history stored locally
- **No Personal Data**: No registration or personal information required
- **HTTPS Only**: Secure connections enforced

### Security Measures
- **Input Sanitization**: All user inputs are sanitized
- **Rate Limiting**: Prevents abuse and respects target sites
- **Error Isolation**: Scraper failures don't affect other sources
- **CORS Protection**: Proper CORS headers and validation

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Development Guidelines

1. **Code Style**: Follow ESLint and Prettier configuration
2. **TypeScript**: Maintain strict type safety
3. **Components**: Keep components small and focused
4. **Testing**: Add tests for new scrapers and utilities
5. **Documentation**: Update README for new features

### Adding Tests

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react

# Run tests
npm test
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup

```bash
# Fork and clone your fork
git clone https://github.com/yourusername/torrify.git
cd torrify

# Add upstream remote
git remote add upstream https://github.com/originaluser/torrify.git

# Install dependencies
npm install

# Start development
npm run dev
```

## ⚖️ Legal Disclaimer

**IMPORTANT**: Torrify is an educational project designed to demonstrate web scraping and meta-search techniques. 

- **No Content Hosting**: This application does not host, store, or distribute any torrent files
- **Educational Purpose**: Intended for educational and research purposes only
- **User Responsibility**: Users are responsible for complying with local laws and regulations
- **Respect Copyright**: Please respect intellectual property rights and copyright laws
- **No Liability**: The developers assume no liability for user actions or content accessed

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Torrify

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For hosting and deployment platform
- **TailwindCSS** - For the utility-first CSS framework
- **Playwright Team** - For the browser automation library
- **Open Source Community** - For the countless libraries and tools

## 📊 Project Stats

- **Language**: TypeScript
- **Framework**: Next.js 15
- **Lines of Code**: ~3000+
- **Components**: 15+
- **Supported Sources**: 4 (extensible)
- **Cache TTL**: 15 minutes
- **Mobile Support**: ✅
- **PWA Ready**: ✅
- **Open Source**: ✅

---

<div align="center">

**[🏠 Home](/)** • **[🔍 Search](/search)** • **[📚 Docs](#)** • **[🐛 Issues](https://github.com/yourusername/torrify/issues)** • **[💬 Discussions](https://github.com/yourusername/torrify/discussions)**

Made with ❤️ by the Torrify Team

</div>
