# SinzhuWaifu

## Current State
App uses Internet Identity (II) for auth but it's optional — users can use the app without logging in. The `useInternetIdentity` hook and `InternetIdentityProvider` are already set up in `main.tsx`. No login gate exists.

## Requested Changes (Diff)

### Add
- Full-screen login gate: if user is not authenticated (identity is undefined/anonymous), show a login page before accessing any part of the app
- Login page should show the SinzhuWaifu logo (https://files.catbox.moe/lasj0e.jpg), app name, and a prominent "Login with Google" button (Internet Identity supports Google sign-in)
- After login, show the main app as normal

### Modify
- `App.tsx`: wrap the entire app render with an auth check using `useInternetIdentity`. If `isInitializing`, show a loading spinner. If no `identity` or identity is anonymous, show the login screen. Otherwise render the main two-panel layout.

### Remove
- Nothing removed

## Implementation Plan
1. In `App.tsx`, import `useInternetIdentity` from `./hooks/useInternetIdentity`
2. Check `identity` — if principal is anonymous or undefined, render a `<LoginScreen>` component inline
3. `LoginScreen` shows: logo image, app title "🍀 sɪɴᴢʜᴜ ᴡᴀɪғᴜ ʙᴏᴛ 🍭", subtitle, and a button that calls `login()` — label it "Login with Google"
4. While `isInitializing`, show a centered loading spinner
5. After successful login (identity available and non-anonymous), render the full app as before
