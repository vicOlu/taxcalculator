/**
 * Tax Return Estimator - Tax Reduction Guidance
 * Generates personalized tax reduction recommendations
 */

function generateGuidance(inputs) {
    const {
        filingStatus, state, isNYCResident, totalIncome, grossIncome,
        netSelfEmploymentIncome, agi, preTaxDeductions, preTaxData,
        federalTaxableIncome, federalTax, federalWithheld, seTax,
        stateTax, nycTax, marginalRate, deductionType, itemizedTotal
    } = inputs;

    const guidance = { immediate: [], retirement: [], deductions: [], planning: [] };
    let totalPotentialSavings = 0;
    const combinedMarginalRate = marginalRate + getStateMarginalRate(state, agi, filingStatus) + (isNYCResident ? 0.03876 : 0);
    const limits = getContributionLimits();

    const current401k = preTaxData?.retirement401k || 0;
    const currentIRA = preTaxData?.traditionalIRA || 0;
    const currentHSA = preTaxData?.hsaContributions || 0;
    const currentFSA = preTaxData?.fsaContributions || 0;

    // ============ SELF-EMPLOYMENT GUIDANCE ============
    if (netSelfEmploymentIncome > 0) {
        const sepLimit = Math.min(netSelfEmploymentIncome * 0.25, limits.sepIRA);
        if (sepLimit > 5000) {
            const sepSavings = Math.round(sepLimit * combinedMarginalRate);
            totalPotentialSavings += sepSavings;
            guidance.retirement.push({
                title: 'SEP-IRA for Self-Employment Income',
                description: `As a self-employed individual, you can contribute up to 25% of your net self-employment income to a SEP-IRA.`,
                savings: sepSavings,
                limit: `Your max SEP contribution: ${formatCurrency(sepLimit)} (25% of ${formatCurrency(netSelfEmploymentIncome)})`,
                calculation: `<strong>How calculated:</strong> <code>${formatCurrency(sepLimit)}</code> contribution × <code>${(combinedMarginalRate * 100).toFixed(1)}%</code> combined marginal rate = <code>${formatCurrency(sepSavings)}</code> saved`,
                priority: 'high'
            });
        }

        if (netSelfEmploymentIncome > 50000) {
            guidance.retirement.push({
                title: 'Consider a Solo 401(k)',
                description: 'A Solo 401(k) allows both employee ($23,500) and employer (25% of net SE income) contributions, potentially higher than SEP-IRA limits.',
                savings: null,
                limit: `${selectedTaxYear} total limit: ${formatCurrency(limits.solo401k)} + catch-up if applicable`,
                priority: 'medium'
            });
        }

        guidance.deductions.push({
            title: 'Self-Employed Health Insurance Deduction',
            description: 'If you\'re self-employed, you can deduct 100% of health insurance premiums for yourself, spouse, and dependents as an above-the-line deduction.',
            savings: null,
            limit: 'Cannot exceed net self-employment income',
            priority: 'high'
        });

        if (seTax > 1000) {
            guidance.planning.push({
                title: 'Quarterly Estimated Tax Payments Required',
                description: `With ${formatCurrency(seTax)} in self-employment tax, you likely need to make quarterly estimated payments to avoid underpayment penalties.`,
                savings: null,
                limit: 'Pay at least 90% of current year or 100% of prior year tax',
                priority: 'high'
            });
        }

        if (agi < 197300) {
            const qbiDeduction = netSelfEmploymentIncome * 0.20;
            const qbiSavings = Math.round(qbiDeduction * marginalRate);
            guidance.deductions.push({
                title: 'Qualified Business Income (QBI) Deduction',
                description: `You may qualify for a 20% deduction on qualified business income.`,
                savings: qbiSavings,
                limit: `Potential deduction: ${formatCurrency(qbiDeduction)} (20% of ${formatCurrency(netSelfEmploymentIncome)})`,
                calculation: `<strong>How calculated:</strong> <code>${formatCurrency(qbiDeduction)}</code> QBI deduction × <code>${(marginalRate * 100).toFixed(0)}%</code> federal marginal rate = <code>${formatCurrency(qbiSavings)}</code> saved`,
                priority: 'high'
            });
            totalPotentialSavings += qbiSavings;
        }

        guidance.deductions.push({
            title: 'Maximize Business Expense Deductions',
            description: 'Common deductible expenses: home office ($5/sq ft up to 300 sq ft), equipment, software, travel, vehicle expenses, professional services.',
            savings: null,
            limit: 'Must be ordinary and necessary business expenses',
            priority: 'medium'
        });
    }

    // ============ IMMEDIATE ACTIONS ============
    const hsaLimit = filingStatus === 'married' ? limits.hsaFamily : limits.hsaIndividual;
    if (currentHSA < hsaLimit) {
        const hsaRoom = hsaLimit - currentHSA;
        if (hsaRoom > 0) {
            const savings = Math.round(hsaRoom * combinedMarginalRate);
            totalPotentialSavings += savings;
            guidance.immediate.push({
                title: 'Maximize HSA Contributions',
                description: `You're contributing ${formatCurrency(currentHSA)} to your HSA. HSA contributions are triple tax-advantaged: tax-deductible, grow tax-free, and withdrawals for medical expenses are tax-free.`,
                savings: savings,
                limit: `${selectedTaxYear} limit: ${formatCurrency(hsaLimit)} | Room to contribute: ${formatCurrency(hsaRoom)}`,
                calculation: `<strong>How calculated:</strong> <code>${formatCurrency(hsaRoom)}</code> additional contribution × <code>${(combinedMarginalRate * 100).toFixed(1)}%</code> combined rate = <code>${formatCurrency(savings)}</code>`,
                priority: 'high'
            });
        }
    }

    if (currentFSA < limits.fsaHealth && totalIncome > 50000) {
        const fsaRoom = limits.fsaHealth - currentFSA;
        const fsaContributionEstimate = Math.min(fsaRoom, 2000);
        const fsaSavings = Math.round(fsaContributionEstimate * combinedMarginalRate);
        guidance.immediate.push({
            title: 'Consider Flexible Spending Account (FSA)',
            description: currentFSA > 0 
                ? `You're contributing ${formatCurrency(currentFSA)} to FSA. You can contribute up to ${formatCurrency(limits.fsaHealth)} for health expenses.`
                : 'Use pre-tax dollars for predictable medical expenses or dependent care.',
            savings: fsaSavings,
            limit: `${selectedTaxYear} limits: ${formatCurrency(limits.fsaHealth)} (health) / ${formatCurrency(limits.fsaDependent)} (dependent care)`,
            calculation: `<strong>How calculated:</strong> <code>${formatCurrency(fsaContributionEstimate)}</code> estimated contribution × <code>${(combinedMarginalRate * 100).toFixed(1)}%</code> combined marginal rate = <code>${formatCurrency(fsaSavings)}</code> saved`,
            priority: 'medium'
        });
        totalPotentialSavings += fsaSavings;
    }

    // ============ RETIREMENT ============
    if (grossIncome > 0 && current401k < limits.traditional401k) {
        const room = limits.traditional401k - current401k;
        const savings = Math.round(room * combinedMarginalRate);
        totalPotentialSavings += savings;
        guidance.retirement.push({
            title: 'Maximize 401(k) Contributions',
            description: current401k > 0 
                ? `You're contributing ${formatCurrency(current401k)} to your 401(k). Consider increasing to the maximum limit.`
                : 'Contribute to your employer\'s 401(k) plan. Don\'t leave employer matching on the table.',
            savings: savings,
            limit: `${selectedTaxYear} limit: ${formatCurrency(limits.traditional401k)} (under 50) / ${formatCurrency(limits.traditional401kOver50)} (50+) | Room: ${formatCurrency(room)}`,
            calculation: `<strong>How calculated:</strong> <code>${formatCurrency(room)}</code> additional contribution × <code>${(combinedMarginalRate * 100).toFixed(1)}%</code> combined marginal rate = <code>${formatCurrency(savings)}</code> saved`,
            priority: 'high'
        });
    } else if (grossIncome > 0 && current401k >= limits.traditional401k) {
        guidance.retirement.push({
            title: '401(k) Maximized ✓',
            description: `Great job! You're contributing ${formatCurrency(current401k)} to your 401(k).`,
            savings: null,
            limit: 'Consider catch-up contributions if 50+',
            priority: 'low'
        });
    }

    if (currentIRA < limits.ira && (totalIncome < 150000 || (filingStatus === 'married' && totalIncome < 230000))) {
        const iraRoom = limits.ira - currentIRA;
        const iraSavings = Math.round(iraRoom * combinedMarginalRate);
        totalPotentialSavings += iraSavings;
        guidance.retirement.push({
            title: 'Traditional IRA Contribution',
            description: currentIRA > 0
                ? `You're contributing ${formatCurrency(currentIRA)} to a Traditional IRA. Room to add: ${formatCurrency(iraRoom)}.`
                : 'Contribute to a Traditional IRA for an immediate tax deduction.',
            savings: iraSavings,
            limit: `${selectedTaxYear} limit: ${formatCurrency(limits.ira)} (under 50) / ${formatCurrency(limits.iraOver50)} (50+)`,
            calculation: `<strong>How calculated:</strong> <code>${formatCurrency(iraRoom)}</code> contribution × <code>${(combinedMarginalRate * 100).toFixed(1)}%</code> combined marginal rate = <code>${formatCurrency(iraSavings)}</code> saved`,
            priority: 'high'
        });
    }

    if (marginalRate <= 0.22) {
        guidance.retirement.push({
            title: 'Consider Roth Contributions',
            description: 'At your current tax bracket, Roth contributions may be beneficial. Pay tax now at a lower rate for tax-free growth and withdrawals.',
            savings: null,
            limit: 'Same limits as traditional accounts',
            priority: 'medium'
        });
    }

    if (totalIncome > 165000) {
        guidance.retirement.push({
            title: 'Backdoor Roth IRA Strategy',
            description: 'If your income exceeds Roth IRA limits, consider the "backdoor" strategy: contribute to a non-deductible Traditional IRA, then convert to Roth.',
            savings: null,
            limit: 'No income limit for conversions',
            priority: 'low'
        });
    }

    // ============ DEDUCTIONS ============
    // Homeowner-specific guidance
    const mortgageInterest = preTaxData?.mortgageInterest || 0;
    const propertyTaxes = preTaxData?.propertyTaxes || 0;
    
    if (totalIncome > 75000 && deductionType === 'standard') {
        // Check if they might benefit from itemizing as a homeowner
        const potentialMortgageInterest = totalIncome * 0.03; // Rough estimate
        const potentialPropertyTax = 8000; // Average estimate
        const potentialItemized = potentialMortgageInterest + Math.min(potentialPropertyTax, 10000);
        const standardDeductions = getStandardDeductions();
        const standardDed = standardDeductions[filingStatus];
        
        if (potentialItemized > standardDed * 0.7) {
            guidance.deductions.push({
                title: 'Homeowner Tax Benefits',
                description: 'If you own a home, mortgage interest and property taxes may allow you to itemize. Switch to "Itemized" deductions above to enter your homeowner expenses and see if it saves more than the standard deduction.',
                savings: null,
                limit: `Your standard deduction: ${formatCurrency(standardDed)}`,
                priority: 'high'
            });
        }
    }

    if (deductionType === 'standard') {
        const potentialItemized = estimatePotentialItemized(totalIncome, state);
        const standardDeductions = getStandardDeductions();
        const standardDed = standardDeductions[filingStatus];
        if (potentialItemized > standardDed * 0.8) {
            guidance.deductions.push({
                title: 'Review Itemized Deductions',
                description: 'Track mortgage interest, state/local taxes (up to $10K), charitable donations, and medical expenses to see if itemizing would save more.',
                savings: null,
                limit: `Your standard deduction: ${formatCurrency(standardDed)}`,
                priority: 'medium'
            });
        }
    }

    if (totalIncome > 100000) {
        guidance.deductions.push({
            title: 'Charitable Giving Strategies',
            description: 'Consider bunching charitable donations in alternating years to exceed the standard deduction, or donate appreciated stock.',
            savings: null,
            limit: 'Deduction limited to 60% of AGI for cash donations',
            priority: 'medium'
        });

        guidance.deductions.push({
            title: 'Donor-Advised Fund (DAF)',
            description: 'Contribute to a DAF for an immediate tax deduction, then distribute to charities over time.',
            savings: null,
            limit: 'No minimum, immediate deduction in contribution year',
            priority: 'low'
        });
    }

    if (state === 'NJ') {
        guidance.deductions.push({
            title: 'NJ Property Tax Deduction',
            description: 'New Jersey allows a property tax deduction up to $15,000 on your state return, separate from the federal SALT cap.',
            savings: null,
            limit: 'Up to $15,000 for NJ state taxes',
            priority: 'medium'
        });
    }

    if (state === 'NY') {
        const ny529Limit = filingStatus === 'married' ? 10000 : 5000;
        const ny529Savings = Math.round(ny529Limit * getStateMarginalRate('NY', agi, filingStatus));
        guidance.deductions.push({
            title: 'NY 529 Plan Deduction',
            description: 'New York offers a state tax deduction for contributions to NY\'s 529 college savings plan.',
            savings: ny529Savings,
            limit: `Up to ${formatCurrency(ny529Limit)} deduction`,
            calculation: `<strong>How calculated:</strong> <code>${formatCurrency(ny529Limit)}</code> max contribution × <code>${(getStateMarginalRate('NY', agi, filingStatus) * 100).toFixed(2)}%</code> NY marginal rate = <code>${formatCurrency(ny529Savings)}</code> state tax saved`,
            priority: 'medium'
        });
    }

    // ============ TAX PLANNING ============
    if (totalIncome > 75000) {
        const tlhSavings = Math.round(3000 * combinedMarginalRate);
        guidance.planning.push({
            title: 'Tax-Loss Harvesting',
            description: 'Sell investments at a loss to offset capital gains. Up to $3,000 of excess losses can offset ordinary income.',
            savings: tlhSavings,
            limit: '$3,000 annual limit against ordinary income',
            calculation: `<strong>How calculated:</strong> <code>$3,000</code> max offset × <code>${(combinedMarginalRate * 100).toFixed(1)}%</code> combined marginal rate = <code>${formatCurrency(tlhSavings)}</code> potential savings`,
            priority: 'medium'
        });
    }

    guidance.planning.push({
        title: 'Income & Deduction Timing',
        description: 'If you expect to be in a different tax bracket next year, consider accelerating or deferring income and deductions.',
        savings: null,
        limit: 'Strategy depends on year-over-year bracket changes',
        priority: 'low'
    });

    if (inputs.federalTax > inputs.federalWithheld + 1000) {
        guidance.planning.push({
            title: 'Adjust Withholding or Pay Quarterly',
            description: 'You may owe a significant amount. Consider adjusting your W-4 withholding or making quarterly estimated payments.',
            savings: null,
            limit: 'Avoid penalty by paying 90% of current year or 100% of prior year tax',
            priority: 'high'
        });
    }

    if (totalIncome > 150000 && netSelfEmploymentIncome === 0) {
        guidance.planning.push({
            title: 'Consider Tax-Advantaged Business Structures',
            description: 'If you start a side business, structures like S-Corps or SEP-IRAs can provide significant tax savings.',
            savings: null,
            limit: `SEP-IRA: up to ${formatCurrency(limits.sepIRA)} for ${selectedTaxYear}`,
            priority: 'medium'
        });
    }

    if (combinedMarginalRate > 0.35) {
        guidance.planning.push({
            title: 'Consider Municipal Bonds',
            description: 'At your tax bracket, tax-free municipal bond interest may provide better after-tax returns than taxable bonds.',
            savings: null,
            limit: 'Compare tax-equivalent yields at your bracket',
            priority: 'low'
        });
    }

    return { guidance, totalPotentialSavings };
}

function estimatePotentialItemized(income, state) {
    const saltEstimate = Math.min(income * 0.05, 10000);
    const mortgageEstimate = income > 100000 ? income * 0.03 : 0;
    const charitableEstimate = income * 0.02;
    return saltEstimate + mortgageEstimate + charitableEstimate;
}

function renderGuidance(guidance, totalSavings) {
    const card = document.getElementById('guidanceCard');
    card.classList.remove('hidden');
    document.getElementById('potentialSavings').textContent = formatCurrency(totalSavings);

    renderGuidanceTab('immediateTab', guidance.immediate, 'Immediate Actions');
    renderGuidanceTab('retirementTab', guidance.retirement, 'Retirement Strategies');
    renderGuidanceTab('deductionsTab', guidance.deductions, 'Deduction Opportunities');
    renderGuidanceTab('planningTab', guidance.planning, 'Tax Planning');
}

function renderGuidanceTab(tabId, items, title) {
    const container = document.getElementById(tabId);

    if (items.length === 0) {
        container.innerHTML = `
            <div class="no-guidance">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No additional recommendations in this category based on your current inputs.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="guidance-item priority-${item.priority}">
            <div class="guidance-item-header">
                <span class="guidance-item-title">${item.title}</span>
                ${item.savings ? `<span class="guidance-item-savings">Save ~${formatCurrency(item.savings)}/yr</span>` : ''}
            </div>
            <p class="guidance-item-description">${item.description}</p>
            ${item.limit ? `<div class="guidance-item-limit">${item.limit}</div>` : ''}
            ${item.calculation ? `<div class="guidance-item-calculation">${item.calculation}</div>` : ''}
        </div>
    `).join('');
}
