/**
 * Tax Return Estimator - App Initialization & Event Handlers
 */

// ============================================
// Event Listeners
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // State change - show/hide NYC option
    document.getElementById('state').addEventListener('change', function() {
        const nycGroup = document.getElementById('nycGroup');
        const cityWithheldGroup = document.getElementById('cityWithheldGroup');
        
        if (this.value === 'NY') {
            nycGroup.style.display = 'block';
            cityWithheldGroup.style.display = 'block';
        } else {
            nycGroup.style.display = 'none';
            cityWithheldGroup.style.display = 'none';
            document.getElementById('nycResident').checked = false;
        }
    });

    // NYC resident checkbox
    document.getElementById('nycResident').addEventListener('change', function() {
        const cityWithheldGroup = document.getElementById('cityWithheldGroup');
        cityWithheldGroup.style.display = this.checked ? 'block' : 'none';
    });

    // Deduction type toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const itemizedFields = document.getElementById('itemizedFields');
            if (this.dataset.type === 'itemized') {
                itemizedFields.classList.remove('hidden');
            } else {
                itemizedFields.classList.add('hidden');
            }
        });
    });

    // Format number inputs on blur
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('blur', function() {
            formatInput(this);
        });
    });

    // Pre-tax deduction live total
    document.querySelectorAll('.pretax-input').forEach(input => {
        input.addEventListener('input', updatePreTaxTotal);
    });

    // Itemized deduction live total
    document.querySelectorAll('.itemized-input').forEach(input => {
        input.addEventListener('input', updateItemizedTotals);
        input.addEventListener('blur', function() {
            formatInput(this);
            updateItemizedTotals();
        });
    });

    // Update itemized totals when filing status changes
    document.getElementById('filingStatus').addEventListener('change', function() {
        updateItemizedTotals();
    });

    // Calculate on Enter key
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateTax();
        }
    });

    // Tax year toggle
    document.querySelectorAll('.tax-year-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tax-year-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedTaxYear = parseInt(this.dataset.year);
            
            // Recalculate if there's income entered
            const grossIncome = parseNumber(document.getElementById('grossIncome').value);
            const seIncome = parseNumber(document.getElementById('selfEmploymentIncome').value);
            if (grossIncome > 0 || seIncome > 0) {
                calculateTax();
            }
        });
    });

    // Tab functionality for guidance
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(this.dataset.tab + 'Tab').classList.add('active');
        });
    });
});
