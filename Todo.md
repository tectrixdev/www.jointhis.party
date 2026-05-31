# TODO

- [x] logos and branding
- [x] Add homepage
- [x] Add tool
- [x] fix light theme
- [x] Fix clutter in nav
- [x] Code cleanup
- [x] open source it all
- [x] Restrictions on subdomain creation like limitations and certain names
- [x] Add og-image
- [x] re-order documentation in forwarding and guides.
- [x] Finish guides (minecraft, ~~discord bot~~)
- [x] Terms of service / privacy policy
- [x] SEO (sitemap for example) (sitemap done, that should be everything!)
- [x] Add release and happy new year banner
- [x] Update unplayit.
- [x] Deploy to production (release)
- [x] SEO(google)
- [x] Add to tectrix.dev
- [x] Subdomain tool UI overhaul
- [x] Add logging name consistency.
- [x] ~~Router refresh tool page when record is created.~~ **Not possible**
- [x] Optimize CLI API.
- [x] Optimize records API.
- [x] Fix cloudflare bot protection blocking vercel.
- [x] Optimize CLI API to not fetch the dns api and just execute it instead.
- [x] Prevent user overwriting / hijacking SRV record.
- [x] Remove user id blacklist
- [ ] Fix est -> devtest SRV record conflict
- [ ] Translations
- [ ] ~~More rate limiting~~ + **better error handling.**
- [ ] Landing page remake
- [ ] Add moderation UI for moderators
- [ ] Use better auth admin plugin for moderation UI
- [ ] Select moderators and update privacy policy accordingly

## Guides / docs

- [ ] Finish discord guide
- [ ] Finish web guide
- [ ] Add guide for Euro truck
- [ ] Others?

## Better auth migration

- [x] get discord user id
- [x] fix duplicate records overwriting (DNS)
- [x] Add OTT auth
- [x] Add a way to communicate this with the CLI
- [ ] Implement captcha with cloudflare turnstile.

## These are now possible due to having an auth DB

- [ ] get discord user id properly
- [ ] implement alt mitigation better with profile info.

## Future / uncertain

- [ ] Store whole user object in domain comments + email user identification.
- [ ] second code cleanup (if needed)
- [ ] cloudflare proxy support using overwrite
- [ ] more editing options
- [ ] Minecraft unified server hub. (opt-in)
- [ ] Add proper login page (and use other identifier than discord user ID?) + turnstile
