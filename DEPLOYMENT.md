# 🚀 Vercel Deployment Guide for Torrify

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Node.js**: Ensure you have Node.js 18+ locally

## Quick Deploy

### Option 1: Deploy Button (Fastest)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/torrify)

### Option 2: Manual Deployment

1. **Connect to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   # Deploy from your project directory
   vercel
   
   # Follow the prompts:
   # ? Set up and deploy "~/torrify"? [Y/n] y
   # ? Which scope do you want to deploy to? [your-username]
   # ? Link to existing project? [y/N] n
   # ? What's your project's name? torrify
   # ? In which directory is your code located? ./
   ```

3. **Production Deployment**
   ```bash
   # Deploy to production
   vercel --prod
   ```

## Environment Variables

Set these in your Vercel Dashboard under **Settings > Environment Variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `SCRAPING_TIMEOUT` | `25000` | Maximum time for scraping requests (ms) |
| `MAX_CONCURRENT_REQUESTS` | `4` | Maximum concurrent scraper requests |
| `CACHE_TTL` | `900000` | Cache time-to-live (15 minutes) |
| `REQUEST_DELAY` | `1000` | Delay between requests (ms) |
| `USER_AGENT` | `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36` | Browser user agent |
| `VERCEL` | `1` | Vercel deployment flag |

## Domain Configuration

### Custom Domain (Optional)
1. Go to your project in Vercel Dashboard
2. Navigate to **Settings > Domains**
3. Add your custom domain
4. Configure DNS records as instructed

### Default Domain
Your app will be available at: `https://your-project-name.vercel.app`

## Performance Optimizations

The deployment includes:

- ✅ **Edge Runtime**: Optimized for global performance
- ✅ **Automatic CDN**: Static assets cached globally
- ✅ **Function Optimization**: 1GB memory, 30s timeout
- ✅ **Playwright Support**: Browser automation ready
- ✅ **Smart Caching**: API responses cached for performance

## Monitoring & Analytics

### Built-in Monitoring
- **Real-time Analytics**: Available in Vercel Dashboard
- **Function Logs**: View API request logs
- **Performance Metrics**: Response times and error rates

### Error Tracking
Check the **Functions** tab in your Vercel Dashboard for:
- Error logs
- Performance metrics
- Usage statistics

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Test build locally first
   npm run build
   ```

2. **Function Timeouts**
   - Increase `maxDuration` in `vercel.json`
   - Optimize scraper timeout values

3. **Memory Issues**
   - Increase `memory` allocation in `vercel.json`
   - Currently set to 1024MB

4. **Playwright Issues**
   - Playwright is auto-installed via `vercel.json`
   - Check function logs for browser errors

### Debug Deployment
```bash
# View deployment logs
vercel logs [deployment-url]

# View function logs
vercel logs --function=api/search
```

## Security Considerations

### Environment Variables
- Never commit `.env.local` to git
- Use Vercel Dashboard for production variables
- Rotate sensitive tokens regularly

### Rate Limiting
- Built-in rate limiting protects scrapers
- Monitor usage in Vercel Analytics
- Adjust `MAX_CONCURRENT_REQUESTS` if needed

## Production Checklist

- [ ] ✅ Build passes locally (`npm run build`)
- [ ] ✅ Environment variables configured
- [ ] ✅ Custom domain configured (optional)
- [ ] ✅ Analytics enabled
- [ ] ✅ Error monitoring set up
- [ ] ✅ Rate limiting configured
- [ ] ✅ Legal disclaimers in place

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Issues**: Create GitHub issues for bugs

---

🎉 **Congratulations!** Your Torrify instance is now live and ready to search torrents globally! 