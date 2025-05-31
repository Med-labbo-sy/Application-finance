<?php
// Inclure la configuration
require_once 'config/config.php';

// Définir la page par défaut
$page = getGet('page', 'accueil');

// Vérifier que la page demandée est valide
$pages_valides = ['accueil', 'apropos', 'contact'];
if (!in_array($page, $pages_valides)) {
    $_SESSION['error'] = "La page demandée n'existe pas.";
    $page = 'accueil';
}

// Chemin du fichier de la page
$page_file = PAGES_PATH . "/$page.php";
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo APP_NAME; ?> - <?php echo ucfirst($page); ?></title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <header>
        <nav class="nav-container">
            <a href="index.php" class="brand">
                <svg class="brand-logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#8E44AD" />
                            <stop offset="100%" style="stop-color:#E056FD" />
                        </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logo-gradient)" stroke-width="8"/>
                    <path d="M30 65 L50 25 L70 65 M40 50 L60 50" stroke="url(#logo-gradient)" stroke-width="8" fill="none" stroke-linecap="round"/>
                </svg>
                <span class="brand-text">Libé-Finance</span>
            </a>
            <ul class="nav-links">
                <li><a href="index.php?page=accueil" class="nav-link <?php echo $page === 'accueil' ? 'active' : ''; ?>">
                    <i class="fas fa-home"></i> Accueil
                </a></li>
                <li><a href="index.php?page=apropos" class="nav-link <?php echo $page === 'apropos' ? 'active' : ''; ?>">
                    <i class="fas fa-info-circle"></i> À propos
                </a></li>
                <li><a href="index.php?page=contact" class="nav-link <?php echo $page === 'contact' ? 'active' : ''; ?>">
                    <i class="fas fa-envelope"></i> Contact
                </a></li>
            </ul>
        </nav>
    </header>

    <main>
        <?php
        // Afficher les messages d'erreur s'il y en a
        if (isset($_SESSION['error'])) {
            echo '<div class="alert alert-error">' . htmlspecialchars($_SESSION['error']) . '</div>';
            unset($_SESSION['error']);
        }

        // Afficher les messages de succès s'il y en a
        if (isset($_SESSION['success'])) {
            echo '<div class="alert alert-success">' . htmlspecialchars($_SESSION['success']) . '</div>';
            unset($_SESSION['success']);
        }

        // Inclure le contenu de la page
        if (file_exists($page_file)) {
            include $page_file;
        } else {
            echo '<div class="alert alert-error">Erreur : fichier de page introuvable.</div>';
        }
        ?>
    </main>

    <footer>
        <div class="footer-content">
            <div class="footer-decoration">
                <i class="fas fa-city cityscape"></i>
            </div>
            <p>&copy; <?php echo date('Y'); ?> <?php echo APP_NAME; ?> - Votre partenaire en simulation financière</p>
            <p>Version <?php echo APP_VERSION; ?></p>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="js/calculations.js"></script>
    <script src="js/charts.js"></script>
    <script src="js/main.js"></script>
</body>
</html> 