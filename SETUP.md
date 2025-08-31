# Quick Setup Guide

## Prerequisites

- Node.js 18 or higher
- Groq API key
- Google Gemini API key

## Installation Steps

### 1. Clone and Install

```bash
git clone <repository-url>
cd ai-thumbnail-generator
npm install
```

### 2. Environment Setup

Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` and add your credentials:
```env
# Required: Groq API Key (for fast prompt enhancement)
GROQ_API_KEY=your_groq_api_key_here

# Required: Google Gemini API Key (for image generation)
GEMINI_API_KEY=your_gemini_api_key_here

# Required: Demo Credentials
DEMO_USERNAME=your_demo_username
DEMO_PASSWORD=your_demo_password
```

### 3. Get API Keys

#### Groq API Key (Prompt Enhancement)
1. Visit Groq Console
2. Create an account
3. Generate an API key
4. Add it to your `.env` file

#### Google Gemini API Key (Image Generation)
1. Visit Google Gemini Console
2. Create an account
3. Generate an API key
4. Add it to your `.env` file

### 4. Start Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## AI Technology

The application uses a hybrid approach for optimal performance:

- **Groq API**: Ultra-fast prompt enhancement using Llama-3.1-8B-Instant
- **Google Gemini API**: Image generation using Gemini 2.5 Flash Image

**Why This Setup?**
- **Groq**: Provides sub-second inference for prompt enhancement
- **Google Gemini**: Provides access to Gemini models for image generation
- **Performance**: Optimized for speed and quality
- **Cost Effective**: Best of both worlds for performance and cost

## Demo Access

For reviewers and demo purposes:
- Username and password are set in environment variables
- No registration system - fixed credentials only
- Secure authentication using localStorage

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify your Groq and Google Gemini API keys are correct
   - Check that the keys have sufficient credits
   - Ensure the keys are properly set in `.env`

2. **Authentication Issues**
   - Verify demo credentials are set in `.env`
   - Check that the application has been restarted after setting variables

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that Node.js version is 18 or higher

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting platform

3. Set environment variables in your hosting platform

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique demo credentials
- Share credentials securely with reviewers
- Monitor API usage and costs

---

**Ready to create amazing thumbnails with ultra-fast AI processing!**
