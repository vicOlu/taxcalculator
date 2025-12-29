/**
 * Tax Return Estimator - Calculations
 * Core tax calculation functions
 */

// ============================================
// Utility Functions
// ============================================

function parseNumber(value) {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/[,$]/g, '')) || 0;
}

function formatCurrency(amount) {
    return '$' + Math.round(amount).toLocaleString('en-US');
}

function formatInput(input) {
    const value = parseNumber(input.value);
    if (value > 0) {
        input.value = value.toLocaleString('en-US');
    }
}

// ============================================
// Itemized Deductions Calculation
// ============================================

function getItemizedDeductions(agi, filingStatus) {
    // Homeowner deductions
    const mortgageInterest = parseNumber(document.getElementById('mortgageInterest').value);
    const mortgageInterestSecond = parseNumber(document.getElementById('mortgageInterestSecond').value);
    const mortgagePoints = parseNumber(document.getElementById('mortgagePoints').value);
    const pmiPremiums = parseNumber(document.getElementById('pmiPremiums').value);
    const propertyTaxes = parseNumber(document.getElementById('propertyTaxes').value);
    const homeOfficeExpenses = parseNumber(document.getElementById('homeOfficeExpenses').value);

    // SALT components
    const stateIncomeTaxPaid = parseNumber(document.getElementById('stateIncomeTaxPaid').value);
    const localIncomeTaxPaid = parseNumber(document.getElementById('localIncomeTaxPaid').value);
    const vehicleRegFees = parseNumber(document.getElementById('vehicleRegFees').value);

    // Total SALT (capped at $10,000)
    const totalSALT = propertyTaxes + stateIncomeTaxPaid + localIncomeTaxPaid + vehicleRegFees;
    const cappedSALT = Math.min(totalSALT, 10000);

    // Other deductions
    const charitableCash = parseNumber(document.getElementById('charitableCash').value);
    const charitableNonCash = parseNumber(document.getElementById('charitableNonCash').value);
    const charitableStock = parseNumber(document.getElementById('charitableStock').value);
    const medicalExpenses = parseNumber(document.getElementById('medicalExpenses').value);
    const casualtyLosses = parseNumber(document.getElementById('casualtyLosses').value);
    const gamblingLosses = parseNumber(document.getElementById('gamblingLosses').value);
    const investmentInterest = parseNumber(document.getElementById('investmentInterest').value);

    // Medical expenses only deductible above 7.5% AGI threshold
    const medicalThreshold = agi * 0.075;
    const deductibleMedical = Math.max(0, medicalExpenses - medicalThreshold);

    // Total charitable (with AGI limits)
    const maxCashCharity = agi * 0.60;
    const maxStockCharity = agi * 0.30;
    const cappedCashCharity = Math.min(charitableCash + charitableNonCash, maxCashCharity);
    const cappedStockCharity = Math.min(charitableStock, maxStockCharity);
    const totalCharitable = cappedCashCharity + cappedStockCharity;

    // Total mortgage interest (combined limit is on $750K debt)
    const totalMortgageInterest = mortgageInterest + mortgageInterestSecond + mortgagePoints + pmiPremiums;

    // Calculate total itemized
    const total = cappedSALT + totalMortgageInterest + totalCharitable + deductibleMedical + 
                  casualtyLosses + gamblingLosses + investmentInterest + homeOfficeExpenses;

    return {
        total,
        breakdown: {
            salt: cappedSALT,
            saltUncapped: totalSALT,
            mortgageInterest: totalMortgageInterest,
            charitable: totalCharitable,
            medical: deductibleMedical,
            medicalRaw: medicalExpenses,
            casualty: casualtyLosses,
            gambling: gamblingLosses,
            investmentInterest: investmentInterest,
            homeOffice: homeOfficeExpenses
        }
    };
}

function updateItemizedTotals() {
    // Get a rough AGI estimate for threshold calculations
    const grossIncome = parseNumber(document.getElementById('grossIncome').value);
    const seIncome = parseNumber(document.getElementById('selfEmploymentIncome').value);
    const bizExpenses = parseNumber(document.getElementById('businessExpenses').value);
    const otherIncome = parseNumber(document.getElementById('otherIncome').value);
    const { total: preTax } = getPreTaxDeductions();
    const roughAGI = grossIncome + Math.max(0, seIncome - bizExpenses) + otherIncome - preTax;

    const filingStatus = document.getElementById('filingStatus').value;
    const { total: itemizedTotal, breakdown } = getItemizedDeductions(roughAGI, filingStatus);

    // Update SALT total display
    document.getElementById('saltTotal').textContent = formatCurrency(breakdown.saltUncapped);
    if (breakdown.saltUncapped > 10000) {
        document.getElementById('saltTotal').style.color = 'var(--accent-amber)';
    } else {
        document.getElementById('saltTotal').style.color = 'var(--text-primary)';
    }

    // Update itemized total
    document.getElementById('itemizedTotal').textContent = formatCurrency(itemizedTotal);

    // Compare to standard deduction
    const standardDeductions = getStandardDeductions();
    const standardDed = standardDeductions[filingStatus];
    document.getElementById('standardDeductionCompare').textContent = formatCurrency(standardDed);

    // Show recommendation
    const recommendation = document.getElementById('deductionRecommendation');
    if (itemizedTotal > 0) {
        if (itemizedTotal > standardDed) {
            const savings = itemizedTotal - standardDed;
            recommendation.className = 'itemized-recommendation use-itemized';
            recommendation.innerHTML = `✓ Itemize! You'll save <strong>${formatCurrency(savings)}</strong> more than standard deduction`;
        } else {
            const difference = standardDed - itemizedTotal;
            recommendation.className = 'itemized-recommendation use-standard';
            recommendation.innerHTML = `Standard deduction is better by <strong>${formatCurrency(difference)}</strong>`;
        }
    } else {
        recommendation.className = 'itemized-recommendation';
        recommendation.textContent = 'Enter your deductions to see which option saves more';
    }
}

// ============================================
// Pre-Tax Deductions Calculation
// ============================================

function getPreTaxDeductions() {
    const fields = [
        'retirement401k',
        'traditionalIRA',
        'hsaContributions',
        'healthPremiums',
        'fsaContributions',
        'otherPreTax'
    ];

    let total = 0;
    const breakdown = {};

    fields.forEach(field => {
        const value = parseNumber(document.getElementById(field).value);
        breakdown[field] = value;
        total += value;
    });

    return { total, breakdown };
}

function updatePreTaxTotal() {
    const { total } = getPreTaxDeductions();
    document.getElementById('pretaxTotal').textContent = formatCurrency(total);
}

// ============================================
// Tax Bracket Calculation
// ============================================

function calculateBracketTax(income, brackets) {
    let tax = 0;
    let remaining = income;
    const breakdown = [];

    for (let i = 0; i < brackets.length && remaining > 0; i++) {
        const bracket = brackets[i];
        const bracketSize = bracket.max - bracket.min;
        const taxableInBracket = Math.min(remaining, bracketSize);
        const taxInBracket = taxableInBracket * bracket.rate;

        if (taxableInBracket > 0) {
            breakdown.push({
                rate: bracket.rate,
                amount: taxableInBracket,
                tax: taxInBracket
            });
        }

        tax += taxInBracket;
        remaining -= taxableInBracket;
    }

    return { tax, breakdown };
}

// ============================================
// Marginal Rate Functions
// ============================================

function getStateMarginalRate(state, income, filingStatus) {
    const brackets = state === 'NJ' ? njBrackets : nyBrackets;
    const key = getFilingStatusKey(filingStatus);
    const stateBrackets = brackets[key];

    for (let i = stateBrackets.length - 1; i >= 0; i--) {
        if (income > stateBrackets[i].min) {
            return stateBrackets[i].rate;
        }
    }
    return stateBrackets[0].rate;
}

function getFederalMarginalRate(income, filingStatus) {
    const brackets = getFederalBrackets()[filingStatus];
    for (let i = brackets.length - 1; i >= 0; i--) {
        if (income > brackets[i].min) {
            return brackets[i].rate;
        }
    }
    return brackets[0].rate;
}

// ============================================
// Main Tax Calculation
// ============================================

function calculateTax() {
    // Get form values
    const filingStatus = document.getElementById('filingStatus').value;
    const state = document.getElementById('state').value;
    const isNYCResident = document.getElementById('nycResident').checked;

    // Income
    const grossIncome = parseNumber(document.getElementById('grossIncome').value);
    const selfEmploymentIncome = parseNumber(document.getElementById('selfEmploymentIncome').value);
    const businessExpenses = parseNumber(document.getElementById('businessExpenses').value);
    const otherIncome = parseNumber(document.getElementById('otherIncome').value);

    // Net self-employment income
    const netSelfEmploymentIncome = Math.max(0, selfEmploymentIncome - businessExpenses);

    // Pre-tax deductions
    const { total: preTaxDeductions, breakdown: preTaxData } = getPreTaxDeductions();

    // Deduction type
    const deductionType = document.querySelector('.toggle-btn.active').dataset.type;

    // Withholdings
    const federalWithheld = parseNumber(document.getElementById('federalWithheld').value);
    const stateWithheld = parseNumber(document.getElementById('stateWithheld').value);
    const cityWithheld = parseNumber(document.getElementById('cityWithheld').value);

    // Calculate self-employment tax
    let seTax = 0;
    let seDeduction = 0;
    const seTaxConstants = getSETaxConstants();

    if (netSelfEmploymentIncome > 0) {
        // Calculate net earnings for SE tax (92.35% of net SE income)
        const netEarnings = netSelfEmploymentIncome * seTaxConstants.netEarningsMultiplier;

        // Social Security portion (capped at wage base minus W-2 wages)
        const ssWageBase = seTaxConstants.socialSecurityWageBase;
        const remainingSSBase = Math.max(0, ssWageBase - grossIncome);
        const ssTaxableEarnings = Math.min(netEarnings, remainingSSBase);
        const ssTax = ssTaxableEarnings * seTaxConstants.socialSecurityRate;

        // Medicare portion (no cap)
        const medicareTax = netEarnings * seTaxConstants.medicareRate;

        // Additional Medicare tax for high earners
        const additionalMedicareThreshold = (filingStatus === 'married')
            ? seTaxConstants.additionalMedicareThresholdMarried
            : seTaxConstants.additionalMedicareThresholdSingle;
        const totalEarnedIncome = grossIncome + netEarnings;
        const additionalMedicareTax = Math.max(0, totalEarnedIncome - additionalMedicareThreshold) * seTaxConstants.additionalMedicareRate;

        seTax = ssTax + medicareTax + additionalMedicareTax;
        seDeduction = seTax / 2; // Half of SE tax is deductible
    }

    // Calculate AGI (includes SE deduction)
    const totalIncome = grossIncome + netSelfEmploymentIncome + otherIncome;
    const agi = totalIncome - preTaxDeductions - seDeduction;

    // Calculate deduction
    let deduction;
    let itemizedBreakdown = null;
    const standardDeductions = getStandardDeductions();
    if (deductionType === 'standard') {
        deduction = standardDeductions[filingStatus];
    } else {
        const { total: itemizedTotal, breakdown } = getItemizedDeductions(agi, filingStatus);
        itemizedBreakdown = breakdown;
        deduction = itemizedTotal;

        // Use standard if higher
        if (standardDeductions[filingStatus] > deduction) {
            deduction = standardDeductions[filingStatus];
        }
    }

    // Federal taxable income
    const federalTaxableIncome = Math.max(0, agi - deduction);

    // Calculate federal tax
    const federalBrackets = getFederalBrackets();
    const federalResult = calculateBracketTax(federalTaxableIncome, federalBrackets[filingStatus]);
    const federalTax = federalResult.tax;

    // State tax calculation
    let stateTax = 0;
    let stateBreakdown = [];
    let stateTaxableIncome = agi;

    const stateFilingKey = getFilingStatusKey(filingStatus);

    if (state === 'NJ') {
        // NJ uses gross income, no standard deduction
        stateTaxableIncome = agi;
        const njResult = calculateBracketTax(stateTaxableIncome, njBrackets[stateFilingKey]);
        stateTax = njResult.tax;
        stateBreakdown = njResult.breakdown;
    } else {
        // NY uses standard deduction
        const nyStandardDeduction = getNYStandardDeduction();
        const nyDeduction = nyStandardDeduction[filingStatus] || nyStandardDeduction.single;
        stateTaxableIncome = Math.max(0, agi - nyDeduction);
        const nyResult = calculateBracketTax(stateTaxableIncome, nyBrackets[stateFilingKey]);
        stateTax = nyResult.tax;
        stateBreakdown = nyResult.breakdown;
    }

    // NYC tax
    let nycTax = 0;
    if (isNYCResident) {
        const nycResult = calculateBracketTax(stateTaxableIncome, nycBrackets[stateFilingKey]);
        nycTax = nycResult.tax;
    }

    // Calculate balances (federal now includes SE tax)
    const totalFederalTax = federalTax + seTax;
    const federalBalance = federalWithheld - totalFederalTax;
    const stateBalance = stateWithheld - stateTax;
    const nycBalance = cityWithheld - nycTax;
    const totalBalance = federalBalance + stateBalance + (isNYCResident ? nycBalance : 0);

    // Calculate effective rate (includes SE tax)
    const totalTax = totalFederalTax + stateTax + nycTax;
    const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome * 100) : 0;

    // Update UI
    document.getElementById('stateIndicator').textContent = state;
    document.getElementById('yearIndicator').textContent = selectedTaxYear;
    document.getElementById('stateTaxTitle').textContent = `State Tax (${state})`;

    document.getElementById('resultGrossIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('resultAdjustments').textContent = '-' + formatCurrency(preTaxDeductions + seDeduction);
    document.getElementById('resultAGI').textContent = formatCurrency(agi);
    document.getElementById('resultDeduction').textContent = '-' + formatCurrency(deduction);
    document.getElementById('resultTaxableIncome').textContent = formatCurrency(federalTaxableIncome);

    document.getElementById('resultFederalTax').textContent = formatCurrency(federalTax);

    // Show/hide SE tax rows
    const seTaxRow = document.getElementById('seTaxRow');
    const seDeductionRow = document.getElementById('seDeductionRow');
    if (seTax > 0) {
        seTaxRow.style.display = 'flex';
        seDeductionRow.style.display = 'flex';
        document.getElementById('resultSETax').textContent = formatCurrency(seTax);
        document.getElementById('resultSEDeduction').textContent = '-' + formatCurrency(seDeduction);
    } else {
        seTaxRow.style.display = 'none';
        seDeductionRow.style.display = 'none';
    }

    document.getElementById('resultTotalFederalTax').textContent = formatCurrency(totalFederalTax);
    document.getElementById('resultFederalWithheld').textContent = formatCurrency(federalWithheld);

    const federalBalanceEl = document.getElementById('resultFederalBalance');
    federalBalanceEl.textContent = (federalBalance >= 0 ? '' : '-') + formatCurrency(Math.abs(federalBalance));
    federalBalanceEl.className = 'result-value ' + (federalBalance >= 0 ? 'positive' : 'negative');

    document.getElementById('resultStateTax').textContent = formatCurrency(stateTax);
    document.getElementById('resultStateWithheld').textContent = formatCurrency(stateWithheld);

    const stateBalanceEl = document.getElementById('resultStateBalance');
    stateBalanceEl.textContent = (stateBalance >= 0 ? '' : '-') + formatCurrency(Math.abs(stateBalance));
    stateBalanceEl.className = 'result-value ' + (stateBalance >= 0 ? 'positive' : 'negative');

    // NYC section
    const nycSection = document.getElementById('nycTaxSection');
    if (isNYCResident) {
        nycSection.classList.remove('hidden');
        document.getElementById('resultNYCTax').textContent = formatCurrency(nycTax);
        document.getElementById('resultNYCWithheld').textContent = formatCurrency(cityWithheld);

        const nycBalanceEl = document.getElementById('resultNYCBalance');
        nycBalanceEl.textContent = (nycBalance >= 0 ? '' : '-') + formatCurrency(Math.abs(nycBalance));
        nycBalanceEl.className = 'result-value ' + (nycBalance >= 0 ? 'positive' : 'negative');
    } else {
        nycSection.classList.add('hidden');
    }

    // Total result
    const totalResultEl = document.getElementById('totalResult');
    totalResultEl.textContent = formatCurrency(Math.abs(totalBalance));
    totalResultEl.className = 'total-value ' + (totalBalance >= 0 ? 'refund' : 'owed');

    const description = document.getElementById('resultDescription');
    if (totalBalance > 0) {
        description.textContent = 'Estimated refund amount';
    } else if (totalBalance < 0) {
        description.textContent = 'Estimated amount owed';
    } else {
        description.textContent = 'You\'re right on target!';
    }

    document.getElementById('effectiveRate').textContent = effectiveRate.toFixed(1) + '%';

    // Generate and render tax reduction guidance
    const marginalRate = getFederalMarginalRate(federalTaxableIncome, filingStatus);
    const guidanceInputs = {
        filingStatus,
        state,
        isNYCResident,
        totalIncome,
        grossIncome,
        netSelfEmploymentIncome,
        agi,
        preTaxDeductions,
        preTaxData,
        federalTaxableIncome,
        federalTax,
        federalWithheld,
        seTax,
        stateTax,
        nycTax,
        marginalRate,
        deductionType,
        itemizedTotal: deductionType === 'itemized' ? deduction : 0,
        age: 40 // Default assumption
    };

    const { guidance, totalPotentialSavings } = generateGuidance(guidanceInputs);
    renderGuidance(guidance, totalPotentialSavings);

    // Animate results
    document.getElementById('resultsCard').classList.add('animate-in');
}
