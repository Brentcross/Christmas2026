# Christmas 2026

The Cross family's Christmas apps for 2026, hosted free on GitHub Pages at https://brentcross.github.io/Christmas2026/.

## For Unto Us (Christmas scavenger hunt race)

`for-unto-us/` is a Christ-centered Christmas scavenger hunt, run as a race around the house. Its theme is Isaiah 9:6: every card a player finds adds the next phrase of the verse, until the whole verse is written at the manger. Each stop has a story, scriptures from the Bible and the Book of Mormon, a painting, and a task for the group (put words in order, fill in a missing word, do something together, or, at the manger, add gifts for the Savior).

It is served at https://brentcross.github.io/Christmas2026/for-unto-us/ (the site's root page sends visitors there). The QR cards point at that address, so print them from this site.

### How it works

Three screens share one live game, plus a print page:

- **Players** (`for-unto-us/`) sign up on their phones as a solo player or a team (team name plus members), each with a 4-digit PIN. The PIN gets them back into their game later in the night or on another phone, and keeps others out. When the MC starts the hunt, every phone gets clue 1 at the same moment. Each player solves the riddle, finds the hidden card, and scans its QR code (or types its code) to open that part of the story and its task; the next riddle unlocks after the task. A card scanned too early is refused without giving anything away, Herod's decoy cards send players back, and rescanning an earlier card shows its story again.
- **TV** (`for-unto-us/tv.html`) shows a join QR code, then the race standings, the verse being written, the clues the MC has opened (hiding spot and code), a log of which hints went out (never their text), who reached the manger first, the gifts for the Savior, and finally the whole verse.
- **MC console** (`for-unto-us/mc.html`, unlocked with the MC passphrase) starts the hunt and shows who is stuck on which clue and for how long. Hints are MC-only: players never see a hint, the line for little ones, a hiding spot or a code until the MC releases it. For each clue the MC can release, independently and in any order, Hint 1 (a nudge), Hint 2 (a strong hint), the little-ones line, and Open (the hiding spot and code, which also go up on the TV). A release reaches every phone on that clue at once, and anyone who gets there later. Each clue's riddle, answer, solution and setup note sit in a fold for the MC's reference. The MC also resets forgotten PINs, removes players, clears everyone's progress (players stay) or starts a new game.
- **Print** (`for-unto-us/print.html`, also unlocked with the MC passphrase) prints the QR cards (every card looks the same apart from its code, and the cards are sorted by code so the stack gives nothing away) and the answer key: for each station its phrase, riddle, answer, hiding spot, setup note, solution, hints, little-ones line and code, plus the decoys. Print the cards at 100% on card stock and test one with a phone before hiding them.

### Hosting

`.github/workflows/pages.yml` publishes `index.html` and `for-unto-us/` to GitHub Pages on every push to `main` (Settings > Pages > Source: GitHub Actions). Nothing else in the repo is published.

### Live game setup (Firebase, free)

Without setup the app runs in demo mode: everything stays in one browser, so you can try it with the MC, TV and a few player tabs on one computer. To play across phones:

1. Go to https://console.firebase.google.com, add a project (Analytics not needed).
2. Build > Realtime Database > Create database (any location, start in locked mode).
3. On the Rules tab, paste and publish:
   ```json
   { "rules": { "games": { "$game": { ".read": true, ".write": true } } } }
   ```
4. Copy the database address shown on the Data tab (like `https://your-project-default-rtdb.firebaseio.com`) into `firebaseUrl` in `for-unto-us/config.js`, then deploy.

Change `gameId` in `config.js` to start a fresh game (for example each year). The rules let anyone with the address read and write the game, which is fine for a family party; PINs are stored hashed.

### The hunt is sealed

The repo is public, so the hunt's secrets (card codes, hiding spots, riddles, answers, solutions, hints, little-ones lines, setup notes, station stories) never appear in it in plain text.

- `hunt-private/hunt.json` is the plain hunt, the one file you edit. It is git-ignored and never deployed. Its shape is `tools/fixtures/sample-hunt.json`. Each station has its `code`, `phrase`, `title`, `clue` (the riddle that leads to it), `hide` (where the card goes), `setup` (notes for whoever hides the cards, such as what to do when the house has no such spot), `answer`, `solution`, `hint`, `hint2`, `kids`, and the player-facing `story`, `scriptures`, `ponder`, `challenge` and `art`. `decoys` lists Herod's cards with their codes, hiding spots and `why` (the wrong turn each one catches, shown to the MC only).
- **Warning:** `hunt-private/` holds the whole hunt in plain text: never serve it (keep any local server bound to 127.0.0.1, as below) and never commit it.
- `for-unto-us/hunt.sealed.js` is generated from it and committed. Only the title, intro, verse phrases, cover art and a few messages (the decoy message, the "not yet" lines) are readable. Everything else is encrypted (AES-256-GCM): each station's part opens only with its card's code, the first riddle opens only with the key the MC console publishes when the MC presses Start, and the whole hunt (for the MC console and the print page) opens only with the MC passphrase.

**The MC passphrase** opens everything. Make a strong one with `node tools/seal-hunt.mjs new-passphrase`, keep it in a password manager, and give it only to the MC. Never commit it, never put it in a file in the repo, and never paste it into an issue or a chat. The tools read it from the `FOR_UNTO_US_PASSPHRASE` environment variable; `read -rs` keeps it out of your shell history:

```sh
read -rs FOR_UNTO_US_PASSPHRASE && export FOR_UNTO_US_PASSPHRASE   # type the passphrase, then Enter
```

**To edit the hunt:**

```sh
node tools/seal-hunt.mjs unseal          # recreate hunt-private/hunt.json from the sealed file (any computer)
# edit hunt-private/hunt.json
node tools/seal-hunt.mjs seal            # seal it again (keeps the card codes and the start key; stamps version.js)
node tools/seal-test.mjs                 # check the seal, then commit for-unto-us/hunt.sealed.js and for-unto-us/version.js
```

- **Card codes.** A plain `seal` keeps every code, so cards already printed (and cards players have already found) keep working. `seal --new-codes` gives every station and decoy a fresh 6-character code (no look-alike letters), writes them into `hunt-private/hunt.json`, and makes every printed card stop working: print the cards and the answer key again, and clear progress in the MC console. To add a station or decoy, either give it a new code yourself (6 characters from `ABCDEFGHJKMNPQRSTUVWXYZ23456789`, different from every other code) and print just its card, or leave its `code` out and seal with `--new-codes`, then reprint every card.
- **Reprint the answer key** after any edit to riddles, hints, hiding spots or setup notes; the cards themselves only change when the codes do.
- **After a rehearsal** in which the MC pressed Start, seal with `--new-start-key` (the old key was readable in the database while the hunt ran), then press Start again on the night.
- `seal` refuses a weak passphrase, codes that are already public, and replacing a hunt sealed with a different passphrase (`--force`). `node tools/seal-hunt.mjs stamp` writes a new cache-busting stamp after changing HTML, CSS or JS without resealing.

### Files

- `for-unto-us/index.html` (players), `tv.html`, `mc.html` and `print.html` are the pages.
- `for-unto-us/hunt.sealed.js` (generated) holds the sealed hunt, and `for-unto-us/seal.js` opens it in the browser.
- `for-unto-us/store.js` keeps the shared game state (Firebase REST and live updates, or demo mode); `for-unto-us/config.js` says where.
- `for-unto-us/version.js` (generated) holds the build stamp that every page adds to its files' URLs, so phones never mix old and new files.
- `for-unto-us/css/` is the shared look; `for-unto-us/fonts/` holds the self-hosted fonts and their OFL licenses.
- `for-unto-us/art/` holds the paintings, courtesy of The Church of Jesus Christ of Latter-day Saints, used under the Church's terms for personal, noncommercial use. `for-unto-us/art/CREDITS.md` lists each painting, alphabetically by title, with its file, Gospel Media page and usage notice. The image files have random names, so neither the names nor the credits give away which painting belongs to which station.
- `for-unto-us/qrcode.js` is the [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) library (MIT).

### Tests

`.github/workflows/tests.yml` runs the sealing and game-state tests on every push. Add the MC passphrase as the repository secret `FOR_UNTO_US_PASSPHRASE` (Settings > Secrets and variables > Actions) and it also checks the real sealed hunt and plays the whole race end to end.

To run them locally, the browser tests need `playwright` (plus `jsqr` and `pngjs` for the QR checks) importable from the repo root, for example a `node_modules` folder symlinked in while testing (it is git-ignored; never commit it), and Chromium via `CHROMIUM` if Playwright's bundled browser isn't installed. `for-unto-us-test.mjs` also uses `pdfinfo` and `pdftoppm` (poppler).

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory .   # from the repo root, in another terminal
node tools/seal-test.mjs                               # the sealing (add FOR_UNTO_US_PASSPHRASE to check the real hunt too)
FOR_UNTO_US_RELEASE=1 node tools/seal-test.mjs         # before deploying (with FOR_UNTO_US_PASSPHRASE): also fails if the site holds the sample hunt
node tools/store-test.mjs                              # the game state, against a stand-in for Firebase
node tools/for-unto-us-test.mjs [screenshot folder]    # the whole race, end to end (needs FOR_UNTO_US_PASSPHRASE)
```

- `seal-test.mjs` checks that every card opens only its own part, wrong codes and passphrases open nothing, no secret text is readable in the sealed file, and the browser opens exactly what the tool sealed.
- `store-test.mjs` checks the shared game state, including two phones on one team and a phone waking from sleep.
- `for-unto-us-test.mjs` plays the whole race on the real sealed hunt, each screen in its own browser like separate devices, against a small in-memory stand-in for Firebase (it never touches the real database): MC unlock, sign-ups, Start, every station and task type, every kind of MC release, sign-in on another phone, PIN reset, the TV, the print page (every printed QR code is decoded), clear progress, new game and demo mode. It also fetches every file the site serves and fails if any of them contains a code, hiding spot, answer, solution, hint, little-ones line, setup note, riddle or station text, and checks at every step that no phone shows anything it hasn't earned or the MC hasn't released. Set `URL` if the server isn't on `http://localhost:8080/`.
