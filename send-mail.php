<?php
// send-mail.php

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  exit("Méthode non autorisée.");
}

// Anti-spam : si le champ caché est rempli => bot
if (!empty($_POST["website"])) {
  http_response_code(200);
  exit("OK");
}

// Récupération + nettoyage
$name    = trim($_POST["name"] ?? "");
$company = trim($_POST["company"] ?? "");
$email   = trim($_POST["email"] ?? "");
$phone   = trim($_POST["phone"] ?? "");
$service = trim($_POST["service"] ?? "");
$message = trim($_POST["message"] ?? "");

// Validation minimale
if ($name === "" || $email === "" || $phone === "" || $message === "") {
  http_response_code(400);
  exit("Merci de remplir tous les champs obligatoires.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  exit("Email invalide.");
}

// CONFIG : mets ton email pro ici
$to = "contactalarmevo@gmail.com";

// Sujet + contenu
$subject = "Nouveau message via alarmevo.com — " . $service;

$body  = "Nouveau message depuis le site ALARMEVO\n\n";
$body .= "Nom: $name\n";
$body .= "Entreprise: " . ($company !== "" ? $company : "-") . "\n";
$body .= "Email: $email\n";
$body .= "Téléphone: $phone\n";
$body .= "Service: $service\n\n";
$body .= "Message:\n$message\n\n";
$body .= "IP: " . ($_SERVER["REMOTE_ADDR"] ?? "unknown") . "\n";

// Headers (important)
$headers = [];
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/plain; charset=UTF-8";
// Reply-To = le client (tu peux répondre direct)
$headers[] = "Reply-To: " . $email;

// Envoi
$ok = mail($to, $subject, $body, implode("\r\n", $headers));

// Redirection simple
if ($ok) {
  header("Location: merci.html");
  exit;
} else {
  http_response_code(500);
  echo "Erreur d'envoi. Réessaie ou contacte-nous par email.";
}
