# Vertex AI Integration Setup Guide

## Overview
The application has been migrated from **Google Generative AI** to **Google Cloud Vertex AI** for resume parsing. This provides better reliability, uptime, and enterprise-grade support.

## Changes Made

### 1. Dependency Update Required
You need to install the Vertex AI package:

```bash
npm install @google-cloud/aiplatform
```

### 2. Files Modified

#### `src/services/openai.service.js`
- **Old**: Used `@google/generative-ai` library
- **New**: Uses `@google-cloud/aiplatform` library (PredictionServiceClient)
- Function `parseResumeWithGemini()` now calls Vertex AI REST API instead of direct Gemini API
- Same JSON schema and extraction logic maintained
- Better error handling for Vertex AI-specific errors

#### `.env.dev`
Added new environment variables:
```env
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_CLOUD_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
```

## Prerequisites

### 1. Google Cloud Project Setup
1. Create a GCP project (if you don't have one)
2. Enable the Vertex AI API:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Search for "Vertex AI API" and enable it

### 2. Service Account Creation
1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Fill in the service account details
4. Grant the following roles:
   - **Vertex AI Service Agent**
   - **Vertex AI User**
   - **Vertex AI Administrator** (optional, for full access)
5. Create and download a **JSON key file**
6. Save this file securely in your project (e.g., `service-account-key.json`)

### 3. Authentication Setup

#### Option A: Using Service Account JSON (Recommended for Development)
1. Download the JSON key file from Google Cloud Console
2. Place it in your project (or any secure location)
3. Add to `.env.dev`:
```env
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account-key.json
```

#### Option B: Using Application Default Credentials (ADC)
1. Install Google Cloud CLI: https://cloud.google.com/sdk/docs/install
2. Run: `gcloud auth application-default login`
3. Select your GCP project
4. No need to set `GOOGLE_APPLICATION_CREDENTIALS` - it will auto-detect

#### Option C: Using Environment Variables
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### 4. Environment Variables Configuration

Update `.env.dev` with your GCP project details:

```env
# Vertex AI Configuration
GOOGLE_CLOUD_PROJECT_ID=my-project-id
GOOGLE_CLOUD_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

**Supported Regions:**
- `us-central1` (recommended for US)
- `europe-west1` (for EU)
- `asia-northeast1` (for Asia)

## API Endpoint Format

The Vertex AI endpoint follows this pattern:
```
projects/{PROJECT_ID}/locations/{REGION}/publishers/google/models/{MODEL_NAME}
```

Example:
```
projects/my-project-123/locations/us-central1/publishers/google/models/gemini-2.5-flash
```

## Model Names Supported

The application uses the model defined in `src/config/aiConstants.js`:
- `gemini-2.5-flash` (Current - Recommended)
- `gemini-1.5-flash` (Alternative)
- `gemini-1.5-pro` (Alternative - higher cost)

Update `ACTIVE_GEMINI_MODEL` in `aiConstants.js` to switch models.

## Installation Steps

1. **Install Vertex AI SDK:**
```bash
npm install @google-cloud/aiplatform
```

2. **Setup GCP Project** (as described in Prerequisites)

3. **Update Environment Variables:**
```bash
# Edit .env.dev and replace placeholder values
GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id
GOOGLE_CLOUD_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

4. **Restart the Application:**
```bash
npm run nodemon
```

5. **Test the Integration:**
- Upload a resume PDF
- Check logs for successful Vertex AI API calls
- Verify parsed data is returned correctly

## Error Handling

The service now handles Vertex AI-specific errors:

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid Vertex AI credentials" | Auth configuration issue | Check `GOOGLE_APPLICATION_CREDENTIALS` and credentials file |
| "Vertex AI quota exceeded" | API quota limit reached | Increase quota in GCP Console or reduce request volume |
| "Vertex AI service is temporarily overloaded" | Service temporarily unavailable | Implement exponential backoff retry logic |
| "No predictions returned" | Malformed request | Check endpoint URL and request format |

## Cost Comparison

### Google Generative AI (Previous)
- Limited free tier quotas
- Subject to availability issues
- Prone to 503 errors during high traffic

### Vertex AI (Current)
- Pay-per-use pricing (~$0.075 per 1M input tokens)
- Enterprise-grade reliability
- Better SLA and uptime guarantees
- Reduces 503 Service Unavailable errors

## Testing

### Test Resume Upload
```bash
curl -X POST http://localhost:8000/v1/create-resume/upload-previous-resume-file \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/resume.pdf"
```

### Expected Response
```json
{
  "success": true,
  "message": "Resume parsed successfully",
  "data": {
    "skills": [...],
    "employment": [...],
    "education": [...],
    ...
  }
}
```

## Troubleshooting

### Issue: "GOOGLE_APPLICATION_CREDENTIALS file not found"
**Solution**: Verify the file path is absolute and the file exists
```bash
ls -la /path/to/service-account-key.json
```

### Issue: "Project ID not found"
**Solution**: Ensure `GOOGLE_CLOUD_PROJECT_ID` matches your actual GCP project ID
```bash
gcloud config get-value project
```

### Issue: "Insufficient permissions"
**Solution**: Grant required roles to the service account:
- Vertex AI Service Agent
- Vertex AI User
- Vertex AI Predictor

### Issue: "Invalid region"
**Solution**: Use one of the supported regions:
- `us-central1`, `us-east1`, `us-west1`
- `europe-west1`, `europe-west4`
- `asia-northeast1`, `asia-east1`

## Monitoring & Logging

### Check Vertex AI Quota
1. Go to Google Cloud Console
2. Navigate to **Quotas & System Limits**
3. Search for "Vertex AI"
4. Monitor usage and request rates

### View Logs
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`
- Vertex AI API calls are logged with full error details

## Fallback Strategy (Future Implementation)

If you want to add automatic fallback to OpenAI GPT-4o-mini:
1. Uncomment OpenAI initialization in `openai.service.js`
2. Implement retry logic with fallback function
3. Uncomment `parseResumeWithOpenAI()` function
4. Add `OPENAI_API_KEY` to `.env.dev`

## References

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Vertex AI Generative AI SDK](https://cloud.google.com/vertex-ai/docs/generative-ai/sdk)
- [Vertex AI API Reference](https://cloud.google.com/vertex-ai/docs/reference)
- [Service Account Setup](https://cloud.google.com/docs/authentication/getting-started)
- [Gemini Models](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)

## Next Steps

1. Complete the setup following the Installation Steps above
2. Test with a sample resume
3. Monitor the logs for any issues
4. Adjust region or model based on your needs
5. Set up proper quota monitoring
