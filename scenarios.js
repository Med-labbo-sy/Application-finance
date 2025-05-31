/**
 * Gestion du stockage et de la comparaison des scénarios
 */

/**
 * Formate un nombre en devise (DH)
 * @param {Number} amount - Montant à formater
 * @returns {String} Montant formaté
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-MA', { 
        style: 'currency', 
        currency: 'MAD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Clé de stockage dans le localStorage
const SCENARIOS_STORAGE_KEY = 'simulationScenarios';

/**
 * Sauvegarde un scénario
 * @param {Object} params - Paramètres de la simulation
 * @param {Object} results - Résultats de la simulation
 * @returns {String} ID du scénario sauvegardé
 */
function saveScenario(params, results) {
    const scenarios = getSavedScenarios();
    const scenarioId = Date.now().toString();
    
    const scenario = {
        id: scenarioId,
        name: params.name || `Scénario ${scenarios.length + 1}`,
        timestamp: Date.now(),
        params: params,
        data: results
    };
    
    scenarios.push(scenario);
    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(scenarios));
    
    return scenarioId;
}

/**
 * Récupère tous les scénarios sauvegardés
 * @returns {Array} Liste des scénarios
 */
function getSavedScenarios() {
    const scenarios = localStorage.getItem(SCENARIOS_STORAGE_KEY);
    return scenarios ? JSON.parse(scenarios) : [];
}

/**
 * Récupère un scénario par son ID
 * @param {String} id - ID du scénario
 * @returns {Object|null} Le scénario ou null si non trouvé
 */
function getScenarioById(id) {
    const scenarios = getSavedScenarios();
    return scenarios.find(s => s.id === id.toString());
}

/**
 * Supprime un scénario
 * @param {String} id - ID du scénario à supprimer
 */
function deleteScenario(id) {
    let scenarios = getSavedScenarios();
    scenarios = scenarios.filter(s => s.id !== id.toString());
    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(scenarios));
}

/**
 * Compare deux scénarios
 * @param {Object} scenario1 - Premier scénario
 * @param {Object} scenario2 - Deuxième scénario
 * @returns {Array} Tableau des différences
 */
function compareScenarios(scenario1, scenario2) {
    const comparison = [];
    
    if (scenario1.params.operationType === 'savings') {
        // Comparaison pour l'épargne
        comparison.push({
            criterion: "Versement initial",
            value1: formatCurrency(scenario1.params.initialDeposit || 0),
            value2: formatCurrency(scenario2.params.initialDeposit || 0),
            difference: formatCurrency((scenario1.params.initialDeposit || 0) - (scenario2.params.initialDeposit || 0))
        });
        
        comparison.push({
            criterion: "Versement périodique",
            value1: formatCurrency(scenario1.params.periodicDeposit),
            value2: formatCurrency(scenario2.params.periodicDeposit),
            difference: formatCurrency(scenario1.params.periodicDeposit - scenario2.params.periodicDeposit)
        });
        
        comparison.push({
            criterion: "Taux d'intérêt",
            value1: scenario1.params.interestRate + "%",
            value2: scenario2.params.interestRate + "%",
            difference: (scenario1.params.interestRate - scenario2.params.interestRate) + "%"
        });
        
        comparison.push({
            criterion: "Montant final",
            value1: formatCurrency(scenario1.data.finalAmount),
            value2: formatCurrency(scenario2.data.finalAmount),
            difference: formatCurrency(scenario1.data.finalAmount - scenario2.data.finalAmount)
        });
        
        comparison.push({
            criterion: "Intérêts cumulés",
            value1: formatCurrency(scenario1.data.totalInterest),
            value2: formatCurrency(scenario2.data.totalInterest),
            difference: formatCurrency(scenario1.data.totalInterest - scenario2.data.totalInterest)
        });
    } else {
        // Comparaison pour l'emprunt
        comparison.push({
            criterion: "Montant emprunté",
            value1: formatCurrency(scenario1.params.loanAmount),
            value2: formatCurrency(scenario2.params.loanAmount),
            difference: formatCurrency(scenario1.params.loanAmount - scenario2.params.loanAmount)
        });
        
        comparison.push({
            criterion: "Taux d'intérêt",
            value1: scenario1.params.interestRate + "%",
            value2: scenario2.params.interestRate + "%",
            difference: (scenario1.params.interestRate - scenario2.params.interestRate) + "%"
        });
        
        comparison.push({
            criterion: "Mensualité",
            value1: formatCurrency(scenario1.data.payment),
            value2: formatCurrency(scenario2.data.payment),
            difference: formatCurrency(scenario1.data.payment - scenario2.data.payment)
        });
        
        comparison.push({
            criterion: "Coût total",
            value1: formatCurrency(scenario1.data.totalAmount),
            value2: formatCurrency(scenario2.data.totalAmount),
            difference: formatCurrency(scenario1.data.totalAmount - scenario2.data.totalAmount)
        });
        
        comparison.push({
            criterion: "Intérêts totaux",
            value1: formatCurrency(scenario1.data.totalInterest),
            value2: formatCurrency(scenario2.data.totalInterest),
            difference: formatCurrency(scenario1.data.totalInterest - scenario2.data.totalInterest)
        });
    }
    
    return comparison;
} 