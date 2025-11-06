# Testing PartyPlan on iPad via Blink Terminal

## Prerequisites

1. **Expo Go app on your iPad**
   - Open App Store on iPad
   - Search for "Expo Go"
   - Install the free app

2. **Same network**
   - Your iPad and the server running the code must be on the same WiFi network

---

## Step 1: Start the Development Server

In your Blink terminal, run:

```bash
cd /home/user/PartyPlan
npm start
```

**What this does:**
- Starts the Expo development server
- Shows a QR code in the terminal
- Displays a URL like: `exp://192.168.x.x:8081`

**Important:** Use `npm start` (not `expo start --ios`) since we want to connect via Expo Go, not build native iOS.

---

## Step 2: Connect Your iPad

### Option A: Scan QR Code (Easiest)

1. The terminal will show a QR code
2. Open **Camera app** on iPad
3. Point camera at the QR code
4. Tap the notification that appears
5. Opens in Expo Go automatically

### Option B: Manual URL Entry (If QR doesn't work)

1. Look for the URL in terminal output: `exp://192.168.x.x:8081`
2. Open **Expo Go** app on iPad
3. Tap "Enter URL manually"
4. Type in the URL shown in terminal
5. Tap "Connect"

### Option C: Tunnel Mode (If same network doesn't work)

If your iPad and server aren't on the same network, use tunnel:

```bash
npm start -- --tunnel
```

This creates a public URL that works over internet (slower but more reliable).

---

## Step 3: Wait for Bundle to Load

**First time:**
- Takes 1-2 minutes to build JavaScript bundle
- You'll see progress in terminal
- iPad shows "Loading..." screen

**Subsequent runs:**
- Much faster (~10 seconds)
- Hot reload works for code changes

---

## Step 4: Verify App Loaded

You should see:
1. **AuthScreen** (if not logged in)
2. Email/password login form

If you see this, the app is running! 🎉

---

## Troubleshooting

### Issue: "Unable to connect to development server"

**Cause:** iPad and server not on same network

**Fix:**
```bash
# Stop current server (Ctrl+C)
npm start -- --tunnel
```

Then reconnect using the `exp://` URL shown.

---

### Issue: QR code not displaying in terminal

**Cause:** Terminal doesn't support QR rendering

**Fix:**
1. Look for the URL: `exp://192.168.x.x:8081`
2. Use Option B (manual URL entry)

Or:

```bash
npm start -- --web
```

Opens in web browser where you can see QR code.

---

### Issue: "Network response timed out"

**Cause:** Firewall blocking port 8081 or 19000

**Fix:**
```bash
# Try tunnel mode
npm start -- --tunnel
```

---

### Issue: App loads but crashes immediately

**Check terminal for error messages:**
- Missing dependencies?
- TypeScript errors?
- Database connection issues?

**Common fixes:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Clear cache
npx expo start --clear
```

---

## Testing the Features

Once the app is running, follow the test scenarios in `TESTING-PHASE-1-TASKS-1-2.md`:

### Quick Test Flow:

1. **Create an account / Log in**
   - Use any email/password (via Supabase)

2. **Set up profile**
   - Choose display name, emoji, color

3. **Add an artist plan**
   - Tap the "+" button
   - Select "Artist" tab
   - Search for an artist
   - Tap to add

4. **Test delete**
   - Long-press the artist pill
   - Confirm deletion
   - Should disappear instantly

5. **Test offline delete**
   - Add another artist
   - **Enable Airplane Mode on iPad**: Settings > Airplane Mode ON
   - Long-press and delete the artist
   - Should still disappear instantly
   - Pull down to refresh (will fail silently)
   - **Disable Airplane Mode**
   - Pull down to refresh again
   - Delete should complete (check console logs in terminal)

---

## Viewing Console Logs

### In Blink Terminal

All console.log, console.error, and console.warn will appear in the terminal where you ran `npm start`.

**Look for these messages:**
- `Delete queued for retry:` - When delete fails
- `Sync error:` - When sync fails
- `Alert.alert:` - When showing user alerts

### In Expo Go (iPad)

Shake your iPad to open developer menu:
- Tap "Debug Remote JS" to open Chrome DevTools
- View console in Chrome on your computer

---

## Hot Reload (Code Changes)

While the app is running:

1. **Make code change** in Blink terminal (e.g., with vim/nano)
2. **Save the file**
3. **App auto-reloads** on iPad within 1-2 seconds

This is great for testing fixes quickly!

---

## Stopping the Server

In Blink terminal:
- Press `Ctrl+C` to stop the development server
- App will disconnect from Expo Go

---

## Network Requirements

### For Local Connection (faster):
- iPad and server on same WiFi
- No firewall blocking ports 8081, 19000, 19001

### For Tunnel Connection (slower but works anywhere):
- Internet connection on both devices
- Uses Expo's ngrok-like tunnel
- Adds ~500ms latency

---

## Testing Checklist

Once app is running, complete these tests:

- [ ] App loads and shows login screen
- [ ] Can create account / log in
- [ ] Can add artist plan
- [ ] Can delete artist plan (see it disappear)
- [ ] Can delete in airplane mode (stays deleted)
- [ ] After reconnecting, deleted plan stays gone
- [ ] Can force-close app and restart (data persists)
- [ ] Can edit meetup plan
- [ ] Pull-to-refresh works

---

## Pro Tips

### Shake Gesture for Developer Menu

Shake your iPad while app is open:
- Reload app
- Toggle performance monitor
- Debug remote JS
- Enable/disable fast refresh

### Remote Debugging

1. Shake iPad → "Debug Remote JS"
2. Opens Chrome DevTools on your computer
3. Can set breakpoints, inspect state, view console

### Fast Refresh

Changes to UI components reload automatically without losing state. Changes to:
- New files
- Native modules
- App.tsx

Require full reload (shake → reload).

---

## Common Testing Workflow

```bash
# Terminal 1: Start server
cd /home/user/PartyPlan
npm start

# iPad: Scan QR code, wait for load

# Test feature, find bug

# Terminal 2: Make code change
vim src/screens/TimelineScreen.tsx
# Make fix
# Save file

# iPad: App auto-reloads with fix

# Test again
```

---

## Summary

**To start testing:**

```bash
cd /home/user/PartyPlan
npm start
```

**On iPad:**
1. Open Expo Go app
2. Scan QR code
3. Wait for bundle to load
4. Test the features!

**Having issues?** Try:
```bash
npm start -- --tunnel
```

Let me know when you've got it running and I'll help with specific tests!
