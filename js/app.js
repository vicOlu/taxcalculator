/**
 * Tax Return Estimator - App Initialization & Event Handlers
 */

// ============================================
// W-2 Guide Toggle
// ============================================

function toggleW2Guide() {
    const content = document.getElementById('w2GuideContent');
    const chevron = document.getElementById('w2GuideChevron');
    
    content.classList.toggle('expanded');
    chevron.classList.toggle('rotated');
}

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

// ============================================
// PDF Export - Form 1040 Summary
// ============================================

// Store last calculation results for export
let lastCalculationResults = null;

/**
 * Export tax calculation to PDF with Form 1040 line mappings
 */
function exportToPDF() {
    if (!lastCalculationResults) {
        alert('Please calculate your taxes first.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = lastCalculationResults;
    
    // Colors
    const darkBlue = [30, 41, 59];
    const mediumBlue = [59, 130, 246];
    const green = [16, 185, 129];
    const gray = [100, 116, 139];
    
    let y = 20;
    
    // Header
    doc.setFillColor(...darkBlue);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Tax Return Summary', 105, 18, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tax Year ${data.taxYear} • ${data.state} • ${data.filingStatus}`, 105, 28, { align: 'center' });
    
    y = 45;
    
    // Disclaimer
    doc.setFillColor(255, 247, 237);
    doc.rect(15, y, 180, 12, 'F');
    doc.setTextColor(180, 83, 9);
    doc.setFontSize(9);
    doc.text('⚠ This is an estimate only. Consult a tax professional and use official IRS forms for filing.', 105, y + 7, { align: 'center' });
    
    y += 20;
    
    // Section: Form 1040 Line References
    doc.setTextColor(...darkBlue);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Form 1040 Line References', 15, y);
    y += 8;
    
    doc.setDrawColor(...mediumBlue);
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);
    y += 8;
    
    // Income section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...mediumBlue);
    doc.text('INCOME', 15, y);
    y += 7;
    
    const incomeLines = [
        { line: '1a', desc: 'Total wages, salaries, tips (W-2 Box 1)', value: data.w2Income || 0 },
        { line: '1z', desc: 'Total additional income from Schedule 1', value: data.schedule1Income || 0 },
        { line: '8', desc: 'Other income from Schedule 1 (1099/SE)', value: data.selfEmploymentIncome || 0 },
        { line: '9', desc: 'Total income (add lines 1z, 2b, 3b, 4b, 5b, 6b, 7, 8)', value: data.grossIncome || 0 },
        { line: '10', desc: 'Adjustments to income from Schedule 1', value: data.adjustments || 0 },
        { line: '11', desc: 'Adjusted gross income (AGI)', value: data.agi || 0 },
    ];
    
    drawLineItems(doc, incomeLines, 15, y, gray);
    y += incomeLines.length * 7 + 5;
    
    // Deductions section
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...mediumBlue);
    doc.text('DEDUCTIONS', 15, y);
    y += 7;
    
    const deductionLines = [
        { line: '12', desc: `Standard deduction or itemized (Schedule A)`, value: data.deduction || 0 },
        { line: '13', desc: 'Qualified business income deduction', value: data.qbiDeduction || 0 },
        { line: '14', desc: 'Add lines 12 and 13', value: (data.deduction || 0) + (data.qbiDeduction || 0) },
        { line: '15', desc: 'Taxable income (Line 11 minus Line 14)', value: data.taxableIncome || 0 },
    ];
    
    drawLineItems(doc, deductionLines, 15, y, gray);
    y += deductionLines.length * 7 + 5;
    
    // Tax section
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...mediumBlue);
    doc.text('TAX AND CREDITS', 15, y);
    y += 7;
    
    const taxLines = [
        { line: '16', desc: 'Tax (from Tax Table or Tax Computation Worksheet)', value: data.federalTax || 0 },
        { line: '23', desc: 'Other taxes (Schedule 2) - includes SE tax', value: data.selfEmploymentTax || 0 },
        { line: '24', desc: 'Total tax (add lines 22 and 23)', value: (data.federalTax || 0) + (data.selfEmploymentTax || 0) },
    ];
    
    drawLineItems(doc, taxLines, 15, y, gray);
    y += taxLines.length * 7 + 5;
    
    // Payments section
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...mediumBlue);
    doc.text('PAYMENTS', 15, y);
    y += 7;
    
    const paymentLines = [
        { line: '25a', desc: 'Federal income tax withheld (W-2 Box 2)', value: data.federalWithheld || 0 },
        { line: '33', desc: 'Total payments', value: data.federalWithheld || 0 },
    ];
    
    drawLineItems(doc, paymentLines, 15, y, gray);
    y += paymentLines.length * 7 + 5;
    
    // Result section
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...mediumBlue);
    doc.text('REFUND OR AMOUNT OWED', 15, y);
    y += 7;
    
    const federalBalance = (data.federalWithheld || 0) - (data.federalTax || 0) - (data.selfEmploymentTax || 0);
    
    if (federalBalance >= 0) {
        const resultLines = [
            { line: '34', desc: 'Overpayment (Line 33 minus Line 24)', value: federalBalance, isRefund: true },
            { line: '35a', desc: 'Amount to be refunded to you', value: federalBalance, isRefund: true },
        ];
        drawLineItems(doc, resultLines, 15, y, gray);
        y += resultLines.length * 7;
    } else {
        const resultLines = [
            { line: '37', desc: 'Amount you owe (Line 24 minus Line 33)', value: Math.abs(federalBalance), isOwed: true },
        ];
        drawLineItems(doc, resultLines, 15, y, gray);
        y += resultLines.length * 7;
    }
    
    // Add new page for state taxes
    doc.addPage();
    y = 20;
    
    // State Tax Header
    doc.setFillColor(...darkBlue);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.state} State Tax Summary`, 105, 16, { align: 'center' });
    
    y = 35;
    
    // State tax details
    doc.setTextColor(...darkBlue);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('STATE TAX CALCULATION', 15, y);
    y += 8;
    
    doc.setDrawColor(...mediumBlue);
    doc.line(15, y, 195, y);
    y += 8;
    
    const stateLines = [
        { desc: 'State taxable income', value: data.stateTaxableIncome || data.taxableIncome || 0 },
        { desc: `${data.state} state income tax`, value: data.stateTax || 0 },
        { desc: 'State tax withheld (W-2 Box 17)', value: data.stateWithheld || 0 },
        { desc: 'State balance (refund if positive)', value: (data.stateWithheld || 0) - (data.stateTax || 0), isBalance: true },
    ];
    
    drawStateLineItems(doc, stateLines, 15, y, gray, green);
    y += stateLines.length * 8 + 10;
    
    // NYC Tax if applicable
    if (data.nycTax && data.nycTax > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkBlue);
        doc.text('NYC TAX CALCULATION', 15, y);
        y += 8;
        
        doc.setDrawColor(...mediumBlue);
        doc.line(15, y, 195, y);
        y += 8;
        
        const nycLines = [
            { desc: 'NYC taxable income', value: data.taxableIncome || 0 },
            { desc: 'NYC income tax', value: data.nycTax || 0 },
            { desc: 'NYC tax withheld (W-2 Box 19)', value: data.nycWithheld || 0 },
            { desc: 'NYC balance (refund if positive)', value: (data.nycWithheld || 0) - (data.nycTax || 0), isBalance: true },
        ];
        
        drawStateLineItems(doc, nycLines, 15, y, gray, green);
        y += nycLines.length * 8 + 10;
    }
    
    // Summary box
    y += 5;
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(15, y, 180, 45, 3, 3, 'F');
    
    doc.setTextColor(...darkBlue);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL SUMMARY', 105, y + 10, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);
    
    const totalRefundOwed = data.totalBalance || 0;
    const effectiveRate = data.effectiveRate || 0;
    
    doc.text(`Federal: ${formatCurrencyPDF((data.federalWithheld || 0) - (data.federalTax || 0) - (data.selfEmploymentTax || 0))}`, 30, y + 22);
    doc.text(`State: ${formatCurrencyPDF((data.stateWithheld || 0) - (data.stateTax || 0))}`, 90, y + 22);
    if (data.nycTax > 0) {
        doc.text(`NYC: ${formatCurrencyPDF((data.nycWithheld || 0) - (data.nycTax || 0))}`, 145, y + 22);
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    if (totalRefundOwed >= 0) {
        doc.setTextColor(...green);
        doc.text(`Total Refund: ${formatCurrencyPDF(totalRefundOwed)}`, 105, y + 36, { align: 'center' });
    } else {
        doc.setTextColor(239, 68, 68);
        doc.text(`Total Owed: ${formatCurrencyPDF(Math.abs(totalRefundOwed))}`, 105, y + 36, { align: 'center' });
    }
    
    // Footer
    doc.setTextColor(...gray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString()} • Effective Tax Rate: ${effectiveRate.toFixed(1)}%`, 105, 285, { align: 'center' });
    
    // Save
    doc.save(`Tax_Summary_${data.taxYear}_${data.state}.pdf`);
}

/**
 * Draw line items for 1040 reference
 */
function drawLineItems(doc, items, x, y, grayColor) {
    doc.setFontSize(9);
    
    items.forEach((item, i) => {
        const yPos = y + (i * 7);
        
        // Line number
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text(`Line ${item.line}`, x, yPos);
        
        // Description
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayColor);
        doc.text(item.desc, x + 20, yPos);
        
        // Value
        doc.setFont('helvetica', 'bold');
        if (item.isRefund) {
            doc.setTextColor(16, 185, 129);
        } else if (item.isOwed) {
            doc.setTextColor(239, 68, 68);
        } else {
            doc.setTextColor(30, 41, 59);
        }
        doc.text(formatCurrencyPDF(item.value), 195, yPos, { align: 'right' });
    });
}

/**
 * Draw state line items
 */
function drawStateLineItems(doc, items, x, y, grayColor, greenColor) {
    doc.setFontSize(10);
    
    items.forEach((item, i) => {
        const yPos = y + (i * 8);
        
        // Description
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...grayColor);
        doc.text(item.desc, x, yPos);
        
        // Value
        doc.setFont('helvetica', 'bold');
        if (item.isBalance) {
            if (item.value >= 0) {
                doc.setTextColor(...greenColor);
            } else {
                doc.setTextColor(239, 68, 68);
            }
        } else {
            doc.setTextColor(30, 41, 59);
        }
        doc.text(formatCurrencyPDF(item.value), 195, yPos, { align: 'right' });
    });
}

/**
 * Format currency for PDF
 */
function formatCurrencyPDF(value) {
    const absValue = Math.abs(value);
    const formatted = '$' + absValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value < 0 ? '-' + formatted : formatted;
}
