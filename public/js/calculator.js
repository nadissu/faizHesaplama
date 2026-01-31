/**
 * Kredi Kartı Faiz Hesaplama - Calculator Functions
 * Modern, Premium Design
 */

// TCMB 2026 Tiered Interest Rates
const TCMB_RATES = {
    tier1: { maxDebt: 30000, rate: 3.25 },    // < 30K TL
    tier2: { maxDebt: 180000, rate: 3.75 },   // 30K - 180K TL
    tier3: { maxDebt: Infinity, rate: 4.25 }  // > 180K TL
};

function getTCMBRate(debt) {
    if (debt < TCMB_RATES.tier1.maxDebt) return TCMB_RATES.tier1.rate;
    if (debt <= TCMB_RATES.tier2.maxDebt) return TCMB_RATES.tier2.rate;
    return TCMB_RATES.tier3.rate;
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initTabs();
    initMoneyInputs();
    initBankSelectors();  // NEW: Bank selection feature
    initMinimumCalculator();
    initFixedCalculator();
    initMultipleCardsCalculator();
    initInstallmentCalculator();
    initFAQ();
    initScheduleToggles();
});

// ============================================
// Utility Functions
// ============================================

function formatMoney(value) {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function formatMoneyShort(value) {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function parseMoney(value) {
    if (typeof value === 'number') return value;
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
}

function parseRate(value) {
    if (typeof value === 'number') return value;
    return parseFloat(value.replace(',', '.')) || 0;
}

// ============================================
// Tab Navigation
// ============================================

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.calculator-section');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Update buttons
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            // Update sections
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetTab) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// ============================================
// Money Input Formatting
// ============================================

function initMoneyInputs() {
    const moneyInputs = document.querySelectorAll('.money-input');

    moneyInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^\d]/g, '');
            if (value) {
                value = parseInt(value, 10);
                e.target.value = formatMoneyShort(value);
            }
        });

        input.addEventListener('focus', (e) => {
            const value = parseMoney(e.target.value);
            if (value > 0) {
                e.target.value = value.toString();
            } else {
                e.target.value = '';
            }
        });

        input.addEventListener('blur', (e) => {
            const value = parseMoney(e.target.value);
            if (value > 0) {
                e.target.value = formatMoneyShort(value);
            }
        });
    });
}

// ============================================
// Bank Selection Handler
// ============================================

function initBankSelectors() {
    // Setup for Minimum Payment Calculator
    setupBankSelector('minBank', 'minDebt', 'minRate', 'minRateInfo');

    // Setup for Fixed Payment Calculator
    setupBankSelector('fixedBank', 'fixedDebt', 'fixedRate', 'fixedRateInfo');
}

function setupBankSelector(bankSelectId, debtInputId, rateInputId, rateInfoId) {
    const bankSelect = document.getElementById(bankSelectId);
    const debtInput = document.getElementById(debtInputId);
    const rateInput = document.getElementById(rateInputId);
    const rateInfo = document.getElementById(rateInfoId);

    if (!bankSelect || !debtInput || !rateInput) return;

    // Handle bank selection change
    bankSelect.addEventListener('change', () => {
        updateRateFromBank(bankSelect, debtInput, rateInput, rateInfo);
    });

    // If auto mode, update rate when debt changes
    debtInput.addEventListener('blur', () => {
        if (bankSelect.value === 'auto') {
            updateRateFromBank(bankSelect, debtInput, rateInput, rateInfo);
        }
    });
}

function updateRateFromBank(bankSelect, debtInput, rateInput, rateInfo) {
    const bankValue = bankSelect.value;
    const debt = parseMoney(debtInput.value);

    if (bankValue === '') {
        // Manual entry mode
        rateInput.value = '';
        rateInput.readOnly = false;
        rateInput.classList.remove('auto-filled');
        rateInput.placeholder = 'Banka seçin veya girin';
        if (rateInfo) rateInfo.style.display = 'none';
    } else if (bankValue === 'auto') {
        // TCMB auto rate based on debt
        if (debt > 0) {
            const rate = getTCMBRate(debt);
            rateInput.value = rate.toFixed(2).replace('.', ',');
            rateInput.readOnly = true;
            rateInput.classList.add('auto-filled');

            // Update info text based on tier
            if (rateInfo) {
                let tierText = '';
                if (debt < 30000) {
                    tierText = `Borç < 30K TL → %${rate} uygulandı`;
                } else if (debt <= 180000) {
                    tierText = `30K-180K TL arası → %${rate} uygulandı`;
                } else {
                    tierText = `Borç > 180K TL → %${rate} uygulandı`;
                }
                rateInfo.querySelector('.rate-info-text').textContent = `TCMB 2026: ${tierText}`;
                rateInfo.style.display = 'flex';
            }
        } else {
            rateInput.value = '';
            rateInput.placeholder = 'Önce borç tutarı girin';
            rateInput.readOnly = true;
            rateInput.classList.add('auto-filled');
            if (rateInfo) {
                rateInfo.querySelector('.rate-info-text').textContent = 'TCMB 2026: <30K TL: %3.25 | 30K-180K TL: %3.75 | >180K TL: %4.25';
                rateInfo.style.display = 'flex';
            }
        }
    } else {
        // Specific bank rate
        const rate = parseFloat(bankValue);
        rateInput.value = rate.toFixed(2).replace('.', ',');
        rateInput.readOnly = true;
        rateInput.classList.add('auto-filled');
        if (rateInfo) rateInfo.style.display = 'none';
    }
}

// ============================================
// Schedule Toggle
// ============================================

function initScheduleToggles() {
    const toggles = [
        { btn: 'minToggleSchedule', wrapper: 'minScheduleWrapper' },
        { btn: 'fixedToggleSchedule', wrapper: 'fixedScheduleWrapper' },
        { btn: 'multiToggleSchedule', wrapper: 'multiScheduleWrapper' },
        { btn: 'instToggleSchedule', wrapper: 'instScheduleWrapper' }
    ];

    toggles.forEach(({ btn, wrapper }) => {
        const button = document.getElementById(btn);
        const wrapperEl = document.getElementById(wrapper);

        if (button && wrapperEl) {
            button.addEventListener('click', () => {
                wrapperEl.classList.toggle('show');
                button.textContent = wrapperEl.classList.contains('show') ? 'Gizle' : 'Göster';
            });
        }
    });
}

// ============================================
// 1. Minimum Payment Calculator
// ============================================

function initMinimumCalculator() {
    const form = document.getElementById('minimumForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateMinimumPayment();
    });

    form.addEventListener('reset', () => {
        setTimeout(() => {
            document.getElementById('minimumResults').classList.remove('show');
        }, 10);
    });
}

function calculateMinimumPayment() {
    const debt = parseMoney(document.getElementById('minDebt').value);
    const monthlyRate = parseRate(document.getElementById('minRate').value) / 100;
    const minPercent = parseRate(document.getElementById('minPercent').value) / 100;

    if (debt <= 0 || monthlyRate <= 0 || minPercent <= 0) {
        alert('Lütfen tüm alanları doğru doldurun.');
        return;
    }

    let balance = debt;
    let totalPayment = 0;
    let months = 0;
    const maxMonths = 600; // 50 years max
    const schedule = [];

    while (balance > 1 && months < maxMonths) {
        months++;
        const interest = balance * monthlyRate;
        let payment = Math.max(balance * minPercent, 50); // Min 50 TL

        if (payment > balance + interest) {
            payment = balance + interest;
        }

        const principal = payment - interest;
        balance = balance + interest - payment;

        if (balance < 0) balance = 0;

        totalPayment += payment;

        schedule.push({
            month: months,
            payment: payment,
            interest: interest,
            principal: principal,
            remaining: balance
        });
    }

    const totalInterest = totalPayment - debt;
    const interestRatio = (totalInterest / debt * 100).toFixed(0);

    // Display results
    document.getElementById('minMonths').textContent = months;
    document.getElementById('minTotalInterest').textContent = formatMoney(totalInterest) + ' ₺';
    document.getElementById('minTotalPayment').textContent = formatMoney(totalPayment) + ' ₺';
    document.getElementById('minInterestRatio').textContent = '%' + interestRatio;

    // Build schedule table
    const tbody = document.getElementById('minScheduleBody');
    tbody.innerHTML = schedule.map(row => `
        <tr>
            <td>${row.month}</td>
            <td>${formatMoney(row.payment)} ₺</td>
            <td>${formatMoney(row.interest)} ₺</td>
            <td>${formatMoney(row.principal)} ₺</td>
            <td>${formatMoney(row.remaining)} ₺</td>
        </tr>
    `).join('');

    // Show results
    document.getElementById('minimumResults').classList.add('show');

    // Store for comparison
    window.minimumPaymentData = {
        months: months,
        totalPayment: totalPayment,
        totalInterest: totalInterest
    };
}

// ============================================
// 2. Fixed Payment Calculator
// ============================================

function initFixedCalculator() {
    const form = document.getElementById('fixedForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateFixedPayment();
    });

    form.addEventListener('reset', () => {
        setTimeout(() => {
            document.getElementById('fixedResults').classList.remove('show');
        }, 10);
    });
}

function calculateFixedPayment() {
    const debt = parseMoney(document.getElementById('fixedDebt').value);
    const monthlyRate = parseRate(document.getElementById('fixedRate').value) / 100;
    const fixedPayment = parseMoney(document.getElementById('fixedPayment').value);

    if (debt <= 0 || monthlyRate <= 0 || fixedPayment <= 0) {
        alert('Lütfen tüm alanları doğru doldurun.');
        return;
    }

    // Check if payment is enough
    const minRequired = debt * monthlyRate;
    if (fixedPayment <= minRequired) {
        alert(`Aylık ödeme tutarı en az ${formatMoney(minRequired + 1)} TL olmalıdır. Aksi halde borç asla kapanmaz.`);
        return;
    }

    let balance = debt;
    let totalPayment = 0;
    let months = 0;
    const maxMonths = 600;
    const schedule = [];

    while (balance > 1 && months < maxMonths) {
        months++;
        const interest = balance * monthlyRate;
        let payment = fixedPayment;

        if (payment > balance + interest) {
            payment = balance + interest;
        }

        const principal = payment - interest;
        balance = balance + interest - payment;

        if (balance < 0) balance = 0;

        totalPayment += payment;

        schedule.push({
            month: months,
            payment: payment,
            interest: interest,
            principal: principal,
            remaining: balance
        });
    }

    const totalInterest = totalPayment - debt;

    // Calculate savings compared to minimum payment
    let savings = 0;
    if (window.minimumPaymentData) {
        savings = window.minimumPaymentData.totalInterest - totalInterest;
    }

    // Display results
    document.getElementById('fixedMonths').textContent = months;
    document.getElementById('fixedTotalInterest').textContent = formatMoney(totalInterest) + ' ₺';
    document.getElementById('fixedTotalPayment').textContent = formatMoney(totalPayment) + ' ₺';
    document.getElementById('fixedSavings').textContent = savings > 0 ? formatMoney(savings) + ' ₺' : '-';

    // Build schedule table
    const tbody = document.getElementById('fixedScheduleBody');
    tbody.innerHTML = schedule.map(row => `
        <tr>
            <td>${row.month}</td>
            <td>${formatMoney(row.payment)} ₺</td>
            <td>${formatMoney(row.interest)} ₺</td>
            <td>${formatMoney(row.principal)} ₺</td>
            <td>${formatMoney(row.remaining)} ₺</td>
        </tr>
    `).join('');

    // Show results
    document.getElementById('fixedResults').classList.add('show');
}

// ============================================
// 3. Multiple Cards Calculator
// ============================================

let cardIndex = 1;

function initMultipleCardsCalculator() {
    const addBtn = document.getElementById('addCardBtn');
    const calculateBtn = document.getElementById('calculateMultiple');
    const resetBtn = document.getElementById('resetMultiple');
    const cardsList = document.getElementById('cardsList');

    addBtn.addEventListener('click', addCard);
    calculateBtn.addEventListener('click', calculateMultipleCards);
    resetBtn.addEventListener('click', resetMultipleCards);

    // Handle remove buttons
    cardsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove')) {
            const cardItem = e.target.closest('.card-item');
            if (document.querySelectorAll('.card-item').length > 1) {
                cardItem.remove();
            } else {
                alert('En az bir kart olmalıdır.');
            }
        }
    });
}

function addCard() {
    cardIndex++;
    const cardsList = document.getElementById('cardsList');

    const cardItem = document.createElement('div');
    cardItem.className = 'card-item';
    cardItem.dataset.index = cardIndex;
    cardItem.innerHTML = `
        <div class="form-group">
            <label class="form-label">Kart Adı</label>
            <input type="text" class="form-input card-name" placeholder="Kart ${cardIndex}" value="Kart ${cardIndex}">
        </div>
        <div class="form-group">
            <label class="form-label">Borç Tutarı</label>
            <input type="text" class="form-input money-input card-debt" placeholder="5.000">
            <span class="input-suffix">₺</span>
        </div>
        <div class="form-group">
            <label class="form-label">Aylık Faiz</label>
            <input type="text" class="form-input card-rate" placeholder="4.42">
            <span class="input-suffix">%</span>
        </div>
        <button type="button" class="btn-remove" title="Kartı Sil">✕</button>
    `;

    cardsList.appendChild(cardItem);

    // Re-init money inputs for new card
    const newMoneyInput = cardItem.querySelector('.money-input');
    initSingleMoneyInput(newMoneyInput);
}

function initSingleMoneyInput(input) {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d]/g, '');
        if (value) {
            value = parseInt(value, 10);
            e.target.value = formatMoneyShort(value);
        }
    });

    input.addEventListener('focus', (e) => {
        const value = parseMoney(e.target.value);
        if (value > 0) {
            e.target.value = value.toString();
        } else {
            e.target.value = '';
        }
    });

    input.addEventListener('blur', (e) => {
        const value = parseMoney(e.target.value);
        if (value > 0) {
            e.target.value = formatMoneyShort(value);
        }
    });
}

function calculateMultipleCards() {
    const cardItems = document.querySelectorAll('.card-item');
    const cards = [];

    cardItems.forEach(item => {
        const name = item.querySelector('.card-name').value || 'Kart';
        const debt = parseMoney(item.querySelector('.card-debt').value);
        const rate = parseRate(item.querySelector('.card-rate').value) / 100;

        if (debt > 0) {
            cards.push({ name, debt, rate });
        }
    });

    if (cards.length === 0) {
        alert('Lütfen en az bir kart bilgisi girin.');
        return;
    }

    const totalDebt = cards.reduce((sum, c) => sum + c.debt, 0);
    const weightedRate = cards.reduce((sum, c) => sum + (c.debt * c.rate), 0) / totalDebt;
    const monthlyInterest = cards.reduce((sum, c) => sum + (c.debt * c.rate), 0);

    // Display results
    document.getElementById('multiCardCount').textContent = cards.length;
    document.getElementById('multiTotalDebt').textContent = formatMoney(totalDebt) + ' ₺';
    document.getElementById('multiAvgRate').textContent = '%' + (weightedRate * 100).toFixed(2);
    document.getElementById('multiMonthlyInterest').textContent = formatMoney(monthlyInterest) + ' ₺';

    // Build table
    const tbody = document.getElementById('multiScheduleBody');
    tbody.innerHTML = cards.map(card => {
        const percentage = (card.debt / totalDebt * 100).toFixed(1);
        const monthlyInt = card.debt * card.rate;
        return `
            <tr>
                <td>${card.name}</td>
                <td>${formatMoney(card.debt)} ₺</td>
                <td>%${(card.rate * 100).toFixed(2)}</td>
                <td>${formatMoney(monthlyInt)} ₺</td>
                <td>%${percentage}</td>
            </tr>
        `;
    }).join('');

    // Show results
    document.getElementById('multipleResults').classList.add('show');
}

function resetMultipleCards() {
    const cardsList = document.getElementById('cardsList');
    cardsList.innerHTML = `
        <div class="card-item" data-index="0">
            <div class="form-group">
                <label class="form-label">Kart Adı</label>
                <input type="text" class="form-input card-name" placeholder="Kart 1" value="Kart 1">
            </div>
            <div class="form-group">
                <label class="form-label">Borç Tutarı</label>
                <input type="text" class="form-input money-input card-debt" placeholder="5.000">
                <span class="input-suffix">₺</span>
            </div>
            <div class="form-group">
                <label class="form-label">Aylık Faiz</label>
                <input type="text" class="form-input card-rate" placeholder="4.42">
                <span class="input-suffix">%</span>
            </div>
            <button type="button" class="btn-remove" title="Kartı Sil">✕</button>
        </div>
    `;
    cardIndex = 1;

    // Re-init money inputs
    initMoneyInputs();

    document.getElementById('multipleResults').classList.remove('show');
}

// ============================================
// 4. Installment Calculator
// ============================================

function initInstallmentCalculator() {
    const form = document.getElementById('installmentForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateInstallment();
    });

    form.addEventListener('reset', () => {
        setTimeout(() => {
            document.getElementById('installmentResults').classList.remove('show');
        }, 10);
    });
}

function calculateInstallment() {
    const amount = parseMoney(document.getElementById('instAmount').value);
    const months = parseInt(document.getElementById('instMonths').value, 10);
    const monthlyRate = parseRate(document.getElementById('instRate').value) / 100;

    if (amount <= 0 || months <= 0) {
        alert('Lütfen tüm alanları doğru doldurun.');
        return;
    }

    let monthlyPayment, totalPayment, totalInterest, schedule;

    if (monthlyRate === 0) {
        // No interest
        monthlyPayment = amount / months;
        totalPayment = amount;
        totalInterest = 0;

        schedule = [];
        for (let i = 1; i <= months; i++) {
            schedule.push({
                month: i,
                payment: monthlyPayment,
                interest: 0,
                principal: monthlyPayment,
                remaining: amount - (monthlyPayment * i)
            });
        }
    } else {
        // PMT formula for fixed rate mortgage
        monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);
        totalPayment = monthlyPayment * months;
        totalInterest = totalPayment - amount;

        // Generate schedule
        schedule = [];
        let balance = amount;

        for (let i = 1; i <= months; i++) {
            const interest = balance * monthlyRate;
            const principal = monthlyPayment - interest;
            balance = balance - principal;

            if (balance < 0) balance = 0;

            schedule.push({
                month: i,
                payment: monthlyPayment,
                interest: interest,
                principal: principal,
                remaining: balance
            });
        }
    }

    const annualRate = ((1 + monthlyRate) ** 12 - 1) * 100;

    // Display results
    document.getElementById('instMonthlyPayment').textContent = formatMoney(monthlyPayment) + ' ₺';
    document.getElementById('instTotalInterest').textContent = formatMoney(totalInterest) + ' ₺';
    document.getElementById('instTotalPayment').textContent = formatMoney(totalPayment) + ' ₺';
    document.getElementById('instAnnualRate').textContent = '%' + annualRate.toFixed(2);

    // Build schedule table
    const tbody = document.getElementById('instScheduleBody');
    tbody.innerHTML = schedule.map(row => `
        <tr>
            <td>${row.month}</td>
            <td>${formatMoney(row.payment)} ₺</td>
            <td>${formatMoney(row.interest)} ₺</td>
            <td>${formatMoney(row.principal)} ₺</td>
            <td>${formatMoney(row.remaining)} ₺</td>
        </tr>
    `).join('');

    // Show results
    document.getElementById('installmentResults').classList.add('show');
}

// ============================================
// FAQ Accordion
// ============================================

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(i => i.classList.remove('active'));

            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}
