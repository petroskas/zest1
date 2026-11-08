package org.zest.api;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@WebServlet("/api/demos/*")
public final class SeizureDemoServlet extends HttpServlet {
    private static final Logger LOGGER = Logger.getLogger(SeizureDemoServlet.class.getName());
    private static final String DEFAULT_DB_URL =
            "jdbc:mysql://127.0.0.1:3306/zest_db?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
    private static final String[] ALLOWED_DEMOS = {"tc", "ab", "fa", "my", "at", "to"};

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        configureResponse(response);
        String pathInfo = request.getPathInfo();
        if (pathInfo != null && !pathInfo.isEmpty() && !"/".equals(pathInfo)) {
            writeError(response, HttpServletResponse.SC_NOT_FOUND, "Demo endpoint not found.");
            return;
        }

        try (Connection connection = openConnection();
             PreparedStatement statement = connection.prepareStatement(
                     "SELECT d.slug, d.title, d.brain_type, d.description, d.first_aid, "
                             + "d.animation_class, s.view_count "
                             + "FROM seizure_demos d "
                             + "LEFT JOIN seizure_demo_stats s ON s.demo_slug = d.slug "
                             + "ORDER BY d.sort_order")) {
            List<String> demos = new ArrayList<>();
            try (ResultSet results = statement.executeQuery()) {
                while (results.next()) {
                    demos.add("{"
                            + "\"slug\":" + quote(results.getString("slug")) + ","
                            + "\"title\":" + quote(results.getString("title")) + ","
                            + "\"brainType\":" + quote(results.getString("brain_type")) + ","
                            + "\"description\":" + quote(results.getString("description")) + ","
                            + "\"firstAid\":" + quote(results.getString("first_aid")) + ","
                            + "\"animationClass\":" + quote(results.getString("animation_class")) + ","
                            + "\"views\":" + results.getLong("view_count")
                            + "}");
                }
            }
            if (demos.isEmpty()) {
                writeError(response, HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                        "The seizure demonstration dataset has not been imported.");
                return;
            }
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("[" + String.join(",", demos) + "]");
        } catch (SQLException exception) {
            LOGGER.log(Level.SEVERE, "Could not load the seizure demonstration dataset.", exception);
            writeError(response, HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "The demonstration database is unavailable.");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        configureResponse(response);
        String demoSlug = viewSlug(request.getPathInfo());
        if (demoSlug == null) {
            writeError(response, HttpServletResponse.SC_NOT_FOUND, "Demo endpoint not found.");
            return;
        }

        try (Connection connection = openConnection();
             PreparedStatement exists = connection.prepareStatement(
                     "SELECT 1 FROM seizure_demos WHERE slug = ?")) {
            exists.setString(1, demoSlug);
            try (ResultSet result = exists.executeQuery()) {
                if (!result.next()) {
                    writeError(response, HttpServletResponse.SC_NOT_FOUND, "Demo not found.");
                    return;
                }
            }

            try (PreparedStatement increment = connection.prepareStatement(
                    "INSERT INTO seizure_demo_stats (demo_slug, view_count) VALUES (?, 1) "
                            + "ON DUPLICATE KEY UPDATE view_count = view_count + 1")) {
                increment.setString(1, demoSlug);
                increment.executeUpdate();
            }
            try (PreparedStatement count = connection.prepareStatement(
                    "SELECT view_count FROM seizure_demo_stats WHERE demo_slug = ?")) {
                count.setString(1, demoSlug);
                try (ResultSet result = count.executeQuery()) {
                    if (result.next()) {
                        response.setStatus(HttpServletResponse.SC_OK);
                        response.getWriter().write("{\"ok\":true,\"views\":" + result.getLong("view_count") + "}");
                        return;
                    }
                }
            }
            throw new SQLException("Updated demonstration count could not be read.");
        } catch (SQLException exception) {
            LOGGER.log(Level.SEVERE, "Could not record a seizure demonstration view.", exception);
            writeError(response, HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "The demonstration view could not be saved.");
        }
    }

    private static String viewSlug(String pathInfo) {
        if (pathInfo == null || !pathInfo.matches("/[a-z]{2}/views")) {
            return null;
        }
        String slug = pathInfo.substring(1, pathInfo.length() - "/views".length());
        for (String allowed : ALLOWED_DEMOS) {
            if (allowed.equals(slug)) {
                return slug;
            }
        }
        return null;
    }

    private static Connection openConnection() throws SQLException {
        String url = System.getenv().getOrDefault("ZEST_DB_URL", DEFAULT_DB_URL);
        String user = System.getenv().getOrDefault("ZEST_DB_USER", "root");
        String password = System.getenv().getOrDefault("ZEST_DB_PASSWORD", "");
        return DriverManager.getConnection(url, user, password);
    }

    private static void configureResponse(HttpServletResponse response) {
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("X-Content-Type-Options", "nosniff");
    }

    private static void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.getWriter().write("{\"ok\":false,\"error\":" + quote(message) + "}");
    }

    private static String quote(String value) {
        StringBuilder json = new StringBuilder(value.length() + 2).append('"');
        for (int i = 0; i < value.length(); i++) {
            char character = value.charAt(i);
            switch (character) {
                case '"' -> json.append("\\\"");
                case '\\' -> json.append("\\\\");
                case '\b' -> json.append("\\b");
                case '\f' -> json.append("\\f");
                case '\n' -> json.append("\\n");
                case '\r' -> json.append("\\r");
                case '\t' -> json.append("\\t");
                default -> {
                    if (character < 0x20) {
                        json.append(String.format("\\u%04x", (int) character));
                    } else {
                        json.append(character);
                    }
                }
            }
        }
        return json.append('"').toString();
    }
}
