# SinzhuWaifu — Bug Fix Pass

## Current State
A full Telegram-style waifu game app. Most UI is in place but multiple critical/high/medium bugs exist across auth, profile, voice messages, refer/coupon system, admin panel, and chat.

## Requested Changes (Diff)

### Add
- `sinzhu_userId` generation (unique ID per user) set at registration time in LoginModal
- Voice message actual audio capture and playback using MediaRecorder API
- Onex synchronization: coupon/refer/hunt Onex reflected in profile balance (sinzhu_profile.balance)
- Message edit/delete persistence to localStorage (survive page refresh)
- Admin `unlocked` state persisted to localStorage so admin doesn't re-login on every visit

### Modify
- **TelegramProfile.tsx**: Fix `isLoggedIn` to also return true for `sinzhu_local_auth` users; fix `form` initialization to load from `sinzhu_profile` localStorage for local auth users; fix logout to clear `sinzhu_local_auth` and reset App.tsx `loggedIn` state (via `onLogout` callback prop)
- **LoginModal.tsx**: On first registration, generate and save `sinzhu_userId` (random 8-char alphanumeric) to localStorage
- **App.tsx**: Pass `onLogout` callback to TelegramProfile; fix ads toggle reactivity (listen to localStorage storage events or use a state updater); generate `sinzhu_userId` if not present on load
- **ChatWindow.tsx**: Fix voice message recording using MediaRecorder (capture blob, store as dataURL in mediaUrl); fix waifu spawn message to exact format `A New [rarity] SealWaifu💫 Appeared... /hunt Character Name and add in Your Sealwaifu Collection 👾`; fix `/onex` command to read from `userOnex` localStorage; fix `/check` to search `uploadedWaifus` too; fix hunt to add 50 Onex to `userOnex`; fix harem sell to add Onex to `userOnex`; persist `localDeletedMsgIds` and `localEditedMsgs` to localStorage per-group
- **ReferPage.tsx**: Fix `myReferCode` to use `sinzhu_userId` (now actually set); make refer give Onex to the referrer (store pending rewards in localStorage indexed by referCode)
- **CouponPage.tsx**: Fix `userId` to use `sinzhu_userId` from localStorage
- **Admin.tsx**: Read `unlocked` initial state from `localStorage.getItem('sinzhu_admin_unlocked') === 'true'`; fix ad delete to also remove from localStorage `sinzhu_ads`; fix `handleToggleAds` to dispatch a custom event so App.tsx can react
- **ChatSidebar.tsx**: Fix `handleAddFriendToGroup` to actually add friend to group's member list in localStorage; fix Onex display to read from both `sinzhu_profile.balance` and `userOnex`

### Remove
- Google login / Internet Identity UI buttons from TelegramProfile (they are unreachable dead code for new auth system)
- Dead `Profile.tsx` and `Home.tsx` are left as-is (not imported, harmless)

## Implementation Plan
1. LoginModal: generate `sinzhu_userId` on first registration
2. App.tsx: `onLogout` prop for TelegramProfile, ads toggle reactivity via custom event listener
3. TelegramProfile: fix `isLoggedIn`, `form` init, logout handler, remove dead Google/II buttons
4. ChatWindow: fix MediaRecorder voice capture, spawn message, /onex, /check, hunt Onex, harem sell Onex, edit/delete persistence
5. Admin.tsx: persist unlocked state, fix ad delete localStorage, fix toggle event
6. ReferPage + CouponPage: use sinzhu_userId, fix refer logic
