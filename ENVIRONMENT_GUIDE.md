# Environment Configuration Guide

## 📋 Available Commands

| Command | Environment File | Description |
|---------|------------------|-------------|
| `npm run generic` | `.env` | Default environment (local development) |
| `npm run dev` | `.env.dev` | Development environment |
| `npm run uat` | `.env.uat` | User Acceptance Testing environment |
| `npm run prod` | `.env.prod` | Production environment |

## 🐧 Linux Commands

| Command | Environment File | Description |
|---------|------------------|-------------|
| `npm run generic:linux` | `.env` | Default environment (Linux/Mac) |
| `npm run dev:linux` | `.env.dev` | Development environment (Linux/Mac) |
| `npm run uat:linux` | `.env.uat` | UAT environment (Linux/Mac) |
| `npm run prod:linux` | `.env.prod` | Production environment (Linux/Mac) |

## 📁 Environment Files

- **`.env`** - Default configuration (used by `generic` command)
- **`.env.dev`** - Development configuration
- **`.env.uat`** - UAT configuration  
- **`.env.prod`** - Production configuration
- **`.env.production`** - Render production template

## 🚀 Usage Examples

### Local Development
```bash
npm run generic        # Uses .env file
npm run dev           # Uses .env.dev file
```

### Production
```bash
npm run prod          # Uses .env.prod file
npm run prod:linux    # Uses .env.prod file (Linux/Mac)
```

### Testing
```bash
npm run uat           # Uses .env.uat file
```

## 🔧 How It Works

The application automatically loads the correct environment file based on the `NODE_ENV` variable:

```javascript
// In index.js
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env";
dotenv.config({ path: envFile });
```

- **With NODE_ENV**: Loads `.env.{NODE_ENV}` (e.g., `.env.prod`)
- **Without NODE_ENV**: Loads default `.env` file

## ⚙️ Environment File Contents

### `.env` (Default)
- Local database connection
- Development CORS settings
- Local frontend URL

### `.env.prod` 
- Production database (Render PostgreSQL)
- Production CORS settings
- Vercel frontend URL

### `.env.dev`
- Development database
- Cross-origin settings for Vercel testing

## 📝 Notes

- Windows uses `set NODE_ENV=value`
- Linux/Mac uses `NODE_ENV=value` 
- The `:linux` scripts are for Unix-based systems
- Always check which environment file is being loaded (console output shows the file path)

## 🔍 Troubleshooting

**Error: Environment file not found**
- Make sure the environment file exists (e.g., `.env.prod`)
- Check the console output to see which file it's trying to load

**Wrong environment loaded**
- Verify the script you're running
- Check if NODE_ENV is being set correctly in package.json