# BoxPlay - setup guide (all free tiers)

## Folder structure
App.js | app.json | eas.json | package.json | .env.example
src/config.js (ADMOB_RPM, CREATOR_SHARE, thresholds) | src/lib/{supabase,api}.js
src/screens/{Auth,Home,Detail,MyList,Me,CreatorUpload,Earnings,AdminReview,Legal}.js
src/components/{AdBanner,Poster}.js
supabase/schema.sql | supabase/functions/daily-stats/index.ts

## 1. Supabase (free)
1. supabase.com > New project. Settings > API: copy Project URL and anon key.
2. SQL Editor > paste supabase/schema.sql > Run.
3. Sign up in the app once, then run: update profiles set is_admin=true where email='YOUR_EMAIL';
4. Authentication > Providers > Email: turn off "Confirm email" while testing.

## 2. TMDB (free, metadata/posters only)
themoviedb.org > sign up > Settings > API > Request key (Developer). Copy the "API Key (v3)".

## 3. YouTube Data API v3 (free)
console.cloud.google.com > new project > APIs & Services > Library > enable "YouTube Data API v3" > Credentials > Create API key. Free quota is 10,000 units/day (a search costs 100, so cache results). In src/config.js, verify each YT_CHANNELS ID is the real channel ID of a channel that permits embedding.

## 4. AdMob (free)
admob.google.com > add app (Android) > copy App ID into app.json (androidAppId) and create Banner + Interstitial units, then paste IDs in src/config.js (AD). The files ship with Google's TEST IDs; never click your own live ads.

## 5. Run
cp .env.example .env  (fill keys)  >  npm install  >  npx expo prebuild  or build with EAS (ads need a dev/EAS build, not Expo Go).

## 6. Deploy the daily Edge Function
npm i -g supabase  >  supabase login  >  supabase link --project-ref YOUR_REF
supabase secrets set CRON_SECRET=pick-a-long-random-string
supabase functions deploy daily-stats --no-verify-jwt
Schedule (SQL Editor; enable pg_cron and pg_net under Database > Extensions):
select cron.schedule('boxplay-daily','5 0 * * *',$$ select net.http_post(url:='https://YOUR_REF.supabase.co/functions/v1/daily-stats', headers:='{"x-cron-secret":"pick-a-long-random-string"}'::jsonb) $$);

## 7. Build the APK with EAS (free tier)
npm i -g eas-cli  >  eas login (free expo.dev account)  >  eas build:configure  >  eas build -p android --profile preview
Download the APK link when the build finishes (free tier queues can take a while and have monthly build limits).

## Notes
- Free Supabase Storage caps files at 50 MB, so creator videos are limited to that size.
- Premium Basic ($2.99): hook RevenueCat/Google Play Billing and set profiles.is_premium on purchase (needs a Play Console account, which is a one-time $25 fee).
- Ad revenue goes to YOUR AdMob account. Creator earnings in the dashboard are estimates (ADMOB_RPM) that you pay out manually, so only pay what real AdMob income covers.
