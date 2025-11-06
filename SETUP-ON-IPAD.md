# Setting Up PartyPlan on iPad (Blink Terminal)

## Step 1: Clone the Repository from GitHub

In your Blink terminal, run:

```bash
# Navigate to your home directory or projects folder
cd ~

# Clone the PartyPlan repository
git clone https://github.com/Ruckus000/PartyPlan.git

# Navigate into the project
cd PartyPlan
```

---

## Step 2: Checkout the Correct Branch

We're working on a feature branch with all the latest changes:

```bash
git checkout claude/implementation-phase-check-011CUreJDpbXcuuhmtiUgGvL
```

Or if you want to see all branches:

```bash
git branch -a
```

---

## Step 3: Install Dependencies

This will take a few minutes the first time:

```bash
npm install
```

**What this does:**
- Installs all React Native packages
- Installs Expo SDK
- Installs Supabase client
- Installs all dependencies

**Time:** 2-5 minutes depending on connection

---

## Step 4: Set Up Environment Variables (If Needed)

If the app needs Supabase credentials, you may need to create a `.env` file or check if credentials are already in the code.

**Check if there's a .env file:**
```bash
ls -la | grep env
```

If you need credentials, I can help you set them up.

---

## Step 5: Start the Development Server

```bash
npm start
```

This will:
- Start the Expo development server
- Show a QR code
- Display a URL to connect

---

## Step 6: Connect Your iPad

Follow the steps from the previous guide (`TESTING-ON-IPAD.md`):
1. Open Expo Go app on iPad
2. Scan the QR code with Camera app
3. Wait for bundle to load

---

## Troubleshooting

### Issue: `git clone` fails

**If repository is private:**
```bash
# You'll need to authenticate
git clone https://github.com/Ruckus000/PartyPlan.git
# Enter your GitHub username and password (or personal access token)
```

**To use SSH instead:**
```bash
git clone git@github.com:Ruckus000/PartyPlan.git
```

---

### Issue: Branch doesn't exist

**Check available branches:**
```bash
git branch -a
```

**Try the main branch:**
```bash
git checkout main
```

Or:
```bash
git checkout master
```

---

### Issue: `npm install` fails

**Try clearing npm cache:**
```bash
npm cache clean --force
npm install
```

---

### Issue: Permission errors

**You might need to set up Git config:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Quick Reference: Full Setup Commands

```bash
# 1. Clone repository
cd ~
git clone https://github.com/Ruckus000/PartyPlan.git
cd PartyPlan

# 2. Checkout feature branch
git checkout claude/implementation-phase-check-011CUreJDpbXcuuhmtiUgGvL

# 3. Install dependencies
npm install

# 4. Start development server
npm start

# 5. On iPad: Open Expo Go and scan QR code
```

---

## Alternative: If Repository is Private

If the repository is private and you can't clone it, you have a few options:

### Option A: Make Repository Public (Temporarily)
1. Go to GitHub.com on your iPad
2. Navigate to the repository
3. Settings → Change visibility to Public
4. Clone using the commands above
5. Change back to Private when done

### Option B: Use Personal Access Token
```bash
# Generate token at: https://github.com/settings/tokens
git clone https://YOUR_TOKEN@github.com/Ruckus000/PartyPlan.git
```

### Option C: Set Up SSH Key on iPad
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH Keys → New SSH key
# Then clone with SSH:
git clone git@github.com:Ruckus000/PartyPlan.git
```

---

## Checking Your Current Location

**Where am I?**
```bash
pwd
```

**What files are here?**
```bash
ls -la
```

**Is this the PartyPlan directory?**
```bash
ls
# Should see: src/, package.json, App.tsx, etc.
```

---

## Next Steps After Clone

Once you've successfully cloned and can see the project files:

1. ✅ Run `npm install` (only needed once)
2. ✅ Run `npm start`
3. ✅ Connect with Expo Go on iPad
4. ✅ Start testing!

---

## Need Help?

Let me know:
- Where the clone command fails (if it does)
- What error messages you see
- Whether the repository is public or private

I'll help you get it set up!
