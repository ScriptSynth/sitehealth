# SiteHealth - Website Monitoring SaaS

A modern SaaS application that monitors websites for broken links, missing images, and asset failures.

## 🚀 Features

- ✅ **Real-time Website Monitoring** - Crawls websites up to depth 3
- ✅ **Broken Link Detection** - Finds 404s and broken internal links
- ✅ **Image & Asset Checking** - Detects missing images and files
- ✅ **Automated Daily Scans** - GitHub Actions runs scans every 24 hours
- ✅ **Beautiful Dashboard** - Modern UI with 3D animations and glassmorphism
- ✅ **Supabase Authentication** - Secure user authentication
- ✅ **CSV Export** - Download scan results

## 📋 Prerequisites

Before you begin, make sure you have:

1. **Node.js 18+** installed
2. **Supabase account** - [Sign up here](https://supabase.com)
3. **GitHub account** - For automated scans

## 🛠️ Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zudsddfvubmxuccmwvhk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_oaXpaNpHPwqDjDHfDUax7A_-AvZIH4p
CRON_SECRET=your_random_secret_here
```

### Step 3: Set Up Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Run the SQL from the artifacts folder
4. This creates `sites`, `scans`, and `issues` tables

### Step 4: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🤖 Automated Scans Setup

See `github_actions_setup.md` in the artifacts folder for complete instructions.

## 🔧 Troubleshooting

### "Add Site" button not working

1. Check browser console (F12)
2. Verify Supabase tables are created
3. Make sure you're logged in
4. Check that RLS policies are enabled

## 🎨 Tech Stack

- Next.js 16 + Tailwind CSS v4
- Supabase (PostgreSQL + Auth)
- Playwright (Web Crawler)
- GitHub Actions (Automation)

## 📝 License

MIT
