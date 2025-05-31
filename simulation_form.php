<?php
// Récupérer les paramètres de simulation s'ils existent
$params = $_SESSION['simulation_params'] ?? null;
?>

<div class="form-container" id="savings-form">
    <h2>Paramètres d'épargne</h2>
    <form id="savings-params">
        <div class="form-group">
            <label for="initial-deposit">Versement initial (DH)</label>
            <input type="number" id="initial-deposit" min="0" step="100" placeholder="0" 
                   value="<?php echo isset($params['initial_deposit']) ? htmlspecialchars($params['initial_deposit']) : ''; ?>">
        </div>
        <div class="form-group">
            <label for="periodic-deposit">Versement périodique (DH)</label>
            <input type="number" id="periodic-deposit" min="0" step="100" required placeholder="1000"
                   value="<?php echo isset($params['periodic_deposit']) ? htmlspecialchars($params['periodic_deposit']) : ''; ?>">
        </div>
        <div class="form-group">
            <label for="interest-rate">Taux d'intérêt annuel (%)</label>
            <input type="number" id="interest-rate" min="0" max="20" step="0.01" required placeholder="3.5"
                   value="<?php echo isset($params['interest_rate']) ? htmlspecialchars($params['interest_rate']) : ''; ?>">
        </div>
        <div class="form-group">
            <label for="payment-frequency">Fréquence des versements</label>
            <select id="payment-frequency" required>
                <option value="12" <?php echo isset($params['frequency']) && $params['frequency'] == 12 ? 'selected' : ''; ?>>Mensuelle</option>
                <option value="4" <?php echo isset($params['frequency']) && $params['frequency'] == 4 ? 'selected' : ''; ?>>Trimestrielle</option>
                <option value="1" <?php echo isset($params['frequency']) && $params['frequency'] == 1 ? 'selected' : ''; ?>>Annuelle</option>
            </select>
        </div>
        <div class="form-group">
            <label for="savings-duration">Durée (années)</label>
            <input type="number" id="savings-duration" min="1" max="50" step="1" placeholder="10"
                   value="<?php echo isset($params['duration']) ? htmlspecialchars($params['duration']) : ''; ?>">
        </div>
        <div class="form-group">
            <label for="target-amount">OU Montant cible (DH)</label>
            <input type="number" id="target-amount" min="0" step="1000" placeholder="100000"
                   value="<?php echo isset($params['target_amount']) ? htmlspecialchars($params['target_amount']) : ''; ?>">
        </div>
        <div class="form-group geometric-only" style="display: none;">
            <label for="growth-rate">Taux de croissance des versements (%)</label>
            <input type="number" id="growth-rate" min="-10" max="20" step="0.1" placeholder="2"
                   value="<?php echo isset($params['growth_rate']) ? htmlspecialchars($params['growth_rate']) : ''; ?>">
        </div>
        <div class="form-actions">
            <button type="button" id="calculate-savings" class="btn-primary">Calculer</button>
            <button type="button" id="save-scenario" class="btn-secondary">Sauvegarder ce scénario</button>
        </div>
    </form>
</div>

<div class="form-container hidden" id="loan-form">
    <h2>Paramètres de remboursement</h2>
    <form id="loan-params">
        <div class="form-group">
            <label for="loan-amount">Montant total de l'emprunt (DH)</label>
            <input type="number" id="loan-amount" min="0" step="1000" required placeholder="500000">
        </div>
        <div class="form-group">
            <label for="loan-rate">Taux d'intérêt annuel (%)</label>
            <input type="number" id="loan-rate" min="0" max="20" step="0.01" required placeholder="4.5">
        </div>
        <div class="form-group">
            <label for="loan-frequency">Fréquence des remboursements</label>
            <select id="loan-frequency" required>
                <option value="12">Mensuelle</option>
                <option value="4">Trimestrielle</option>
                <option value="1">Annuelle</option>
            </select>
        </div>
        <div class="form-group">
            <label for="loan-duration">Durée (années)</label>
            <input type="number" id="loan-duration" min="1" max="50" step="1" placeholder="20">
        </div>
        <div class="form-group">
            <label for="payment-amount">OU Montant de la mensualité (DH)</label>
            <input type="number" id="payment-amount" min="0" step="100" placeholder="3000">
        </div>
        <div class="form-group geometric-only" style="display: none;">
            <label for="loan-growth-rate">Taux de croissance des mensualités (%)</label>
            <input type="number" id="loan-growth-rate" min="-10" max="20" step="0.1" placeholder="2">
        </div>
        <div class="form-actions">
            <button type="button" id="calculate-loan" class="btn-primary">Calculer</button>
            <button type="button" id="save-loan-scenario" class="btn-secondary">Sauvegarder ce scénario</button>
        </div>
    </form>
</div>

<div class="results-container hidden" id="results">
    <h2>Résultats de la simulation</h2>
    <div class="results-summary">
        <div class="summary-card" id="summary-card-1">
            <h3>Montant total</h3>
            <p class="amount" id="total-amount">0 DH</p>
        </div>
        <div class="summary-card" id="summary-card-2">
            <h3>Intérêts cumulés</h3>
            <p class="amount" id="total-interest">0 DH</p>
        </div>
        <div class="summary-card" id="summary-card-3">
            <h3>Durée totale</h3>
            <p class="amount" id="total-duration">0 ans</p>
        </div>
    </div>

    <div class="chart-container">
        <canvas id="finance-chart"></canvas>
    </div>

    <div class="table-container">
        <h3>Tableau détaillé</h3>
        <div class="table-scroll">
            <table id="amortization-table">
                <thead>
                    <tr>
                        <th>Période</th>
                        <th>Versement</th>
                        <th>Intérêts</th>
                        <th>Capital</th>
                        <th>Solde</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Rempli dynamiquement par JavaScript -->
                </tbody>
            </table>
        </div>
    </div>
</div> 