/**
 * Tax Return Estimator - Tax Data
 * Contains all tax brackets, deductions, and contribution limits for 2024-2026
 */

// Current selected tax year
let selectedTaxYear = 2025;

// ============================================
// Federal Tax Brackets by Year
// ============================================
const federalBracketsByYear = {
    2024: {
        single: [
            { min: 0, max: 11600, rate: 0.10 },
            { min: 11600, max: 47150, rate: 0.12 },
            { min: 47150, max: 100525, rate: 0.22 },
            { min: 100525, max: 191950, rate: 0.24 },
            { min: 191950, max: 243725, rate: 0.32 },
            { min: 243725, max: 609350, rate: 0.35 },
            { min: 609350, max: Infinity, rate: 0.37 }
        ],
        married: [
            { min: 0, max: 23200, rate: 0.10 },
            { min: 23200, max: 94300, rate: 0.12 },
            { min: 94300, max: 201050, rate: 0.22 },
            { min: 201050, max: 383900, rate: 0.24 },
            { min: 383900, max: 487450, rate: 0.32 },
            { min: 487450, max: 731200, rate: 0.35 },
            { min: 731200, max: Infinity, rate: 0.37 }
        ],
        marriedSeparate: [
            { min: 0, max: 11600, rate: 0.10 },
            { min: 11600, max: 47150, rate: 0.12 },
            { min: 47150, max: 100525, rate: 0.22 },
            { min: 100525, max: 191950, rate: 0.24 },
            { min: 191950, max: 243725, rate: 0.32 },
            { min: 243725, max: 365600, rate: 0.35 },
            { min: 365600, max: Infinity, rate: 0.37 }
        ],
        hoh: [
            { min: 0, max: 16550, rate: 0.10 },
            { min: 16550, max: 63100, rate: 0.12 },
            { min: 63100, max: 100500, rate: 0.22 },
            { min: 100500, max: 191950, rate: 0.24 },
            { min: 191950, max: 243700, rate: 0.32 },
            { min: 243700, max: 609350, rate: 0.35 },
            { min: 609350, max: Infinity, rate: 0.37 }
        ]
    },
    2025: {
        single: [
            { min: 0, max: 11925, rate: 0.10 },
            { min: 11925, max: 48475, rate: 0.12 },
            { min: 48475, max: 103350, rate: 0.22 },
            { min: 103350, max: 197300, rate: 0.24 },
            { min: 197300, max: 250525, rate: 0.32 },
            { min: 250525, max: 626350, rate: 0.35 },
            { min: 626350, max: Infinity, rate: 0.37 }
        ],
        married: [
            { min: 0, max: 23850, rate: 0.10 },
            { min: 23850, max: 96950, rate: 0.12 },
            { min: 96950, max: 206700, rate: 0.22 },
            { min: 206700, max: 394600, rate: 0.24 },
            { min: 394600, max: 501050, rate: 0.32 },
            { min: 501050, max: 751600, rate: 0.35 },
            { min: 751600, max: Infinity, rate: 0.37 }
        ],
        marriedSeparate: [
            { min: 0, max: 11925, rate: 0.10 },
            { min: 11925, max: 48475, rate: 0.12 },
            { min: 48475, max: 103350, rate: 0.22 },
            { min: 103350, max: 197300, rate: 0.24 },
            { min: 197300, max: 250525, rate: 0.32 },
            { min: 250525, max: 375800, rate: 0.35 },
            { min: 375800, max: Infinity, rate: 0.37 }
        ],
        hoh: [
            { min: 0, max: 17000, rate: 0.10 },
            { min: 17000, max: 64850, rate: 0.12 },
            { min: 64850, max: 103350, rate: 0.22 },
            { min: 103350, max: 197300, rate: 0.24 },
            { min: 197300, max: 250500, rate: 0.32 },
            { min: 250500, max: 626350, rate: 0.35 },
            { min: 626350, max: Infinity, rate: 0.37 }
        ]
    },
    2026: {
        single: [
            { min: 0, max: 12400, rate: 0.10 },
            { min: 12400, max: 50400, rate: 0.12 },
            { min: 50400, max: 105700, rate: 0.22 },
            { min: 105700, max: 203150, rate: 0.24 },
            { min: 203150, max: 256200, rate: 0.32 },
            { min: 256200, max: 640600, rate: 0.35 },
            { min: 640600, max: Infinity, rate: 0.37 }
        ],
        married: [
            { min: 0, max: 24800, rate: 0.10 },
            { min: 24800, max: 100800, rate: 0.12 },
            { min: 100800, max: 211400, rate: 0.22 },
            { min: 211400, max: 406300, rate: 0.24 },
            { min: 406300, max: 512350, rate: 0.32 },
            { min: 512350, max: 768700, rate: 0.35 },
            { min: 768700, max: Infinity, rate: 0.37 }
        ],
        marriedSeparate: [
            { min: 0, max: 12400, rate: 0.10 },
            { min: 12400, max: 50400, rate: 0.12 },
            { min: 50400, max: 105700, rate: 0.22 },
            { min: 105700, max: 203150, rate: 0.24 },
            { min: 203150, max: 256200, rate: 0.32 },
            { min: 256200, max: 384350, rate: 0.35 },
            { min: 384350, max: Infinity, rate: 0.37 }
        ],
        hoh: [
            { min: 0, max: 17650, rate: 0.10 },
            { min: 17650, max: 67450, rate: 0.12 },
            { min: 67450, max: 105700, rate: 0.22 },
            { min: 105700, max: 203150, rate: 0.24 },
            { min: 203150, max: 256200, rate: 0.32 },
            { min: 256200, max: 640600, rate: 0.35 },
            { min: 640600, max: Infinity, rate: 0.37 }
        ]
    }
};

// ============================================
// Standard Deductions by Year
// ============================================
const standardDeductionsByYear = {
    2024: {
        single: 14600,
        married: 29200,
        marriedSeparate: 14600,
        hoh: 21900
    },
    2025: {
        single: 15000,
        married: 30000,
        marriedSeparate: 15000,
        hoh: 22500
    },
    2026: {
        single: 16100,
        married: 32200,
        marriedSeparate: 16100,
        hoh: 24150
    }
};

// ============================================
// Self-Employment Tax Constants by Year
// ============================================
const seTaxConstantsByYear = {
    2024: {
        socialSecurityRate: 0.124,
        medicareRate: 0.029,
        additionalMedicareRate: 0.009,
        socialSecurityWageBase: 168600,
        additionalMedicareThresholdSingle: 200000,
        additionalMedicareThresholdMarried: 250000,
        netEarningsMultiplier: 0.9235
    },
    2025: {
        socialSecurityRate: 0.124,
        medicareRate: 0.029,
        additionalMedicareRate: 0.009,
        socialSecurityWageBase: 176100,
        additionalMedicareThresholdSingle: 200000,
        additionalMedicareThresholdMarried: 250000,
        netEarningsMultiplier: 0.9235
    },
    2026: {
        socialSecurityRate: 0.124,
        medicareRate: 0.029,
        additionalMedicareRate: 0.009,
        socialSecurityWageBase: 184500,
        additionalMedicareThresholdSingle: 200000,
        additionalMedicareThresholdMarried: 250000,
        netEarningsMultiplier: 0.9235
    }
};

// ============================================
// Contribution Limits by Year
// ============================================
const contributionLimitsByYear = {
    2024: {
        traditional401k: 23000,
        traditional401kOver50: 30500,
        traditional401k60to63: 30500,
        ira: 7000,
        iraOver50: 8000,
        hsaIndividual: 4150,
        hsaFamily: 8300,
        fsaHealth: 3200,
        fsaDependent: 5000,
        sepIRA: 69000,
        solo401k: 69000
    },
    2025: {
        traditional401k: 23500,
        traditional401kOver50: 31000,
        traditional401k60to63: 34750,
        ira: 7000,
        iraOver50: 8000,
        hsaIndividual: 4300,
        hsaFamily: 8550,
        fsaHealth: 3300,
        fsaDependent: 5000,
        sepIRA: 70000,
        solo401k: 70000
    },
    2026: {
        traditional401k: 24500,
        traditional401kOver50: 32500,
        traditional401k60to63: 35750,
        ira: 7500,
        iraOver50: 8600,
        hsaIndividual: 4400,
        hsaFamily: 8750,
        fsaHealth: 3400,
        fsaDependent: 5000,
        sepIRA: 72000,
        solo401k: 72000
    }
};

// ============================================
// NY Standard Deduction by Year
// ============================================
const nyStandardDeductionByYear = {
    2024: { single: 8000, married: 16050, marriedSeparate: 8000, hoh: 11200 },
    2025: { single: 8000, married: 16050, marriedSeparate: 8000, hoh: 11200 },
    2026: { single: 8000, married: 16050, marriedSeparate: 8000, hoh: 11200 }
};

// ============================================
// New Jersey Tax Brackets (stable across years)
// ============================================
const njBrackets = {
    single: [
        { min: 0, max: 20000, rate: 0.014 },
        { min: 20000, max: 35000, rate: 0.0175 },
        { min: 35000, max: 40000, rate: 0.035 },
        { min: 40000, max: 75000, rate: 0.05525 },
        { min: 75000, max: 500000, rate: 0.0637 },
        { min: 500000, max: 1000000, rate: 0.0897 },
        { min: 1000000, max: Infinity, rate: 0.1075 }
    ],
    married: [
        { min: 0, max: 20000, rate: 0.014 },
        { min: 20000, max: 50000, rate: 0.0175 },
        { min: 50000, max: 70000, rate: 0.0245 },
        { min: 70000, max: 80000, rate: 0.035 },
        { min: 80000, max: 150000, rate: 0.05525 },
        { min: 150000, max: 500000, rate: 0.0637 },
        { min: 500000, max: 1000000, rate: 0.0897 },
        { min: 1000000, max: Infinity, rate: 0.1075 }
    ]
};

// ============================================
// New York State Tax Brackets (stable across years)
// ============================================
const nyBrackets = {
    single: [
        { min: 0, max: 8500, rate: 0.04 },
        { min: 8500, max: 11700, rate: 0.045 },
        { min: 11700, max: 13900, rate: 0.0525 },
        { min: 13900, max: 80650, rate: 0.0550 },
        { min: 80650, max: 215400, rate: 0.06 },
        { min: 215400, max: 1077550, rate: 0.0685 },
        { min: 1077550, max: 5000000, rate: 0.0965 },
        { min: 5000000, max: 25000000, rate: 0.103 },
        { min: 25000000, max: Infinity, rate: 0.109 }
    ],
    married: [
        { min: 0, max: 17150, rate: 0.04 },
        { min: 17150, max: 23600, rate: 0.045 },
        { min: 23600, max: 27900, rate: 0.0525 },
        { min: 27900, max: 161550, rate: 0.0550 },
        { min: 161550, max: 323200, rate: 0.06 },
        { min: 323200, max: 2155350, rate: 0.0685 },
        { min: 2155350, max: 5000000, rate: 0.0965 },
        { min: 5000000, max: 25000000, rate: 0.103 },
        { min: 25000000, max: Infinity, rate: 0.109 }
    ]
};

// ============================================
// NYC Tax Brackets (stable across years)
// ============================================
const nycBrackets = {
    single: [
        { min: 0, max: 12000, rate: 0.03078 },
        { min: 12000, max: 25000, rate: 0.03762 },
        { min: 25000, max: 50000, rate: 0.03819 },
        { min: 50000, max: Infinity, rate: 0.03876 }
    ],
    married: [
        { min: 0, max: 21600, rate: 0.03078 },
        { min: 21600, max: 45000, rate: 0.03762 },
        { min: 45000, max: 90000, rate: 0.03819 },
        { min: 90000, max: Infinity, rate: 0.03876 }
    ]
};

// ============================================
// Getter Functions
// ============================================
function getFederalBrackets() {
    return federalBracketsByYear[selectedTaxYear];
}

function getStandardDeductions() {
    return standardDeductionsByYear[selectedTaxYear];
}

function getSETaxConstants() {
    return seTaxConstantsByYear[selectedTaxYear];
}

function getContributionLimits() {
    return contributionLimitsByYear[selectedTaxYear];
}

function getNYStandardDeduction() {
    return nyStandardDeductionByYear[selectedTaxYear];
}

function getFilingStatusKey(filingStatus) {
    if (filingStatus === 'married' || filingStatus === 'marriedSeparate') {
        return 'married';
    }
    return 'single';
}
