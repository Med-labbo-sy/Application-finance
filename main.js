/**
 * main.js - Script principal pour l'application Libé-Finance
 * Ce fichier gère les interactions utilisateur, les événements et l'affichage des résultats
 * pour l'application de simulation financière.
 */

// Variables globales
let currentOperationType = 'savings';
let currentAnnuityType = 'constant';
let currentSimulationResults = null;
let currentSimulationParams = null;

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des écouteurs d'événements
    initEventListeners();
    
    // Charger les scénarios sauvegardés
    loadSavedScenarios();

    // Gestion du formulaire de contact
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Votre message a été envoyé avec succès !');
            this.reset();
        });
    }

    // S'assurer que les liens de navigation fonctionnent
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Ne pas empêcher la navigation par défaut
            const href = this.getAttribute('href');
            if (href) {
                window.location.href = href;
            }
        });
    });
});

/**
 * Initialise tous les écouteurs d'événements de l'application
 */
function initEventListeners() {
    // Gestion des onglets
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Gestion du type d'opération
    const operationButtons = document.querySelectorAll('[data-operation]');
    operationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const operationType = this.getAttribute('data-operation');
            switchOperationType(operationType);
        });
    });
    
    // Gestion du type d'annuité
    const annuityButtons = document.querySelectorAll('[data-annuity]');
    annuityButtons.forEach(button => {
        button.addEventListener('click', function() {
            const annuityType = this.getAttribute('data-annuity');
            switchAnnuityType(annuityType);
        });
    });
    
    // Boutons de calcul
    const calculateSavingsBtn = document.getElementById('calculate-savings');
    if (calculateSavingsBtn) {
        calculateSavingsBtn.addEventListener('click', calculateSavings);
    }
    
    const calculateLoanBtn = document.getElementById('calculate-loan');
    if (calculateLoanBtn) {
        calculateLoanBtn.addEventListener('click', calculateLoan);
    }
    
    // Boutons de sauvegarde de scénario
    const saveSavingsBtn = document.getElementById('save-scenario');
    if (saveSavingsBtn) {
        saveSavingsBtn.addEventListener('click', function() {
            saveCurrentScenario('savings');
        });
    }
    
    const saveLoanBtn = document.getElementById('save-loan-scenario');
    if (saveLoanBtn) {
        saveLoanBtn.addEventListener('click', function() {
            saveCurrentScenario('loan');
        });
    }
    
    // Bouton de comparaison
    const compareBtn = document.getElementById('compare-btn');
    if (compareBtn) {
        compareBtn.addEventListener('click', compareSelectedScenarios);
    }
}

/**
 * Change l'onglet actif
 * @param {String} tabId - Identifiant de l'onglet à afficher
 */
function switchTab(tabId) {
    // Désactiver tous les onglets
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activer l'onglet sélectionné
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

/**
 * Change le type d'opération (épargne ou emprunt)
 * @param {String} operationType - Type d'opération ('savings' ou 'loan')
 */
function switchOperationType(operationType) {
    // Mettre à jour la variable globale
    currentOperationType = operationType;
    
    // Mettre à jour les boutons
    document.querySelectorAll('[data-operation]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-operation="${operationType}"]`).classList.add('active');
    
    // Afficher le formulaire correspondant
    if (operationType === 'savings') {
        document.getElementById('savings-form').classList.remove('hidden');
        document.getElementById('loan-form').classList.add('hidden');
    } else {
        document.getElementById('savings-form').classList.add('hidden');
        document.getElementById('loan-form').classList.remove('hidden');
    }
    
    // Masquer les résultats
    document.getElementById('results').classList.add('hidden');
}

/**
 * Change le type d'annuité (constante ou géométrique)
 * @param {String} annuityType - Type d'annuité ('constant' ou 'geometric')
 */
function switchAnnuityType(annuityType) {
    // Mettre à jour la variable globale
    currentAnnuityType = annuityType;
    
    // Mettre à jour les boutons
    document.querySelectorAll('[data-annuity]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-annuity="${annuityType}"]`).classList.add('active');
    
    // Afficher ou masquer les champs spécifiques à l'annuité géométrique
    const geometricFields = document.querySelectorAll('.geometric-only');
    if (annuityType === 'geometric') {
        geometricFields.forEach(field => field.style.display = 'block');
    } else {
        geometricFields.forEach(field => field.style.display = 'none');
    }
}

/**
 * Récupère les paramètres du formulaire d'épargne
 * @returns {Object} Paramètres de simulation d'épargne
 */
function getSavingsParams() {
    const initialDeposit = parseFloat(document.getElementById('initial-deposit').value) || 0;
    const periodicDeposit = parseFloat(document.getElementById('periodic-deposit').value);
    const interestRate = parseFloat(document.getElementById('interest-rate').value);
    const paymentFrequency = parseInt(document.getElementById('payment-frequency').value);
    const duration = parseFloat(document.getElementById('savings-duration').value) || null;
    const targetAmount = parseFloat(document.getElementById('target-amount').value) || null;
    const growthRate = currentAnnuityType === 'geometric' ? 
                      (parseFloat(document.getElementById('growth-rate').value) || 0) : 0;
    
    // Validation des entrées
    if (isNaN(periodicDeposit) || periodicDeposit < 0) {
        alert("Veuillez entrer un montant de versement périodique valide.");
        return null;
    }
    
    if (isNaN(interestRate) || interestRate < 0) {
        alert("Veuillez entrer un taux d'intérêt valide.");
        return null;
    }
    
    if (!duration && !targetAmount) {
        alert("Veuillez spécifier soit la durée, soit le montant cible.");
        return null;
    }
    
    return {
        operationType: 'savings',
        annuityType: currentAnnuityType,
        initialDeposit,
        periodicDeposit,
        interestRate,
        paymentFrequency,
        duration,
        targetAmount,
        growthRate
    };
}

/**
 * Récupère les paramètres du formulaire de remboursement d'emprunt
 * @returns {Object} Paramètres de simulation de remboursement
 */
function getLoanParams() {
    const loanAmount = parseFloat(document.getElementById('loan-amount').value);
    const interestRate = parseFloat(document.getElementById('loan-rate').value);
    const paymentFrequency = parseInt(document.getElementById('loan-frequency').value);
    const duration = parseFloat(document.getElementById('loan-duration').value) || null;
    const paymentAmount = parseFloat(document.getElementById('payment-amount').value) || null;
    const growthRate = currentAnnuityType === 'geometric' ? 
                      (parseFloat(document.getElementById('loan-growth-rate').value) || 0) : 0;
    
    // Validation des entrées
    if (isNaN(loanAmount) || loanAmount <= 0) {
        alert("Veuillez entrer un montant d'emprunt valide.");
        return null;
    }
    
    if (isNaN(interestRate) || interestRate < 0) {
        alert("Veuillez entrer un taux d'intérêt valide.");
        return null;
    }
    
    if (!duration && !paymentAmount) {
        alert("Veuillez spécifier soit la durée, soit le montant de la mensualité.");
        return null;
    }
    
    return {
        operationType: 'loan',
        annuityType: currentAnnuityType,
        loanAmount,
        interestRate,
        paymentFrequency,
        duration,
        paymentAmount,
        growthRate
    };
}

/**
 * Calcule et affiche les résultats de simulation d'épargne
 */
function calculateSavings() {
    const params = getSavingsParams();
    if (!params) return;
    
    try {
        // Effectuer le calcul en fonction du type d'annuité
        let results;
        if (currentAnnuityType === 'geometric') {
            results = calculateGeometricSavings(params);
        } else {
            results = calculateConstantSavings(params);
        }
        
        // Stocker les résultats pour une utilisation ultérieure
        currentSimulationResults = results;
        currentSimulationParams = params;
        
        // Afficher les résultats
        displaySavingsResults(results, params);
        
        // Générer et afficher les recommandations
        const recommendations = generateRecommendations(params, results);
        displayRecommendations(recommendations);
        
    } catch (error) {
        alert("Erreur lors du calcul : " + error.message);
    }
}

/**
 * Calcule et affiche les résultats de simulation de remboursement d'emprunt
 */
function calculateLoan() {
    const params = getLoanParams();
    if (!params) return;
    
    try {
        // Effectuer le calcul en fonction du type d'annuité
        let results;
        if (currentAnnuityType === 'geometric') {
            results = calculateGeometricLoan(params);
        } else {
            results = calculateConstantLoan(params);
        }
        
        // Stocker les résultats pour une utilisation ultérieure
        currentSimulationResults = results;
        currentSimulationParams = params;
        
        // Afficher les résultats
        displayLoanResults(results, params);
        
        // Générer et afficher les recommandations
        const recommendations = generateRecommendations(params, results);
        displayRecommendations(recommendations);
        
    } catch (error) {
        alert("Erreur lors du calcul : " + error.message);
    }
}

/**
 * Affiche les résultats de simulation d'épargne
 * @param {Array} results - Résultats de la simulation
 * @param {Object} params - Paramètres de la simulation
 */
function displaySavingsResults(results, params) {
    // Afficher le conteneur de résultats
    document.getElementById('results').classList.remove('hidden');
    
    // Mettre à jour les cartes de résumé
    const finalResult = results[results.length - 1];
    document.getElementById('total-amount').textContent = formatCurrency(finalResult.balance);
    document.getElementById('total-interest').textContent = formatCurrency(finalResult.totalInterest);
    document.getElementById('total-duration').textContent = (results.length / params.paymentFrequency).toFixed(2) + ' ans';
    
    // Mettre à jour le tableau d'amortissement
    const tableBody = document.querySelector('#amortization-table tbody');
    tableBody.innerHTML = '';
    
    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.period}</td>
            <td>${formatCurrency(result.deposit)}</td>
            <td>${formatCurrency(result.interest)}</td>
            <td>${formatCurrency(result.deposit + result.interest)}</td>
            <td>${formatCurrency(result.balance)}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Initialiser le graphique
    initSavingsChart(results, params);
}

/**
 * Affiche les résultats de simulation de remboursement d'emprunt
 * @param {Array} results - Résultats de la simulation
 * @param {Object} params - Paramètres de la simulation
 */
function displayLoanResults(results, params) {
    // Afficher le conteneur de résultats
    document.getElementById('results').classList.remove('hidden');
    
    // Mettre à jour les cartes de résumé
    const finalResult = results[results.length - 1];
    document.getElementById('total-amount').textContent = formatCurrency(params.loanAmount + finalResult.totalInterest);
    document.getElementById('total-interest').textContent = formatCurrency(finalResult.totalInterest);
    document.getElementById('total-duration').textContent = (results.length / params.paymentFrequency).toFixed(2) + ' ans';
    
    // Mettre à jour le tableau d'amortissement
    const tableBody = document.querySelector('#amortization-table tbody');
    tableBody.innerHTML = '';
    
    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.period}</td>
            <td>${formatCurrency(result.payment)}</td>
            <td>${formatCurrency(result.interest)}</td>
            <td>${formatCurrency(result.principal)}</td>
            <td>${formatCurrency(result.remainingCapital)}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Initialiser le graphique
    initLoanChart(results, params);
}

/**
 * Affiche les recommandations générées
 * @param {Object} recommendations - Recommandations générées
 */
function displayRecommendations(recommendations) {
    document.getElementById('payment-recommendation').textContent = recommendations.payment;
    document.getElementById('growth-recommendation').textContent = recommendations.growth;
    document.getElementById('duration-recommendation').textContent = recommendations.duration;
}

/**
 * Sauvegarde le scénario actuel
 * @param {String} type - Type de scénario ('savings' ou 'loan')
 */
function saveCurrentScenario(type) {
    if (!currentSimulationResults || !currentSimulationParams) {
        alert("Veuillez d'abord effectuer une simulation.");
        return;
    }
    
    // Demander un nom pour le scénario
    const scenarioName = prompt("Nom du scénario :", `Scénario ${new Date().toLocaleDateString()}`);
    if (!scenarioName) return;
    
    // Mettre à jour les paramètres avec le nom
    currentSimulationParams.name = scenarioName;
    
    // Sauvegarder le scénario
    const scenarioId = saveScenario(currentSimulationParams, currentSimulationResults);
    
    // Mettre à jour les listes déroulantes de scénarios
    loadSavedScenarios();
    
    alert(`Scénario "${scenarioName}" sauvegardé avec succès.`);
}

/**
 * Charge et affiche les scénarios sauvegardés dans les listes de sélection
 */
function loadSavedScenarios() {
    const scenarios = getSavedScenarios();
    const scenario1Select = document.getElementById('scenario1');
    const scenario2Select = document.getElementById('scenario2');
    
    // Vider les listes
    scenario1Select.innerHTML = '<option value="">Sélectionnez un scénario</option>';
    scenario2Select.innerHTML = '<option value="">Sélectionnez un scénario</option>';
    
    // Créer la liste des scénarios sauvegardés
    const scenariosList = document.createElement('div');
    scenariosList.className = 'saved-scenarios-list';
    scenariosList.innerHTML = '<h3>Scénarios sauvegardés</h3>';
    
    scenarios.forEach(scenario => {
        // Ajouter aux listes de sélection
        const option = document.createElement('option');
        option.value = scenario.id;
        option.textContent = `${scenario.name} (${new Date(scenario.timestamp).toLocaleDateString()})`;
        scenario1Select.appendChild(option.cloneNode(true));
        scenario2Select.appendChild(option.cloneNode(true));
        
        // Créer une carte pour le scénario
        const card = document.createElement('div');
        card.className = 'scenario-card';
        card.innerHTML = `
            <h4>${scenario.name}</h4>
            <p>Date : ${new Date(scenario.timestamp).toLocaleDateString()}</p>
            <p>Type : ${scenario.params.operationType === 'savings' ? 'Épargne' : 'Emprunt'}</p>
            <div class="scenario-actions">
                <button class="btn-secondary load-scenario" data-id="${scenario.id}">Charger</button>
                <button class="btn-danger delete-scenario" data-id="${scenario.id}">Supprimer</button>
            </div>
        `;
        scenariosList.appendChild(card);
    });
    
    // Remplacer la liste existante ou l'ajouter
    const existingList = document.querySelector('.saved-scenarios-list');
    if (existingList) {
        existingList.replaceWith(scenariosList);
    } else {
        document.querySelector('.scenario-selection').appendChild(scenariosList);
    }
    
    // Ajouter les écouteurs d'événements pour les boutons
    scenariosList.querySelectorAll('.load-scenario').forEach(button => {
        button.addEventListener('click', function() {
            const scenarioId = this.getAttribute('data-id');
            loadScenario(scenarioId);
        });
    });
    
    scenariosList.querySelectorAll('.delete-scenario').forEach(button => {
        button.addEventListener('click', function() {
            const scenarioId = this.getAttribute('data-id');
            if (confirm('Êtes-vous sûr de vouloir supprimer ce scénario ?')) {
                deleteScenario(scenarioId);
                loadSavedScenarios(); // Recharger la liste
            }
        });
    });
}

/**
 * Charge un scénario dans le formulaire
 * @param {String} scenarioId - ID du scénario à charger
 */
function loadScenario(scenarioId) {
    const scenario = getScenarioById(scenarioId);
    if (!scenario) return;
    
    // Changer le type d'opération
    switchOperationType(scenario.params.operationType);
    
    // Changer le type d'annuité
    switchAnnuityType(scenario.params.annuityType);
    
    // Remplir le formulaire approprié
    if (scenario.params.operationType === 'savings') {
        document.getElementById('initial-deposit').value = scenario.params.initialDeposit || '';
        document.getElementById('periodic-deposit').value = scenario.params.periodicDeposit || '';
        document.getElementById('interest-rate').value = scenario.params.interestRate || '';
        document.getElementById('payment-frequency').value = scenario.params.paymentFrequency || '12';
        document.getElementById('savings-duration').value = scenario.params.duration || '';
        document.getElementById('target-amount').value = scenario.params.targetAmount || '';
        if (scenario.params.annuityType === 'geometric') {
            document.getElementById('growth-rate').value = scenario.params.growthRate || '';
        }
    } else {
        document.getElementById('loan-amount').value = scenario.params.loanAmount || '';
        document.getElementById('loan-rate').value = scenario.params.interestRate || '';
        document.getElementById('loan-frequency').value = scenario.params.paymentFrequency || '12';
        document.getElementById('loan-duration').value = scenario.params.duration || '';
        document.getElementById('payment-amount').value = scenario.params.paymentAmount || '';
        if (scenario.params.annuityType === 'geometric') {
            document.getElementById('loan-growth-rate').value = scenario.params.growthRate || '';
        }
    }
    
    // Afficher les résultats
    if (scenario.params.operationType === 'savings') {
        displaySavingsResults(scenario.data, scenario.params);
    } else {
        displayLoanResults(scenario.data, scenario.params);
    }
}

/**
 * Compare les scénarios sélectionnés
 */
function compareSelectedScenarios() {
    const scenario1Id = document.getElementById('scenario1').value;
    const scenario2Id = document.getElementById('scenario2').value;
    
    // Vérification des sélections
    if (!scenario1Id || !scenario2Id) {
        alert("Veuillez sélectionner deux scénarios à comparer.");
        return;
    }
    
    if (scenario1Id === scenario2Id) {
        alert("Veuillez sélectionner deux scénarios différents.");
        return;
    }
    
    // Récupération des scénarios
    const scenario1 = getScenarioById(scenario1Id);
    const scenario2 = getScenarioById(scenario2Id);
    
    if (!scenario1 || !scenario2) {
        alert("Erreur lors de la récupération des scénarios.");
        return;
    }
    
    // Vérifier que les scénarios sont du même type
    if (scenario1.params.operationType !== scenario2.params.operationType) {
        alert("Les scénarios doivent être du même type (épargne ou emprunt).");
        return;
    }
    
    // Générer la comparaison
    const comparison = compareScenarios(scenario1, scenario2);
    
    // Afficher la comparaison
    displayComparison(comparison, scenario1, scenario2);
    
    // Afficher les résultats de comparaison
    document.querySelector('.comparison-results').classList.remove('hidden');
}

/**
 * Affiche la comparaison entre deux scénarios
 * @param {Array} comparison - Tableau de comparaison
 * @param {Object} scenario1 - Premier scénario
 * @param {Object} scenario2 - Deuxième scénario
 */
function displayComparison(comparison, scenario1, scenario2) {
    const tableBody = document.querySelector('#comparison-table tbody');
    tableBody.innerHTML = '';
    
    comparison.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.criterion}</td>
            <td>${item.value1}</td>
            <td>${item.value2}</td>
            <td>${item.difference}</td>
        `;
        tableBody.appendChild(row);
    });
}

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
