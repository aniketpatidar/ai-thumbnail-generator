# AI Thumbnail Generator

A modern web application that helps YouTubers create professional thumbnails using AI. Upload your photo, answer a few questions, and get multiple thumbnail options optimized for both YouTube and Shorts.

## Features

- **Fast AI Integration**: Uses Groq API for ultra-fast prompt enhancement and OpenRouter for image generation
- **Dual Format Generation**: Creates both landscape (16:9) and portrait (9:16) thumbnails
- **Enhanced Prompt Generation**: AI-powered prompt enhancement with professional design guidance using Groq's Llama-3.1-8B-Instant
- **Text Placement Guidance**: Specific instructions for optimal text positioning and sizing
- **Image Positioning**: Detailed guidance on photo placement and visual balance
- **Multiple Download Options**: Download individual thumbnails, copy to clipboard, or download all as ZIP
- **Demo Authentication**: Secure demo access system for reviewers
- **Modern UI**: Beautiful, responsive interface with smooth animations

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI Services**:
  - **Groq API**: Ultra-fast prompt enhancement (Llama-3.1-8B-Instant)
  - **Google Gemini API**: Image generation (Gemini 2.5 Flash Image)
- **UI Libraries**: Framer Motion, Lucide React
- **Utilities**: JSZip, React Hot Toast
- **Authentication**: Secure demo credentials system

## Quick Start

### Prerequisites

- Node.js 18+
- Groq API key
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-thumbnail-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```

   Edit `.env` and add your API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   DEMO_USERNAME=your_demo_username
   DEMO_PASSWORD=your_demo_password
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## API Setup

### Groq API Key (Prompt Enhancement)

1. Visit Groq Console
2. Create an account and generate an API key
3. Add the key to your `.env` file as `GROQ_API_KEY`

### Google Gemini API Key (Image Generation)

1. Visit Google Gemini Console
2. Create an account and generate an API key
3. Add the key to your `.env` file as `GEMINI_API_KEY`

**Why This Setup?**
- **Groq**: Provides ultra-fast inference for prompt enhancement
- **Google Gemini**: Provides access to Gemini models for image generation
- **No API Key Exposure**: Both services prevent key exposure in frontend
- **Cost Effective**: Optimized for performance and cost

## Usage

### For Content Creators

1. **Upload Your Photo**: Drag and drop or click to upload your image
2. **Configure Settings**: Select video type, style, mood, and photo placement
3. **Generate Thumbnails**: Click generate to create multiple options
4. **Download & Share**: Download individual thumbnails or all as ZIP

### For Reviewers

1. **Access Demo**: Use credentials provided by administrator
2. **Test Features**: Explore all functionality with demo limitations
3. **Provide Feedback**: Test the complete user experience

## Enhanced AI Features

### Prompt Enhancement
The system uses Groq's Llama-3.1-8B-Instant to transform simple user inputs into detailed creative directions:

- **Ultra-Fast Processing**: Sub-second response times
- **Detailed Prompts**: Rich descriptions of visual scenes and aesthetics
- **Style Guides**: Specific notes for image generation
- **Color Palettes**: Recommended color schemes and moods
- **Composition Notes**: Layout and composition guidance

### Professional Design Guidance
Based on successful YouTube thumbnail patterns:

- **Text Placement**: Optimal positioning for maximum readability
- **Image Positioning**: Strategic placement for visual impact
- **Visual Balance**: Professional composition principles
- **Hierarchy**: Clear visual structure and flow

## Security Features

- **Secure API Access**: Both Groq and Google Gemini prevent API key exposure
- **Demo Authentication**: Fixed credentials for controlled access
- **Environment Variables**: Secure credential management
- **No Hardcoded Secrets**: All sensitive data in environment variables

## File Structure

```
ai-thumbnail-generator/
├── components/           # React components
│   ├── LoginForm.tsx    # Demo authentication
│   ├── EnhancedThumbnailCard.tsx  # Thumbnail display
│   └── ProgressIndicator.tsx      # Loading states
├── services/            # API services
│   ├── promptService.ts # Groq prompt enhancement (Llama-3.1-8B-Instant)
│   └── geminiService.ts # OpenRouter image generation (Gemini)
├── lib/                 # Utilities
│   ├── auth.ts         # Authentication logic
│   └── clipboardUtils.ts # Clipboard operations
├── App.tsx             # Main application
└── vite.config.ts      # Build configuration
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for fast prompt enhancement | Yes |
| `GEMINI_API_KEY` | Google Gemini API key for image generation | Yes |
| `DEMO_USERNAME` | Demo access username | Yes |
| `DEMO_PASSWORD` | Demo access password | Yes |

## Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting platform

3. **Set environment variables** in your hosting platform

### Security Considerations

- Never commit `.env` files to version control
- Use strong, unique demo credentials
- Share credentials securely with reviewers
- Monitor API usage and costs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the Apache 2.0 License.

## Support

For issues and questions:
1. Check the documentation
2. Review the setup guide
3. Contact the development team

---

**Built with modern web technologies and AI-powered creativity.**
