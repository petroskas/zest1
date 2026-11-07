ZEST WEBSITE – SETUP (XAMPP on Windows)
========================================
1. Copy this whole "zest" folder to:  C:\xampp\htdocs\zest
2. Open the XAMPP Control Panel and START "Apache" and "MySQL".
3. Open http://localhost/phpmyadmin  ->  Import  ->  choose database\schema.sql  ->  Go.
   (This creates the database "zest_db" with the tables contact_messages and donation_pledges.)
4. Open http://localhost/zest/  – the contact form and donation pledge now save to MySQL.
5. View submissions: phpMyAdmin -> zest_db -> contact_messages / donation_pledges
   (or the ready-made view v_new_messages for unanswered messages).

Notes
- Do NOT open index.html by double-clicking: the forms need Apache/PHP (http://localhost/zest/).
- Database login is in api\db.php (XAMPP default: root / no password). Change it before going live.
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
