ZEST WEBSITE - GITHUB PAGES, TOMCAT AND MYSQL
================================================

GITHUB PAGES
- The public static site is https://petroskas.github.io/zest1/.
- Pushes to main publish index.html, css\, images\, js\ and data\ using the
  GitHub Pages workflow.
- GitHub Pages cannot run Java servlets or MySQL. The educational illustrations
  and downloadable CSV continue to work there; saving view counts requires the
  Tomcat application and a configured MySQL database.
- Contact and donation forms on the public static site open email or WhatsApp.
  The website does not process payments.

LOCAL WEBSITE (XAMPP PHP)
1. Copy the project to C:\xampp\htdocs\zest1.
2. Start Apache and MySQL from the XAMPP Control Panel.
3. Import database\schema.sql through http://localhost/phpmyadmin.
4. Open http://localhost/zest1/.
The optional PHP contact and donation endpoints remain separate from the
Tomcat demonstration API.

TOMCAT 10.1 + JAVA 17+ + MYSQL/MARIADB
The Tomcat WAR contains the static site and the Java demonstration API.

1. Start MySQL or MariaDB and import database\schema.sql; it creates the
   zest_db database and seeds six educational demonstrations. The data is not
   patient information.
2. Configure database access in Tomcat's bin\setenv.bat. Create this file
   locally if it does not exist; never commit real passwords:

       set "ZEST_DB_URL=jdbc:mysql://127.0.0.1:3306/zest_db?serverTimezone=UTC"
       set "ZEST_DB_USER=zest_user"
       set "ZEST_DB_PASSWORD=YOUR_LOCAL_DATABASE_PASSWORD"

   For a local XAMPP installation, use its configured MySQL username and
   password. Set a strong, private database password on any public server.
3. This project uses Jakarta Servlets and requires Tomcat 10.1; Tomcat 9 is not
   compatible with this WAR. From the project folder build with the installed
   Maven 3.10.0-rc-1:

       C:\apache-maven-3.10.0-rc-1\bin\mvn.cmd --batch-mode -f C:\xampp\htdocs\zest1\zest1\pom.xml package

4. Copy target\zest1.war into the installed Tomcat 10.1 webapps\ folder, then
   start or restart Tomcat. For example, with Tomcat installed at
   C:\apache-tomcat-10.1.59, browse to http://localhost:8080/zest1/.
5. Test GET http://localhost:8080/zest1/api/demos. Selecting a demonstration
   sends POST requests to /api/demos/{slug}/views. The database stores only one
   anonymous aggregate counter per demonstration, not viewer IDs, IP addresses,
   or personal health information.

DATASET AND DEMONSTRATIONS
- Download the small, six-row educational dataset from the seizure-types
  section or open data\seizure-demos.csv.
- database\schema.sql installs the same records into seizure_demos and creates
  seizure_demo_stats for aggregate view totals.
- The site uses its calm, non-flashing SVG illustrations; the CSV and API add
  demonstrations and first-aid guidance, not unverified video footage.
- These illustrations and first-aid tips are general education, not diagnosis
  or a substitute for advice from a qualified health professional.

GITHUB DEPLOYMENT
- Push commits to main to publish the static site on GitHub Pages.
- A separate GitHub Actions workflow builds target\zest1.war on Java 17 and
  makes it available as a workflow artifact. GitHub Pages does not host this
  WAR; deploy it to Tomcat 10.1 to enable the MySQL API. No server passwords or
  GitHub Actions secrets are included in the repository.
