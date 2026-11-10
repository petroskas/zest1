ZEST WEBSITE - GITHUB PAGES, PHP AND MYSQL
================================================

GITHUB PAGES
- The public static site is https://petroskas.github.io/zest1/.
- Pushes to main publish the HTML, CSS, JavaScript, images, supplied video
  illustrations and seizure dataset.
- GitHub Pages serves static files only. JavaScript uses email/WhatsApp actions
  for contact and story submissions when PHP is unavailable; PHP and MySQL are
  needed to store submissions and demonstration counts in the database.

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

DATASET AND DEMONSTRATIONS
- The six-row educational dataset is available in data\seizure-demos.csv.
- database\schema.sql installs the same records into seizure_demos and creates
  seizure_demo_stats for aggregate view totals.
- documents\ contains page images rendered from the supplied Zimbabwe National
  Disability Policy (2021) and Persons with Disabilities Act (2025) PDFs.
  Readers load a selected page image at a time; the source PDFs are excluded
  from GitHub Pages deployment and direct PDF access is blocked on Apache.
- Supplied MP4 illustrations appear under their corresponding seizure types.
- All videos require an explicit play action and use responsive HTML5 controls.
- Videos and first-aid tips are general education, not diagnosis or a substitute
  for advice from a qualified health professional.

READING ROOM
- The two reading-room buttons open local document pages inside the ZEST site;
  they do not open external publishers or navigate away from the project.
- Zimbabwe's supplied Policy and Act are displayed one original page image at a
  time, retaining the documents' printed layout.

GITHUB DEPLOYMENT
- Push commits to main to publish the static site on GitHub Pages.
- GitHub Pages cannot run PHP or MySQL. Point a PHP-capable domain to this
  project to enable database storage; use the static email/WhatsApp fallbacks
  on GitHub Pages.
