# Administrator Setup Guide

## Secure Demo Credentials Setup

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Required: Groq API Key (for fast prompt enhancement)
# Get your key from: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# Required: OpenRouter API Key (for image generation)
# Get your key from: https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Required: Demo Credentials (for reviewer access only)
# IMPORTANT: These should be shared securely with reviewers, not committed to version control
DEMO_USERNAME=your_chosen_username
DEMO_PASSWORD=your_chosen_password

# Development server port (optional)
# VITE_PORT=5173
```

### 2. API Setup

#### Groq API Key (Prompt Enhancement)
1. **Get Groq API Key**:
   - Visit [Groq Console](https://console.groq.com/keys)
   - Create an account
   - Generate an API key
   - Add it to your `.env` file

2. **Why Groq?**:
   - Ultra-fast inference for prompt enhancement
   - Sub-second response times
   - Cost-effective for text processing
   - No API key exposure in frontend

#### OpenRouter API Key (Image Generation)
1. **Get OpenRouter API Key**:
   - Visit [OpenRouter](https://openrouter.ai/keys)
   - Create an account
   - Generate an API key
   - Add it to your `.env` file

2. **Why OpenRouter?**:
   - Provides access to Gemini models for image generation
   - No API key exposure in frontend
   - Cost-effective access to premium AI models
   - Built-in rate limiting and security features

### 3. Security Best Practices

- **Never commit credentials to version control**
- **Use strong, unique passwords for demo credentials**
- **Share credentials securely with reviewers (e.g., via encrypted email or secure messaging)**
- **Rotate credentials periodically if needed**
- **Keep the `.env` file in your `.gitignore`**

### 4. Example Secure Credentials

Here are some examples of secure demo credentials you could use:

```
DEMO_USERNAME=demo_reviewer_2024
DEMO_PASSWORD=ThumbnailDemo2024!
```

or

```
DEMO_USERNAME=ai_thumbnail_demo
DEMO_PASSWORD=SecureDemoPass123!
```

### 5. Sharing with Reviewers

When sharing credentials with reviewers:

1. **Use secure communication channels**
2. **Provide clear instructions on how to use the credentials**
3. **Include the DEMO_ACCESS.md file for reference**
4. **Set expectations about API limitations**

### 6. Production Deployment

For production deployment:

1. **Set environment variables in your hosting platform**
2. **Ensure the `.env` file is not included in deployment**
3. **Use platform-specific secret management if available**
4. **Monitor for any credential exposure**

### 7. Troubleshooting

If reviewers cannot log in:

1. **Verify environment variables are set correctly**
2. **Check that the application has been restarted after setting variables**
3. **Confirm credentials are being shared correctly**
4. **Test login functionality yourself**

If API calls fail:

1. **Verify Groq and OpenRouter API keys are valid**
2. **Check API keys have sufficient credits**
3. **Ensure the keys are properly set in environment variables**
4. **Monitor Groq and OpenRouter dashboards for usage and errors**

### 8. API Usage Monitoring

- Monitor Groq dashboard for usage statistics and performance
- Monitor OpenRouter dashboard for usage statistics
- Set up alerts for high usage or errors
- Track costs and usage patterns
- Consider implementing rate limiting if needed

---

**Remember: The security of demo credentials and API keys is crucial for maintaining controlled access to your application.**
