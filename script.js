// Animated Counter Function
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Intersection Observer for triggering animations when elements come into view
function setupIntersectionObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Handle counter animations
                if (entry.target.classList.contains('counter-number') ||
                    entry.target.classList.contains('total-number')) {
                    const target = parseInt(entry.target.dataset.target);
                    if (target && !entry.target.dataset.animated) {
                        entry.target.dataset.animated = 'true';
                        animateCounter(entry.target, target);
                    }
                }

                // Handle fade-in animations
                if (entry.target.classList.contains('fade-in')) {
                    entry.target.classList.add('visible');
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all counter elements
    document.querySelectorAll('[data-target]').forEach(el => {
        observer.observe(el);
    });

    // Observe fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Calculator functionality
function setupCalculator() {
    const incomeInput = document.getElementById('income');
    const percentageSlider = document.getElementById('percentage');
    const percentageDisplay = document.getElementById('percentage-display');
    const donationAmountEl = document.getElementById('donation-amount');
    const livesSavedEl = document.getElementById('lives-saved');
    const netsFundedEl = document.getElementById('nets-funded');
    const tenYearLivesEl = document.getElementById('ten-year-lives');

    // Format number with commas
    function formatCurrency(num) {
        return '$' + num.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    // Parse currency string to number (removes $ and commas)
    function parseCurrency(str) {
        return parseFloat(str.replace(/[$,]/g, '')) || 0;
    }

    // Format input value with commas as user types
    function formatIncomeInput() {
        const cursorPos = incomeInput.selectionStart;
        const oldLength = incomeInput.value.length;
        const rawValue = incomeInput.value.replace(/[^0-9]/g, '');
        const numValue = parseInt(rawValue) || 0;

        if (numValue > 0) {
            incomeInput.value = numValue.toLocaleString();
        } else {
            incomeInput.value = '';
        }

        // Adjust cursor position for added/removed commas
        const newLength = incomeInput.value.length;
        const diff = newLength - oldLength;
        incomeInput.setSelectionRange(cursorPos + diff, cursorPos + diff);
    }

    function updateCalculations() {
        const income = parseCurrency(incomeInput.value);
        const percentage = parseFloat(percentageSlider.value) / 100;
        const donationAmount = income * percentage;

        // Update percentage display
        percentageDisplay.textContent = percentageSlider.value + '%';

        // Cost to save a life through GiveWell top charities: ~$2,500
        const costPerLife = 2500;
        const livesSaved = donationAmount / costPerLife;

        // Malaria nets cost ~$3 each
        const netCost = 3;
        const nets = Math.floor(donationAmount / netCost);

        // Update display
        donationAmountEl.textContent = formatCurrency(donationAmount);

        if (livesSaved >= 1) {
            livesSavedEl.textContent = '~' + livesSaved.toFixed(1) + ' lives/year';
        } else if (livesSaved >= 0.1) {
            livesSavedEl.textContent = '~' + livesSaved.toFixed(1) + ' lives/year';
        } else {
            livesSavedEl.textContent = '~' + livesSaved.toFixed(2) + ' lives/year';
        }

        netsFundedEl.textContent = nets.toLocaleString() + ' nets';

        // 10 year calculation
        const tenYearLives = livesSaved * 10;
        if (tenYearLives >= 1) {
            tenYearLivesEl.textContent = Math.round(tenYearLives) + ' lives';
        } else {
            tenYearLivesEl.textContent = '~1 life';
        }
    }

    if (incomeInput && percentageSlider) {
        // Format income input on typing
        incomeInput.addEventListener('input', () => {
            formatIncomeInput();
            updateCalculations();
        });

        // Update on slider change
        percentageSlider.addEventListener('input', updateCalculations);

        // Initial calculation
        updateCalculations();
    }
}

// Live death counter - updates every second to show ongoing crisis
function setupLiveCounter() {
    const liveCounter = document.querySelector('.live-counter');
    if (!liveCounter) return;

    // Base deaths per hour from the data
    const deathsPerHour = 88;

    // Starting counts from the data (as of when page loads)
    // We'll simulate the counter incrementing based on time
    let displayedDeaths = deathsPerHour;

    // Update every few seconds to show variation
    setInterval(() => {
        // Add some realistic variation (±5)
        const variation = Math.floor(Math.random() * 11) - 5;
        displayedDeaths = Math.max(80, Math.min(96, deathsPerHour + variation));
        liveCounter.textContent = displayedDeaths;
    }, 3000);
}

// Smooth scroll for navigation
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add fade-in classes to sections for animation
function setupAnimations() {
    const sections = [
        '.info-card',
        '.counter-card',
        '.impact-item',
        '.timeline-item',
        '.givewell-response',
        '.call-out-box',
        '.calculator-box'
    ];

    sections.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.classList.add('fade-in');
            el.style.transitionDelay = `${index * 0.1}s`;
        });
    });
}

// Share button functionality
function setupShareButtons() {
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);

    const twitterBtn = document.querySelector('.share-btn.twitter');
    const facebookBtn = document.querySelector('.share-btn.facebook');
    const emailBtn = document.querySelector('.share-btn.email');

    if (twitterBtn) {
        const twitterText = encodeURIComponent(
            "This holiday season, I'm giving 1% of my income to save lives through @GiveWell. Join me?"
        );
        twitterBtn.href = `https://twitter.com/intent/tweet?text=${twitterText}&url=${pageUrl}`;
    }

    if (facebookBtn) {
        facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
    }

    if (emailBtn) {
        const subject = encodeURIComponent("Save Lives This Holiday Season");
        const body = encodeURIComponent(
            `Hi,\n\nI wanted to share something important with you. With recent cuts to foreign aid, millions of lives are at stake. But we can help.\n\nCheck out this page to learn more: ${window.location.href}\n\nI'm pledging 1% of my income to high-impact charities through GiveWell. Would you consider joining me?\n\nBest wishes`
        );
        emailBtn.href = `mailto:?subject=${subject}&body=${body}`;
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupAnimations();
    setupIntersectionObserver();
    setupCalculator();
    setupLiveCounter();
    setupSmoothScroll();
    setupShareButtons();

    // Add loaded class to body for any CSS animations dependent on JS
    document.body.classList.add('loaded');
});

// Handle visibility change - pause/resume live counter
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, could pause animations here
    } else {
        // Page is visible again
    }
});
