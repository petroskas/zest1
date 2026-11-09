ZEST WEBSITE - GITHUB PAGES, PHP AND MYSQL
================================================

GITHUB PAGES
- The public static site is https://petroskas.github.io/zest1/.
- Pushes to main publish the HTML, CSS, JavaScript, images, supplied video
  illustrations and seizure dataset.
- GitHub Pages serves static files only. JavaScript uses email/WhatsApp actions
  for contact and story submissions when PHP is unavailable; PHP and MySQL are
  needed to store submissions and demonstration counts in the database.
- Gemini answers require a private server-side API key; static pages continue
  to provide built-in answers to common epilepsy and disability questions.

LOCAL OR PHP-CAPABLE WEBSITE (XAMPP)
1. Copy the project to C:\xampp\htdocs\zest1.
2. Start Apache and MySQL from the XAMPP Control Panel.
3. Import database\schema.sql through http://localhost/phpmyadmin.
4. Open http://localhost/zest1/zest1/ for this workspace. If you copy the
   repository's contents directly into C:\xampp\htdocs\zest1, open
   http://localhost/zest1/ instead.
Contact messages, donation pledges, seizure demo view totals and stories are
submitted to PHP endpoints under api\ and stored in MySQL. Anonymous stories
do not include a name or email in the database; all stories remain pending
until reviewed. Optional story photos are validated and stored outside the
public website folder by default. Set ZEST_STORY_UPLOAD_DIR to choose a
different private storage folder.

On a PHP-capable host other than XAMPP, set ZEST_DB_HOST, ZEST_DB_NAME,
ZEST_DB_USER and ZEST_DB_PASSWORD in the server environment. Do not commit
production database credentials.

GEMINI AND GOOGLE SEARCH
- The chatbot sends epilepsy and disability questions to the PHP server, which
  calls Gemini with Google Search grounding and returns source links.
- Create a Gemini API key in Google AI Studio. Set GEMINI_API_KEY in the web
  server's environment and restart Apache; optionally set GEMINI_MODEL. For a
  local XAMPP setup, configure SetEnv in a local Apache configuration file.
  Never put the key in JavaScript, HTML, GitHub Pages or a committed .env file.
- Without a configured key or PHP backend, the assistant uses its built-in
  epilepsy and disability FAQ. It declines unrelated topics.

DATASET AND DEMONSTRATIONS
- The six-row educational dataset is available in data\seizure-demos.csv.
- database\schema.sql installs the same records into seizure_demos and creates
  seizure_demo_stats for aggregate view totals.
- documents\ contains the supplied Zimbabwe National Disability Policy (2021)
  and Persons with Disabilities Act (2025). The site embeds them in its reader
  and does not display a download button. Browser PDF controls differ.
- Supplied MP4 illustrations appear under their corresponding seizure types.
- All videos require an explicit play action and use responsive HTML5 controls.
- Videos and first-aid tips are general education, not diagnosis or a substitute
  for advice from a qualified health professional.

ONLINE READING
- The disability reading room embeds public source pages where the publishers
  allow it and provides a link to read online if embedding is blocked.
- It does not offer a file-download button. External publishers control their
  own document viewers and policies.

GITHUB DEPLOYMENT
- Push commits to main to publish the static site on GitHub Pages.
- GitHub Pages cannot run PHP or MySQL. Point a PHP-capable domain to this
  project to enable database storage and Gemini; use the static email/WhatsApp
  fallbacks on GitHub Pages.
- No database password or Gemini API key is included in the repository.
