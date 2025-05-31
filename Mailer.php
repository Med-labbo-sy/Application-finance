<?php

class Mailer {
    private $to;
    private $from;
    
    public function __construct($to = 'contact@libefinance.com') {
        $this->to = $to;
    }
    
    public function sendContactEmail($name, $email, $subject, $message) {
        $this->from = $email;
        
        // En-têtes de l'email
        $headers = array(
            'From' => $name . ' <' . $email . '>',
            'Reply-To' => $email,
            'X-Mailer' => 'PHP/' . phpversion(),
            'Content-Type' => 'text/html; charset=UTF-8'
        );
        
        // Corps du message en HTML
        $htmlMessage = "
            <html>
            <head>
                <title>Nouveau message de contact - Libé-Finance</title>
            </head>
            <body>
                <h2>Nouveau message de contact</h2>
                <p><strong>Nom :</strong> " . htmlspecialchars($name) . "</p>
                <p><strong>Email :</strong> " . htmlspecialchars($email) . "</p>
                <p><strong>Sujet :</strong> " . htmlspecialchars($subject) . "</p>
                <p><strong>Message :</strong></p>
                <p>" . nl2br(htmlspecialchars($message)) . "</p>
            </body>
            </html>
        ";
        
        // Envoi de l'email
        try {
            $success = mail($this->to, "Contact Libé-Finance: " . $subject, $htmlMessage, $this->buildHeaders($headers));
            return $success;
        } catch (Exception $e) {
            error_log("Erreur d'envoi d'email: " . $e->getMessage());
            return false;
        }
    }
    
    private function buildHeaders($headers) {
        $compiledHeaders = '';
        foreach ($headers as $name => $value) {
            $compiledHeaders .= $name . ': ' . $value . "\r\n";
        }
        return $compiledHeaders;
    }
} 