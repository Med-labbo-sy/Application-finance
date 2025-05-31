<div class="container">
    <div class="feature-banner">
        <div class="feature-item">
            <i class="fas fa-piggy-bank feature-icon"></i>
            <h3>Simulez votre épargne</h3>
            <p>Planifiez votre avenir financier</p>
        </div>
        <div class="feature-item">
            <i class="fas fa-hand-holding-usd feature-icon"></i>
            <h3>Calculez vos emprunts</h3>
            <p>Optimisez vos remboursements</p>
        </div>
        <div class="feature-item">
            <i class="fas fa-chart-bar feature-icon"></i>
            <h3>Analysez vos options</h3>
            <p>Prenez les meilleures décisions</p>
        </div>
    </div>

    <div class="tabs">
        <button class="tab-btn active" data-tab="simulation">Simulation</button>
        <button class="tab-btn" data-tab="comparison">Comparaison</button>
        <button class="tab-btn" data-tab="recommendations">Recommandations</button>
    </div>

    <!-- Le reste du contenu de la page d'accueil -->
    <?php include 'includes/simulation_form.php'; ?>
</div> 