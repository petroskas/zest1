ZEST WEBSITE – GITHUB PAGES AND LOCAL SETUP
============================================
LIVE SITE
- GitHub Pages deploys this static site automatically when changes are pushed to main.
- The public site URL is https://petroskas.github.io/zest1/
- The workflow publishes only index.html, css\, images\ and js\. PHP and database files are not deployed.
- Contact messages open an email draft or a WhatsApp chat; the visitor must press Send.
- Donation pledges are not stored and payments are not processed by this website. Complete donations via
  EcoCash *153*2*2*056028# and use the WhatsApp link to notify ZEST if a reply is wanted.
- GitHub Pages does not run PHP or MySQL. Do not put passwords, API keys or private data in this repository.

LOCAL XAMPP SETUP (OPTIONAL PHP / MYSQL BACKEND)
1. Copy this whole "zest1" folder to: C:\xampp\htdocs\zest1
2. Open the XAMPP Control Panel and START Apache and MySQL.
3. Open http://localhost/phpmyadmin -> Import -> choose database\schema.sql -> Go.
   (This creates the database "zest_db" with the tables contact_messages and donation_pledges.)
4. Open http://localhost/zest1/ to browse the site. The GitHub Pages contact and donation flows use email
   and WhatsApp; the optional PHP endpoints in api\ are not connected to those static forms.

Notes
- Do NOT open index.html by double-clicking if you need the optional PHP endpoints; use XAMPP.
- Database login is in api\db.php (XAMPP default: root / no password). Change it before using the PHP API
  on any server, and never publish real production credentials.
- Photos, posters and logos are in the images\ folder.
  Replace any file with a better one using the same name and the site updates.
- Photos, posters and logos are in the images\ folder.
  Replace any file with a better one using the same name and the site updates.

NEW IN THIS VERSION (inclusive update)
- Accessibility panel (round button bottom-left, or Alt+M): audio mode / auto-read (Alt+A), read page (Alt+R), stop (Alt+S),
  voice commands, dyslexia font, high contrast, greyscale, invert, text size, line spacing, highlight links, big cursor,
  reading ruler, stop animations. Settings are remembered.
- Seizure types with safe, non-flashing animated demos (#types); causes, triggers, habits, home/school/work/public (#learn).
- Myth-corrected definition of epilepsy and seizures (About section).
- Seizure diary (CSV download) and daily medicine reminder (#tools) – stored only on the visitor's device.
- Video support (#meet): host/join Google Meet, Google Calendar link, and a free in-page video room (Jitsi).
- Live Google Map + directions in the footer (no API key needed).
- ZEST Assistant chatbot (bottom-right, Alt+C): built-in epilepsy knowledge base + live Wikipedia lookup, voice input.
- Emergency "Help line" button.
Note: video, map, Wikipedia and fonts need internet. Information is general education, not medical advice; have a clinician review it.
