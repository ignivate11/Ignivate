# 🚀 Deploy Ignivate to Vercel

## Step 1 — Get a Free Database (Neon)

1. Go to **https://neon.tech** → Sign up free
2. Create a new project → name it `ignivate`
3. On the dashboard, click **"Connection string"**
4. Copy **both** connection strings:
   - **Pooled connection** → this is your `DATABASE_URL`
   - **Direct connection** → this is your `DIRECT_URL`
   They look like: `postgresql://user:pass@host/ignivate?sslmode=require`

---

## Step 2 — Push the Database Schema

Run these commands in your terminal (in the project folder):

```bash
# Set your Neon URLs temporarily
export DATABASE_URL="postgresql://..."   # your Neon pooled URL
export DIRECT_URL="postgresql://..."     # your Neon direct URL

# Push schema to Neon
npx prisma db push

# Create the admin account
npx prisma db seed
```

Admin credentials after seeding:
- Email: admin@ignivate.in
- Password: admin@ignivate123

---

## Step 3 — Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ignivate.git
git push -u origin main
```

---

## Step 4 — Deploy on Vercel

1. Go to **https://vercel.com** → Sign in with GitHub
2. Click **"New Project"** → Import your `ignivate` repo
3. Vercel auto-detects Next.js — no build config needed
4. Before clicking Deploy, add these **Environment Variables**:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon **pooled** connection string |
| `DIRECT_URL` | Your Neon **direct** connection string |
| `AUTH_SECRET` | `lp5nNee0KEVoFCI2FGSMXXCfLt+s6YDXqvCLR8XzfyU=` |
| `NEXTAUTH_SECRET` | `lp5nNee0KEVoFCI2FGSMXXCfLt+s6YDXqvCLR8XzfyU=` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` (fill after deploy) |
| `CLOUDINARY_CLOUD_NAME` | `drpogxsns` |
| `CLOUDINARY_API_KEY` | `144782558725748` |
| `CLOUDINARY_API_SECRET` | `Tj3TbhrP3yB7cHCb85ugrE96pIg` |
| `RAZORPAY_KEY_ID` | Your Razorpay test key |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret key |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Your Razorpay test key (same as above) |

5. Click **Deploy** ✅

---

## Step 5 — After First Deploy

Once deployed, Vercel gives you a URL like `https://ignivate-abc.vercel.app`:

1. Go to Vercel → your project → **Settings → Environment Variables**
2. Update `NEXTAUTH_URL` to your actual URL: `https://ignivate-abc.vercel.app`
3. Click **Redeploy** (Deployments tab → 3-dot menu → Redeploy)

---

## Your site is live! 🎉

- **Landing page**: `https://your-app.vercel.app`
- **Admin**: `https://your-app.vercel.app/admin`
- **Products**: `https://your-app.vercel.app/products`

Login: `admin@ignivate.in` / `admin@ignivate123`
