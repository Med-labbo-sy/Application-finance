<?php
// Configuration de l'application
define('APP_NAME', 'Libé-Finance');
define('APP_VERSION', '1.0.0');

// Configuration de la base de données (à utiliser plus tard)
define('DB_HOST', 'localhost');
define('DB_NAME', 'libefinance');
define('DB_USER', 'root');
define('DB_PASS', '');

// Configuration des chemins
define('BASE_PATH', dirname(__DIR__));
define('INCLUDES_PATH', BASE_PATH . '/includes');
define('PAGES_PATH', BASE_PATH . '/pages');

// Configuration des messages d'erreur
error_reporting(E_ALL);
ini_set('display_errors', 1);

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
    session_start();
} 