<?php
// Configuration de l'application en production
define('APP_NAME', 'Libé-Finance');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'production');

// Configuration de la base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'libefinance');
define('DB_USER', 'libefinance_user'); // À changer en production
define('DB_PASS', ''); // À définir en production

// Configuration des chemins
define('BASE_PATH', dirname(__DIR__));
define('INCLUDES_PATH', BASE_PATH . '/includes');
define('PAGES_PATH', BASE_PATH . '/pages');

// Configuration de la sécurité
define('SECURE_COOKIES', true);
define('SESSION_LIFETIME', 3600); // 1 heure
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'Strict');

// Configuration des erreurs
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', BASE_PATH . '/logs/error.log');

// Configuration du mail
define('MAIL_TO', 'contact@libefinance.com');
define('MAIL_FROM', 'noreply@libefinance.com');

// Fonction pour charger automatiquement les classes
spl_autoload_register(function ($class) {
    $file = BASE_PATH . '/classes/' . $class . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

// Fonctions utilitaires
function redirect($page) {
    header("Location: index.php?page=" . $page);
    exit();
}

function isPost() {
    return $_SERVER['REQUEST_METHOD'] === 'POST';
}

function getPost($key, $default = '') {
    return $_POST[$key] ?? $default;
}

function getGet($key, $default = '') {
    return $_GET[$key] ?? $default;
}

// Initialisation de la session si ce n'est pas déjà fait
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_lifetime' => SESSION_LIFETIME,
        'cookie_httponly' => true,
        'cookie_secure' => SECURE_COOKIES,
        'cookie_samesite' => 'Strict'
    ]);
} 