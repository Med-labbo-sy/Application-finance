/**
 * calculations.js - Module de calculs financiers pour l'application Libé-Finance
 * Ce fichier contient toutes les fonctions de calcul pour les simulations d'épargne
 * et de remboursement d'emprunt, avec gestion des annuités constantes et géométriques.
 */

// Stockage des scénarios sauvegardés
let savedScenarios = JSON.parse(localStorage.getItem('libefinance_scenarios') || '[]');

/**
 * Calcule un plan d'épargne avec annuité constante
 * @param {Object} params - Paramètres de la simulation
 * @returns {Array} Tableau des données de simulation
 */
function calculateConstantSavings(params) {
    const {
        initialDeposit = 0,
        periodicDeposit,
        interestRate,
        paymentFrequency,
        duration,
        targetAmount
    } = params;
    
    // Conversion du taux d'intérêt annuel en taux périodique
    const periodicRate = interestRate / 100 / paymentFrequency;
    
    // Nombre total de périodes
    let totalPeriods;
    if (duration) {
        totalPeriods = Math.floor(duration * paymentFrequency);
    } else if (targetAmount) {
        // Calcul du nombre de périodes nécessaires pour atteindre le montant cible
        if (periodicDeposit === 0 && initialDeposit > 0) {
            // Formule pour calculer le temps nécessaire avec intérêts composés sans versements
            totalPeriods = Math.ceil(Math.log(targetAmount / initialDeposit) / Math.log(1 + periodicRate));
        } else {
            // Formule pour calculer le temps avec versements périodiques
            let n = 0;
            let balance = initialDeposit;
            while (balance < targetAmount && n < 1000) { // Limite à 1000 périodes pour éviter les boucles infinies
                balance = balance * (1 + periodicRate) + periodicDeposit;
                n++;
            }
            totalPeriods = n;
        }
    } else {
        throw new Error("Veuillez spécifier soit la durée, soit le montant cible.");
    }
    
    // Initialisation des résultats
    const results = [];
    let balance = initialDeposit;
    let totalDeposits = initialDeposit;
    let totalInterest = 0;
    
    // Calcul période par période
    for (let period = 1; period <= totalPeriods; period++) {
        // Calcul des intérêts pour cette période
        const interest = balance * periodicRate;
        
        // Mise à jour du solde
        balance = balance + interest + periodicDeposit;
        
        // Mise à jour des totaux
        totalDeposits += periodicDeposit;
        totalInterest += interest;
        
        // Ajout des résultats pour cette période
        results.push({
            period,
            deposit: periodicDeposit,
            interest: interest,
            balance: balance,
            totalDeposits: totalDeposits,
            totalInterest: totalInterest
        });
        
        // Arrêt si le montant cible est atteint
        if (targetAmount && balance >= targetAmount) {
            break;
        }
    }
    
    return results;
}

/**
 * Calcule un plan d'épargne avec annuité géométrique
 * @param {Object} params - Paramètres de la simulation
 * @returns {Array} Tableau des données de simulation
 */
function calculateGeometricSavings(params) {
    const {
        initialDeposit = 0,
        periodicDeposit,
        interestRate,
        paymentFrequency,
        duration,
        targetAmount,
        growthRate
    } = params;
    
    // Conversion du taux d'intérêt annuel en taux périodique
    const periodicRate = interestRate / 100 / paymentFrequency;
    
    // Conversion du taux de croissance annuel en taux périodique
    const periodicGrowthRate = growthRate / 100;
    
    // Nombre total de périodes
    let totalPeriods;
    if (duration) {
        totalPeriods = Math.floor(duration * paymentFrequency);
    } else if (targetAmount) {
        // Estimation du nombre de périodes (plus complexe avec annuité géométrique)
        let n = 0;
        let balance = initialDeposit;
        let currentDeposit = periodicDeposit;
        while (balance < targetAmount && n < 1000) { // Limite à 1000 périodes pour éviter les boucles infinies
            balance = balance * (1 + periodicRate) + currentDeposit;
            currentDeposit *= (1 + periodicGrowthRate);
            n++;
        }
        totalPeriods = n;
    } else {
        throw new Error("Veuillez spécifier soit la durée, soit le montant cible.");
    }
    
    // Initialisation des résultats
    const results = [];
    let balance = initialDeposit;
    let totalDeposits = initialDeposit;
    let totalInterest = 0;
    let currentDeposit = periodicDeposit;
    
    // Calcul période par période
    for (let period = 1; period <= totalPeriods; period++) {
        // Calcul des intérêts pour cette période
        const interest = balance * periodicRate;
        
        // Mise à jour du solde
        balance = balance + interest + currentDeposit;
        
        // Mise à jour des totaux
        totalDeposits += currentDeposit;
        totalInterest += interest;
        
        // Ajout des résultats pour cette période
        results.push({
            period,
            deposit: currentDeposit,
            interest: interest,
            balance: balance,
            totalDeposits: totalDeposits,
            totalInterest: totalInterest
        });
        
        // Mise à jour du versement pour la période suivante
        currentDeposit *= (1 + periodicGrowthRate);
        
        // Arrêt si le montant cible est atteint
        if (targetAmount && balance >= targetAmount) {
            break;
        }
    }
    
    return results;
}

/**
 * Calcule un plan de remboursement d'emprunt avec annuité constante
 * @param {Object} params - Paramètres de la simulation
 * @returns {Array} Tableau des données de simulation
 */
function calculateConstantLoan(params) {
    const {
        loanAmount,
        interestRate,
        paymentFrequency,
        duration,
        paymentAmount
    } = params;
    
    // Conversion du taux d'intérêt annuel en taux périodique
    const periodicRate = interestRate / 100 / paymentFrequency;
    
    // Calcul du nombre de périodes ou du montant de la mensualité
    let totalPeriods, payment;
    
    if (duration) {
        totalPeriods = Math.floor(duration * paymentFrequency);
        // Formule de calcul de l'annuité constante
        payment = loanAmount * (periodicRate * Math.pow(1 + periodicRate, totalPeriods)) / 
                 (Math.pow(1 + periodicRate, totalPeriods) - 1);
    } else if (paymentAmount) {
        payment = paymentAmount;
        // Calcul du nombre de périodes nécessaires pour rembourser le prêt
        if (payment <= loanAmount * periodicRate) {
            throw new Error("Le montant de la mensualité est trop faible pour rembourser le prêt.");
        }
        
        // Formule pour calculer le nombre de périodes
        totalPeriods = Math.ceil(Math.log(payment / (payment - loanAmount * periodicRate)) / 
                               Math.log(1 + periodicRate));
    } else {
        throw new Error("Veuillez spécifier soit la durée, soit le montant de la mensualité.");
    }
    
    // Initialisation des résultats
    const results = [];
    let remainingCapital = loanAmount;
    let totalInterest = 0;
    let totalPrincipal = 0;
    
    // Calcul période par période
    for (let period = 1; period <= totalPeriods; period++) {
        // Calcul des intérêts pour cette période
        const interest = remainingCapital * periodicRate;
        
        // Calcul du capital remboursé pour cette période
        let principal = payment - interest;
        
        // Ajustement pour la dernière période
        if (principal > remainingCapital) {
            principal = remainingCapital;
            payment = principal + interest;
        }
        
        // Mise à jour du capital restant
        remainingCapital -= principal;
        
        // Mise à jour des totaux
        totalInterest += interest;
        totalPrincipal += principal;
        
        // Ajout des résultats pour cette période
        results.push({
            period,
            payment: payment,
            interest: interest,
            principal: principal,
            remainingCapital: remainingCapital,
            totalInterest: totalInterest,
            totalPrincipal: totalPrincipal
        });
        
        // Arrêt si le prêt est entièrement remboursé
        if (remainingCapital <= 0.01) {
            break;
        }
    }
    
    return results;
}

/**
 * Calcule un plan de remboursement d'emprunt avec annuité géométrique
 * @param {Object} params - Paramètres de la simulation
 * @returns {Array} Tableau des données de simulation
 */
function calculateGeometricLoan(params) {
    const {
        loanAmount,
        interestRate,
        paymentFrequency,
        duration,
        paymentAmount,
        growthRate
    } = params;
    
    // Conversion du taux d'intérêt annuel en taux périodique
    const periodicRate = interestRate / 100 / paymentFrequency;
    
    // Conversion du taux de croissance annuel en taux périodique
    const periodicGrowthRate = growthRate / 100;
    
    // Calcul du nombre de périodes ou du montant de la première mensualité
    let totalPeriods, initialPayment;
    
    if (duration) {
        totalPeriods = Math.floor(duration * paymentFrequency);
        
        // Calcul de la première mensualité pour une annuité géométrique
        // Formule complexe qui nécessite une résolution numérique
        
        // Approximation initiale basée sur l'annuité constante
        const constantPayment = loanAmount * (periodicRate * Math.pow(1 + periodicRate, totalPeriods)) / 
                              (Math.pow(1 + periodicRate, totalPeriods) - 1);
        
        // Ajustement pour l'annuité géométrique
        initialPayment = constantPayment / (1 + periodicGrowthRate * (totalPeriods - 1) / 2);
    } else if (paymentAmount) {
        initialPayment = paymentAmount;
        
        // Estimation du nombre de périodes (plus complexe avec annuité géométrique)
        let n = 0;
        let remaining = loanAmount;
        let currentPayment = initialPayment;
        
        while (remaining > 0.01 && n < 1000) { // Limite à 1000 périodes pour éviter les boucles infinies
            const interest = remaining * periodicRate;
            const principal = currentPayment - interest;
            
            if (principal <= 0) {
                throw new Error("Le montant de la mensualité est trop faible pour rembourser le prêt.");
            }
            
            remaining -= principal;
            currentPayment *= (1 + periodicGrowthRate);
            n++;
        }
        
        totalPeriods = n;
    } else {
        throw new Error("Veuillez spécifier soit la durée, soit le montant de la mensualité.");
    }
    
    // Initialisation des résultats
    const results = [];
    let remainingCapital = loanAmount;
    let totalInterest = 0;
    let totalPrincipal = 0;
    let currentPayment = initialPayment;
    
    // Calcul période par période
    for (let period = 1; period <= totalPeriods; period++) {
        // Calcul des intérêts pour cette période
        const interest = remainingCapital * periodicRate;
        
        // Calcul du capital remboursé pour cette période
        let principal = currentPayment - interest;
        
        // Ajustement pour la dernière période ou si le principal est négatif
        if (principal <= 0) {
            throw new Error("Le taux de croissance est trop faible, les mensualités ne couvrent plus les intérêts.");
        }
        
        if (principal > remainingCapital) {
            principal = remainingCapital;
            currentPayment = principal + interest;
        }
        
        // Mise à jour du capital restant
        remainingCapital -= principal;
        
        // Mise à jour des totaux
        totalInterest += interest;
        totalPrincipal += principal;
        
        // Ajout des résultats pour cette période
        results.push({
            period,
            payment: currentPayment,
            interest: interest,
            principal: principal,
            remainingCapital: remainingCapital,
            totalInterest: totalInterest,
            totalPrincipal: totalPrincipal
        });
        
        // Mise à jour du paiement pour la période suivante
        currentPayment *= (1 + periodicGrowthRate);
        
        // Arrêt si le prêt est entièrement remboursé
        if (remainingCapital <= 0.01) {
            break;
        }
    }
    
    return results;
}

/**
 * Génère des recommandations basées sur les résultats de simulation
 * @param {Object} params - Paramètres de la simulation
 * @param {Array} results - Résultats de la simulation
 * @returns {Object} Recommandations personnalisées
 */
function generateRecommendations(params, results) {
    const recommendations = {
        payment: '',
        growth: '',
        duration: ''
    };
    
    const isLoan = params.operationType === 'loan';
    const isGeometric = params.annuityType === 'geometric';
    
    if (isLoan) {
        // Recommandations pour le remboursement d'emprunt
        const totalInterest = results[results.length - 1].totalInterest;
        const totalPayment = totalInterest + params.loanAmount;
        const duration = results.length / params.paymentFrequency;
        
        // Recommandation sur le montant de la mensualité
        const increasedPayment = params.paymentAmount * 1.1; // +10%
        const increasedParams = { ...params, paymentAmount: increasedPayment, duration: null };
        let increasedResults;
        
        try {
            if (isGeometric) {
                increasedResults = calculateGeometricLoan(increasedParams);
            } else {
                increasedResults = calculateConstantLoan(increasedParams);
            }
            
            const newDuration = increasedResults.length / params.paymentFrequency;
            const newTotalInterest = increasedResults[increasedResults.length - 1].totalInterest;
            const interestSavings = totalInterest - newTotalInterest;
            const timeSavings = duration - newDuration;
            
            recommendations.payment = `En augmentant votre mensualité de ${(params.paymentAmount * 0.1).toFixed(2)} DH (soit ${increasedPayment.toFixed(2)} DH au lieu de ${params.paymentAmount.toFixed(2)} DH), vous économiseriez ${interestSavings.toFixed(2)} DH d'intérêts au total et finiriez de rembourser ${timeSavings.toFixed(1)} années plus tôt.`;
        } catch (e) {
            recommendations.payment = "Nous ne pouvons pas calculer l'impact d'une augmentation de mensualité avec les paramètres actuels.";
        }
        
        // Recommandation sur le type d'annuité
        if (isGeometric) {
            const constantParams = { ...params, annuityType: 'constant', growthRate: 0 };
            try {
                const constantResults = calculateConstantLoan(constantParams);
                const constantTotalInterest = constantResults[constantResults.length - 1].totalInterest;
                const interestDiff = totalInterest - constantTotalInterest;
                
                if (interestDiff > 0) {
                    recommendations.growth = `Une annuité constante vous permettrait d'économiser ${interestDiff.toFixed(2)} DH d'intérêts par rapport à votre annuité géométrique actuelle avec un taux de croissance de ${params.growthRate}%.`;
                } else {
                    recommendations.growth = `Votre annuité géométrique avec un taux de croissance de ${params.growthRate}% vous permet d'économiser ${Math.abs(interestDiff).toFixed(2)} DH d'intérêts par rapport à une annuité constante.`;
                }
            } catch (e) {
                recommendations.growth = "Nous ne pouvons pas comparer les types d'annuités avec les paramètres actuels.";
            }
        } else {
            // Suggérer une annuité géométrique avec un taux de croissance modéré
            const geometricParams = { ...params, annuityType: 'geometric', growthRate: 2 };
            try {
                const geometricResults = calculateGeometricLoan(geometricParams);
                const geometricTotalInterest = geometricResults[geometricResults.length - 1].totalInterest;
                const interestDiff = totalInterest - geometricTotalInterest;
                
                if (interestDiff > 0) {
                    recommendations.growth = `Une annuité géométrique avec un taux de croissance de 2% vous permettrait d'économiser ${interestDiff.toFixed(2)} DH d'intérêts par rapport à votre annuité constante actuelle.`;
                } else {
                    recommendations.growth = `Votre annuité constante actuelle vous permet d'économiser ${Math.abs(interestDiff).toFixed(2)} DH d'intérêts par rapport à une annuité géométrique avec un taux de croissance de 2%.`;
                }
            } catch (e) {
                recommendations.growth = "Nous ne pouvons pas comparer les types d'annuités avec les paramètres actuels.";
            }
        }
        
        // Recommandation sur la durée
        if (params.duration) {
            const shorterDuration = params.duration * 0.8; // -20%
            const shorterParams = { ...params, duration: shorterDuration, paymentAmount: null };
            
            try {
                let shorterResults;
                if (isGeometric) {
                    shorterResults = calculateGeometricLoan(shorterParams);
                } else {
                    shorterResults = calculateConstantLoan(shorterParams);
                }
                
                const newPayment = shorterResults[0].payment;
                const paymentIncrease = newPayment - (isGeometric ? params.paymentAmount : results[0].payment);
                const newTotalInterest = shorterResults[shorterResults.length - 1].totalInterest;
                const interestSavings = totalInterest - newTotalInterest;
                
                recommendations.duration = `En réduisant la durée de votre emprunt de ${params.duration} à ${shorterDuration} années (soit ${params.duration - shorterDuration} années de moins), votre mensualité initiale augmenterait de ${paymentIncrease.toFixed(2)} DH, mais vous économiseriez ${interestSavings.toFixed(2)} DH d'intérêts au total.`;
            } catch (e) {
                recommendations.duration = "Nous ne pouvons pas calculer l'impact d'une réduction de durée avec les paramètres actuels.";
            }
        }
    } else {
        // Recommandations pour l'épargne
        const finalBalance = results[results.length - 1].balance;
        const totalDeposits = results[results.length - 1].totalDeposits;
        const totalInterest = results[results.length - 1].totalInterest;
        const duration = results.length / params.paymentFrequency;
        
        // Recommandation sur le montant du versement
        const increasedDeposit = params.periodicDeposit * 1.2; // +20%
        const increasedParams = { ...params, periodicDeposit: increasedDeposit };
        
        try {
            let increasedResults;
            if (isGeometric) {
                increasedResults = calculateGeometricSavings(increasedParams);
            } else {
                increasedResults = calculateConstantSavings(increasedParams);
            }
            
            const newFinalBalance = increasedResults[increasedResults.length - 1].balance;
            const additionalSavings = newFinalBalance - finalBalance;
            
            recommendations.payment = `En augmentant votre versement périodique de ${(params.periodicDeposit * 0.2).toFixed(2)} DH (soit ${increasedDeposit.toFixed(2)} DH au lieu de ${params.periodicDeposit.toFixed(2)} DH), vous obtiendriez un capital final supplémentaire de ${additionalSavings.toFixed(2)} DH, soit un total de ${newFinalBalance.toFixed(2)} DH.`;
        } catch (e) {
            recommendations.payment = "Nous ne pouvons pas calculer l'impact d'une augmentation de versement avec les paramètres actuels.";
        }
        
        // Recommandation sur le type d'annuité
        if (isGeometric) {
            const constantParams = { ...params, annuityType: 'constant', growthRate: 0 };
            try {
                const constantResults = calculateConstantSavings(constantParams);
                const constantFinalBalance = constantResults[constantResults.length - 1].balance;
                const balanceDiff = finalBalance - constantFinalBalance;
                
                if (balanceDiff > 0) {
                    recommendations.growth = `Votre annuité géométrique avec un taux de croissance de ${params.growthRate}% vous permet d'obtenir ${balanceDiff.toFixed(2)} DH de plus qu'une annuité constante, tout en commençant avec des versements plus faibles.`;
                } else {
                    recommendations.growth = `Une annuité constante vous permettrait d'obtenir ${Math.abs(balanceDiff).toFixed(2)} DH de plus que votre annuité géométrique actuelle avec un taux de croissance de ${params.growthRate}%.`;
                }
            } catch (e) {
                recommendations.growth = "Nous ne pouvons pas comparer les types d'annuités avec les paramètres actuels.";
            }
        } else {
            // Suggérer une annuité géométrique avec un taux de croissance modéré
            const geometricParams = { ...params, annuityType: 'geometric', growthRate: 3 };
            try {
                const geometricResults = calculateGeometricSavings(geometricParams);
                const geometricFinalBalance = geometricResults[geometricResults.length - 1].balance;
                const balanceDiff = geometricFinalBalance - finalBalance;
                
                if (balanceDiff > 0) {
                    recommendations.growth = `Une annuité géométrique avec une croissance de 3% de vos versements pourrait vous permettre d'obtenir ${balanceDiff.toFixed(2)} DH de plus qu'avec votre annuité constante actuelle, tout en commençant avec des versements plus faibles.`;
                } else {
                    recommendations.growth = `Votre annuité constante actuelle vous permet d'obtenir ${Math.abs(balanceDiff).toFixed(2)} DH de plus qu'une annuité géométrique avec un taux de croissance de 3%.`;
                }
            } catch (e) {
                recommendations.growth = "Nous ne pouvons pas comparer les types d'annuités avec les paramètres actuels.";
            }
        }
        
        // Recommandation sur la durée
        if (params.duration) {
            const longerDuration = params.duration * 1.5; // +50%
            const longerParams = { ...params, duration: longerDuration };
            
            try {
                let longerResults;
                if (isGeometric) {
                    longerResults = calculateGeometricSavings(longerParams);
                } else {
                    longerResults = calculateConstantSavings(longerParams);
                }
                
                const newFinalBalance = longerResults[longerResults.length - 1].balance;
                const additionalSavings = newFinalBalance - finalBalance;
                const additionalInterest = longerResults[longerResults.length - 1].totalInterest - totalInterest;
                
                recommendations.duration = `En prolongeant votre épargne de ${params.duration} à ${longerDuration} années (soit ${longerDuration - params.duration} années de plus), vous obtiendriez un capital final supplémentaire de ${additionalSavings.toFixed(2)} DH, dont ${additionalInterest.toFixed(2)} DH d'intérêts supplémentaires.`;
            } catch (e) {
                recommendations.duration = "Nous ne pouvons pas calculer l'impact d'une prolongation de durée avec les paramètres actuels.";
            }
        }
    }
    
    return recommendations;
}

/**
 * Sauvegarde un nouveau scénario
 * @param {Object} params - Paramètres de la simulation
 * @param {Array} data - Résultats de la simulation
 * @returns {String} ID du scénario sauvegardé
 */
function saveScenario(params, data) {
    const id = 'scenario_' + Date.now();
    const scenario = {
        id,
        params,
        data,
        timestamp: new Date().toISOString(),
        name: `${params.operationType === 'savings' ? 'Épargne' : 'Emprunt'} - ${new Date().toLocaleDateString()}`
    };
    
    savedScenarios.push(scenario);
    // Sauvegarder dans localStorage
    localStorage.setItem('libefinance_scenarios', JSON.stringify(savedScenarios));
    
    return id;
}

/**
 * Récupère tous les scénarios sauvegardés
 * @returns {Array} Liste des scénarios
 */
function getSavedScenarios() {
    // Recharger depuis localStorage au cas où il y aurait eu des modifications
    savedScenarios = JSON.parse(localStorage.getItem('libefinance_scenarios') || '[]');
    return savedScenarios;
}

/**
 * Récupère un scénario par son ID
 * @param {String} id - ID du scénario
 * @returns {Object|null} Le scénario trouvé ou null
 */
function getScenarioById(id) {
    return savedScenarios.find(scenario => scenario.id === id);
}

/**
 * Supprime un scénario
 * @param {String} id - ID du scénario à supprimer
 * @returns {Boolean} true si le scénario a été supprimé
 */
function deleteScenario(id) {
    const initialLength = savedScenarios.length;
    savedScenarios = savedScenarios.filter(scenario => scenario.id !== id);
    
    if (savedScenarios.length !== initialLength) {
        localStorage.setItem('libefinance_scenarios', JSON.stringify(savedScenarios));
        return true;
    }
    return false;
}

/**
 * Compare deux scénarios et génère un tableau comparatif
 * @param {Object} scenario1 - Premier scénario
 * @param {Object} scenario2 - Deuxième scénario
 * @returns {Array} Tableau comparatif des deux scénarios
 */
function compareScenarios(scenario1, scenario2) {
    const isLoan = scenario1.params.operationType === 'loan';
    const comparison = [];
    
    if (isLoan) {
        // Comparaison pour les emprunts
        const data1 = scenario1.data[scenario1.data.length - 1];
        const data2 = scenario2.data[scenario2.data.length - 1];
        
        comparison.push({
            criterion: "Montant de l'emprunt",
            value1: scenario1.params.loanAmount.toFixed(2) + " DH",
            value2: scenario2.params.loanAmount.toFixed(2) + " DH",
            difference: (scenario1.params.loanAmount - scenario2.params.loanAmount).toFixed(2) + " DH"
        });
        
        comparison.push({
            criterion: "Taux d'intérêt",
            value1: scenario1.params.interestRate.toFixed(2) + " %",
            value2: scenario2.params.interestRate.toFixed(2) + " %",
            difference: (scenario1.params.interestRate - scenario2.params.interestRate).toFixed(2) + " %"
        });
        
        comparison.push({
            criterion: "Durée (années)",
            value1: (scenario1.data.length / scenario1.params.paymentFrequency).toFixed(2),
            value2: (scenario2.data.length / scenario2.params.paymentFrequency).toFixed(2),
            difference: ((scenario1.data.length / scenario1.params.paymentFrequency) - (scenario2.data.length / scenario2.params.paymentFrequency)).toFixed(2)
        });
        
        comparison.push({
            criterion: "Première mensualité",
            value1: scenario1.data[0].payment.toFixed(2) + " DH",
            value2: scenario2.data[0].payment.toFixed(2) + " DH",
            difference: (scenario1.data[0].payment - scenario2.data[0].payment).toFixed(2) + " DH"
        });
        
        if (scenario1.data.length > 1 && scenario2.data.length > 1) {
            comparison.push({
                criterion: "Dernière mensualité",
                value1: scenario1.data[scenario1.data.length - 1].payment.toFixed(2) + " DH",
                value2: scenario2.data[scenario2.data.length - 1].payment.toFixed(2) + " DH",
                difference: (scenario1.data[scenario1.data.length - 1].payment - scenario2.data[scenario2.data.length - 1].payment).toFixed(2) + " DH"
            });
        }
        
        comparison.push({
            criterion: "Total des intérêts",
            value1: data1.totalInterest.toFixed(2) + " DH",
            value2: data2.totalInterest.toFixed(2) + " DH",
            difference: (data1.totalInterest - data2.totalInterest).toFixed(2) + " DH"
        });
        
        comparison.push({
            criterion: "Coût total du crédit",
            value1: (scenario1.params.loanAmount + data1.totalInterest).toFixed(2) + " DH",
            value2: (scenario2.params.loanAmount + data2.totalInterest).toFixed(2) + " DH",
            difference: ((scenario1.params.loanAmount + data1.totalInterest) - (scenario2.params.loanAmount + data2.totalInterest)).toFixed(2) + " DH"
        });
        
    } else {
        // Comparaison pour l'épargne
        const data1 = scenario1.data[scenario1.data.length - 1];
        const data2 = scenario2.data[scenario2.data.length - 1];
        
        comparison.push({
            criterion: "Versement initial",
            value1: (scenario1.params.initialDeposit || 0).toFixed(2) + " DH",
            value2: (scenario2.params.initialDeposit || 0).toFixed(2) + " DH",
            difference: ((scenario1.params.initialDeposit || 0) - (scenario2.params.initialDeposit || 0)).toFixed(2) + " DH"
        });
        
        comparison.push({
            criterion: "Premier versement périodique",
            value1: scenario1.params.periodicDeposit.toFixed(2) + " DH",
            value2: scenario2.params.periodicDeposit.toFixed(2) + " DH",
            difference: (scenario1.params.periodicDeposit - scenario2.params.periodicDeposit).toFixed(2) + " DH"
        });
        
        comparison.push({
            criterion: "Taux d'intérêt",
            value1: scenario1.params.interestRate.toFixed(2) + " %",
            value2: scenario2.params.interestRate.toFixed(2) + " %",
            difference: (scenario1.params.interestRate - scenario2.params.interestRate).toFixed(2) + " %"
        });
        
        comparison.push({
            criterion: "Durée (années)",
            value1: (scenario1.data.length / scenario1.params.paymentFrequency).toFixed(2),
            value2: (scenario2.data.length / scenario2.params.paymentFrequency).toFixed(2),
            difference: ((scenario1.data.length / scenario1.params.paymentFrequency) - (scenario2.data.length / scenario2.params.paymentFrequency)).toFixed(2)
        });
        
        if (scenario1.params.annuityType === 'geometric' && scenario2.params.annuityType === 'geometric') {
            comparison.push({
                criterion: "Taux de croissance",
                value1: scenario1.params.growthRate.toFixed(2) + " %",
                value2: scenario2.params.growthRate.toFixed(2) + " %",
                difference: (scenario1.params.growthRate - scenario2.params.growthRate).toFixed(2) + " %"
            });
        }
        
        comparison.push({
            criterion: "Total des versements",
            value1: data1.totalDeposits.toFixed(2) + " DH",
            value2: data2.totalDeposits.toFixed(2) + " DH",
            difference: (data1.totalDeposits - data2.totalDeposits).toFixed(2) + " DH"
        });
        
        comparison.push({
            criterion: "Total des intérêts",
            value1: data1.totalInterest.toFixed(2) + " DH",
            value2: data2.totalInterest.toFixed(2) + " DH",
            difference: (data1.totalInterest - data2.totalInterest).toFixed(2) + " DH"
        });
        
        comparison.push({
            criterion: "Capital final",
            value1: data1.balance.toFixed(2) + " DH",
            value2: data2.balance.toFixed(2) + " DH",
            difference: (data1.balance - data2.balance).toFixed(2) + " DH"
        });
        
        comparison.push({
            criterion: "Rendement (Intérêts/Versements)",
            value1: ((data1.totalInterest / data1.totalDeposits) * 100).toFixed(2) + " %",
            value2: ((data2.totalInterest / data2.totalDeposits) * 100).toFixed(2) + " %",
            difference: (((data1.totalInterest / data1.totalDeposits) - (data2.totalInterest / data2.totalDeposits)) * 100).toFixed(2) + " %"
        });
    }
    
    return comparison;
}
