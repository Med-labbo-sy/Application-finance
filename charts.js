/**
 * charts.js - Module de gestion des graphiques pour l'application Libé-Finance
 * Ce fichier contient toutes les fonctions de création et mise à jour des graphiques
 * utilisant Chart.js
 */

/**
 * Initialise le graphique pour la simulation d'épargne
 * @param {Array} results - Résultats de la simulation
 * @param {Object} params - Paramètres de la simulation
 */
function initSavingsChart(results, params) {
    const ctx = document.getElementById('finance-chart').getContext('2d');
    
    // Préparer les données
    const labels = results.map(r => r.period);
    const balanceData = results.map(r => r.balance);
    const depositsData = results.map(r => r.totalDeposits);
    const interestData = results.map(r => r.totalInterest);
    
    // Détruire le graphique existant s'il y en a un
    if (window.financeChart instanceof Chart) {
        window.financeChart.destroy();
    }
    
    // Créer le nouveau graphique
    window.financeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Capital total',
                    data: balanceData,
                    borderColor: '#007B7B',
                    backgroundColor: 'rgba(0, 123, 123, 0.1)',
                    fill: true
                },
                {
                    label: 'Total des versements',
                    data: depositsData,
                    borderColor: '#E84C3D',
                    backgroundColor: 'rgba(232, 76, 61, 0.1)',
                    fill: true
                },
                {
                    label: 'Intérêts cumulés',
                    data: interestData,
                    borderColor: '#3498DB',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Évolution du capital'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += new Intl.NumberFormat('fr-MA', {
                                style: 'currency',
                                currency: 'MAD'
                            }).format(context.parsed.y);
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Période'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Montant (DH)'
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('fr-MA', {
                                style: 'currency',
                                currency: 'MAD'
                            }).format(value);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initialise le graphique pour la simulation de remboursement d'emprunt
 * @param {Array} results - Résultats de la simulation
 * @param {Object} params - Paramètres de la simulation
 */
function initLoanChart(results, params) {
    const ctx = document.getElementById('finance-chart').getContext('2d');
    
    // Préparer les données
    const labels = results.map(r => r.period);
    const remainingCapitalData = results.map(r => r.remainingCapital);
    const totalPrincipalData = results.map(r => r.totalPrincipal);
    const totalInterestData = results.map(r => r.totalInterest);
    
    // Détruire le graphique existant s'il y en a un
    if (window.financeChart instanceof Chart) {
        window.financeChart.destroy();
    }
    
    // Créer le nouveau graphique
    window.financeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Capital restant',
                    data: remainingCapitalData,
                    borderColor: '#007B7B',
                    backgroundColor: 'rgba(0, 123, 123, 0.1)',
                    fill: true
                },
                {
                    label: 'Capital remboursé',
                    data: totalPrincipalData,
                    borderColor: '#E84C3D',
                    backgroundColor: 'rgba(232, 76, 61, 0.1)',
                    fill: true
                },
                {
                    label: 'Intérêts payés',
                    data: totalInterestData,
                    borderColor: '#3498DB',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Évolution du remboursement'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += new Intl.NumberFormat('fr-MA', {
                                style: 'currency',
                                currency: 'MAD'
                            }).format(context.parsed.y);
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Période'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Montant (DH)'
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('fr-MA', {
                                style: 'currency',
                                currency: 'MAD'
                            }).format(value);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initialise le graphique de comparaison
 * @param {Object} scenario1 - Premier scénario
 * @param {Object} scenario2 - Deuxième scénario
 */
function initComparisonChart(scenario1, scenario2) {
    const ctx = document.getElementById('comparison-chart').getContext('2d');
    
    // Déterminer le type de données à afficher en fonction du type d'opération
    const isLoan = scenario1.params.operationType === 'loan';
    
    // Préparer les données
    const data1 = scenario1.data.map(r => isLoan ? r.remainingCapital : r.balance);
    const data2 = scenario2.data.map(r => isLoan ? r.remainingCapital : r.balance);
    
    // Créer des labels uniformes
    const maxPeriods = Math.max(scenario1.data.length, scenario2.data.length);
    const labels = Array.from({length: maxPeriods}, (_, i) => i + 1);
    
    // Détruire le graphique existant s'il y en a un
    if (window.comparisonChart instanceof Chart) {
        window.comparisonChart.destroy();
    }
    
    // Créer le nouveau graphique
    window.comparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: scenario1.name,
                    data: data1,
                    borderColor: '#007B7B',
                    backgroundColor: 'rgba(0, 123, 123, 0.1)',
                    fill: true
                },
                {
                    label: scenario2.name,
                    data: data2,
                    borderColor: '#E84C3D',
                    backgroundColor: 'rgba(232, 76, 61, 0.1)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: isLoan ? 'Comparaison des remboursements' : 'Comparaison des épargnes'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += new Intl.NumberFormat('fr-MA', {
                                style: 'currency',
                                currency: 'MAD'
                            }).format(context.parsed.y);
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Période'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Montant (DH)'
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('fr-MA', {
                                style: 'currency',
                                currency: 'MAD'
                            }).format(value);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Crée un graphique en anneau pour montrer la répartition intérêts/capital dans une mensualité
 * @param {Object} payment - Détails du paiement
 * @param {String} elementId - ID de l'élément canvas
 */
function createPaymentDistributionChart(payment, elementId) {
    const ctx = document.getElementById(elementId).getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Intérêts', 'Capital'],
            datasets: [{
                data: [payment.interest, payment.principal],
                backgroundColor: [
                    'rgba(232, 76, 61, 0.8)',
                    'rgba(0, 123, 123, 0.8)'
                ],
                borderColor: [
                    'rgba(232, 76, 61, 1)',
                    'rgba(0, 123, 123, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const percentage = Math.round((value / (payment.interest + payment.principal)) * 100);
                            return `${label}: ${new Intl.NumberFormat('fr-MA', { 
                                style: 'currency', 
                                currency: 'MAD'
                            }).format(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}
