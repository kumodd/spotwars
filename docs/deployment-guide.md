# InternetBillboard.space Deployment Guide

This guide covers how to deploy InternetBillboard.space (built on Next.js) to Vercel for free, and how to connect it to your custom domain (`internetbillboard.space`).

## Prerequisites

1. A [GitHub](https://github.com/) account with this repository pushed to it.
2. A free [Vercel](https://vercel.com/) account (sign up using your GitHub account).
3. Access to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare, Route53) where `internetbillboard.space` was purchased, to update DNS records.

---

## Step 1: Deploy to Vercel

Vercel is the creator of Next.js and provides a generous free tier that is perfect for this application.

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click the **Add New...** button and select **Project**.
3. In the "Import Git Repository" section, find your InternetBillboard repository and click **Import**.
4. You will be taken to the "Configure Project" screen.
   - **Project Name**: `internet-billboard` (or whatever you prefer)
   - **Framework Preset**: Next.js (this should be auto-detected)
   - **Root Directory**: `./` (leave as default)

---

## Step 2: Configure Environment Variables

Before clicking Deploy, expand the **Environment Variables** section. You need to copy everything from your local `.env.local` file. 

Add the following keys exactly as they appear in your local environment:

| Key | Value (Example) |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon/Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key |
| `RAZORPAY_KEY_ID` | Your Razorpay Live Key ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Live Secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Your Razorpay Live Key ID |
| `NEXT_PUBLIC_APP_URL` | `https://internetbillboard.space` |
| `NEXT_PUBLIC_MIN_BID_AMOUNT` | `49` |
| `OPENAI_API_KEY` | Your OpenAI API Key |
| `OPENAI_MODEL` | `gpt-4o-mini` |

> [!IMPORTANT]
> Make sure `NEXT_PUBLIC_APP_URL` is exactly `https://internetbillboard.space` (with no trailing slash) so that metadata, OpenGraph, and internal absolute URLs resolve correctly in production.

Once all variables are added, click **Deploy**.

Vercel will now build your application. This usually takes 1-2 minutes. Once it completes, you'll be given a free `*.vercel.app` subdomain to preview your live site.

---

## Step 3: Add Your Custom Domain

Now we will link the `internetbillboard.space` domain to your new Vercel deployment.

1. Go to your Vercel Project Dashboard.
2. Click on the **Settings** tab.
3. In the left sidebar, click **Domains**.
4. Enter `internetbillboard.space` in the input field and click **Add**.
5. Vercel will ask if you want to add `www.internetbillboard.space` as well. It is recommended to add both and set one to redirect to the other (Vercel sets this up automatically).

---

## Step 4: Configure DNS Records

After adding the domain in Vercel, it will show an "Invalid Configuration" error because your DNS records aren't pointing to Vercel yet. Vercel will provide you with the specific DNS records you need to add.

Usually, it requires adding two records at your Domain Registrar (where you bought the domain):

**For the root domain (`internetbillboard.space`):**
- **Type**: `A`
- **Name**: `@`
- **Value**: `76.76.21.21` (Vercel's IP address)

**For the www subdomain (`www.internetbillboard.space`):**
- **Type**: `CNAME`
- **Name**: `www`
- **Value**: `cname.vercel-dns.com.`

### Instructions based on common registrars:
- **Cloudflare**: Go to DNS -> Add Record. Make sure the proxy status (orange cloud) is turned **OFF** (DNS only) until Vercel issues the SSL certificate.
- **Namecheap**: Go to Domain List -> Manage -> Advanced DNS -> Add New Record.
- **GoDaddy**: Go to Domain Settings -> Manage DNS -> Add Record.

> [!TIP]
> DNS propagation can take anywhere from a few minutes to a few hours. Vercel will automatically provision a free SSL certificate for you once the DNS resolves correctly.

---

## Step 5: Verify the Production Setup

1. Wait for Vercel's domain page to show a green checkmark indicating the domain is active and verified.
2. Visit `https://internetbillboard.space` in your browser.
3. Test a mock transaction or sign-in flow to ensure that Supabase and Razorpay are communicating properly with the production URL.

### Troubleshooting
- **OAuth Login Fails**: Ensure you have added `https://internetbillboard.space` to your allowed Redirect URLs in your Supabase Dashboard (`Authentication` -> `URL Configuration`).
- **Razorpay Webhooks/Callbacks**: If you are using webhooks, ensure you update the Razorpay Dashboard to point to your new live domain instead of `localhost`.
