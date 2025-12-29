# Tax Return Estimator

A comprehensive tax calculator for New Jersey and New York residents, featuring federal, state, and local (NYC) tax calculations with personalized tax reduction guidance.

![Tax Estimator Screenshot](screenshot.png)

## Features

### Tax Calculations
- **Federal Tax**: 7 progressive brackets (10% - 37%) with accurate 2024-2026 rates
- **State Tax**: New Jersey and New York state tax brackets
- **NYC Tax**: Additional city tax for NYC residents
- **Self-Employment Tax**: Full SE tax calculation (15.3%) with Social Security wage base limits
- **Tax Year Toggle**: Switch between 2024, 2025, and 2026 tax years

### Income Support
- W-2 wages (salary)
- 1099 / Self-employment income
- Business expenses (deductible)
- Other income (interest, dividends, capital gains)

### Pre-Tax Deductions
- 401(k) / 403(b) contributions
- Traditional IRA contributions
- HSA contributions
- Health insurance premiums
- FSA contributions
- Other pre-tax deductions

### Deductions
- Standard deduction (auto-calculated by filing status)
- Itemized deductions:
  - State & Local Taxes (SALT) - capped at $10,000
  - Mortgage interest
  - Charitable contributions
  - Medical expenses (above 7.5% AGI threshold)

### Tax Reduction Guidance
Personalized recommendations organized in 4 categories:

1. **Immediate Actions**: HSA maximization, FSA suggestions
2. **Retirement Strategies**: 401(k), IRA, SEP-IRA, Solo 401(k), Roth strategies
3. **Deduction Opportunities**: Itemized review, charitable strategies, state-specific deductions
4. **Tax Planning**: Tax-loss harvesting, income timing, withholding adjustments

Each recommendation includes:
- Estimated annual savings
- Contribution limits for the selected tax year
- Calculation explanation showing the math

## Tax Years Supported

| Year | Federal Brackets | Standard Deduction (Single/MFJ) | SS Wage Base |
|------|------------------|----------------------------------|--------------|
| 2024 | $11,600 - $609,350 | $14,600 / $29,200 | $168,600 |
| 2025 | $11,925 - $626,350 | $15,000 / $30,000 | $176,100 |
| 2026 | $12,400 - $640,600 | $16,100 / $32,200 | $184,500 |

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tax-estimator.git
cd tax-estimator
```

2. Open `index.html` in your browser, or serve with any static file server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Navigate to `http://localhost:8000`

## Project Structure

```
tax-estimator/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── tax-data.js     # Tax brackets, limits, constants
│   ├── calculations.js # Core tax calculation logic
│   ├── guidance.js     # Tax reduction recommendations
│   └── app.js          # UI event handlers
└── README.md
```

## Usage

1. Select your **filing status** (Single, Married Filing Jointly, etc.)
2. Choose your **state** (New Jersey or New York)
3. Check **NYC Resident** if applicable (for NY only)
4. Enter your **income** (W-2 wages, 1099 income, etc.)
5. Enter **pre-tax deductions** (401k, HSA, etc.)
6. Choose **Standard or Itemized** deductions
7. Enter **tax withholdings** from your W-2
8. Click **Calculate Tax Estimate**

## Calculations

### Federal Tax
Uses progressive tax brackets - each portion of income is taxed at its applicable rate.

### Self-Employment Tax
- 15.3% total (12.4% Social Security + 2.9% Medicare)
- Applied to 92.35% of net SE income
- Social Security portion capped at wage base
- Additional 0.9% Medicare tax above $200K (single) / $250K (married)
- 50% of SE tax is deductible from income

### State Tax
- **New Jersey**: Uses AGI directly (no standard deduction)
- **New York**: Applies state standard deduction before calculating

### NYC Tax
Additional 3.078% - 3.876% city tax for NYC residents

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

This calculator provides estimates only and should not be considered tax advice. Actual tax liability may vary based on credits, additional income sources, and other factors. Consult a qualified tax professional for accurate tax guidance.

## License

MIT License - see [LICENSE](LICENSE) file for details.
