<?php
// Traitement du formulaire de contact
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $subject = $_POST['subject'] ?? '';
    $message = $_POST['message'] ?? '';
    
    // Validation simple
    $errors = [];
    if (empty($name)) $errors[] = "Le nom est requis";
    if (empty($email)) $errors[] = "L'email est requis";
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "L'email n'est pas valide";
    if (empty($subject)) $errors[] = "Le sujet est requis";
    if (empty($message)) $errors[] = "Le message est requis";
    
    if (empty($errors)) {
        try {
            $mailer = new Mailer();
            $success = $mailer->sendContactEmail($name, $email, $subject, $message);
            
            if ($success) {
                $_SESSION['success'] = "Votre message a été envoyé avec succès !";
                header('Location: index.php?page=contact');
                exit;
            } else {
                $errors[] = "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer plus tard.";
            }
        } catch (Exception $e) {
            error_log("Erreur lors de l'envoi du message: " . $e->getMessage());
            $errors[] = "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.";
        }
    }
}
?>

<div class="container">
    <div class="contact-page">
        <h2>Contactez-nous</h2>
        
        <?php if (isset($_SESSION['success'])): ?>
            <div class="alert alert-success">
                <?php 
                echo $_SESSION['success'];
                unset($_SESSION['success']);
                ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($errors)): ?>
            <div class="alert alert-error">
                <ul>
                    <?php foreach ($errors as $error): ?>
                        <li><?php echo htmlspecialchars($error); ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>

        <div class="contact-content">
            <div class="contact-info">
                <h3>Nos Coordonnées</h3>
                <div class="contact-details">
                    <p><i class="fas fa-envelope"></i> Email : contact@libefinance.com</p>
                    <p><i class="fas fa-phone"></i> Téléphone : +212 5XX-XXXXXX</p>
                    <p><i class="fas fa-clock"></i> Horaires : Lun-Ven, 9h-18h</p>
                </div>
            </div>

            <form id="contact-form" class="contact-form" method="POST" action="index.php?page=contact">
                <div class="form-group">
                    <label for="name">Nom complet</label>
                    <input type="text" id="name" name="name" required value="<?php echo isset($name) ? htmlspecialchars($name) : ''; ?>">
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required value="<?php echo isset($email) ? htmlspecialchars($email) : ''; ?>">
                </div>
                <div class="form-group">
                    <label for="subject">Sujet</label>
                    <input type="text" id="subject" name="subject" required value="<?php echo isset($subject) ? htmlspecialchars($subject) : ''; ?>">
                </div>
                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" rows="5" required><?php echo isset($message) ? htmlspecialchars($message) : ''; ?></textarea>
                </div>
                <button type="submit" class="btn-primary">
                    <i class="fas fa-paper-plane"></i> Envoyer
                </button>
            </form>
        </div>
    </div>
</div>

<script>
document.getElementById('contact-form').addEventListener('submit', function(e) {
    // Désactiver le bouton lors de l'envoi
    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
});
</script> 