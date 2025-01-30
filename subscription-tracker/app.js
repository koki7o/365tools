class SubscriptionTracker {
    constructor() {
        this.subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];
        this.modal = document.getElementById('subscriptionModal');
        this.form = document.getElementById('subscriptionForm');
        this.addBtn = document.getElementById('addSubscriptionBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.subscriptionsList = document.getElementById('subscriptionsList');
        
        this.initializeEventListeners();
        this.updateUI();
    }

    initializeEventListeners() {
        this.addBtn.addEventListener('click', () => this.openModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal() {
        this.modal.classList.add('active');
        // Set default date to today
        document.getElementById('billingDate').valueAsDate = new Date();
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.form.reset();
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const subscription = {
            id: Date.now(),
            name: document.getElementById('serviceName').value,
            price: parseFloat(document.getElementById('price').value),
            billingDate: document.getElementById('billingDate').value,
            category: document.getElementById('category').value,
            createdAt: new Date().toISOString()
        };

        this.subscriptions.push(subscription);
        this.saveToLocalStorage();
        this.updateUI();
        this.closeModal();
    }

    deleteSubscription(id) {
        this.subscriptions = this.subscriptions.filter(sub => sub.id !== id);
        this.saveToLocalStorage();
        this.updateUI();
    }

    saveToLocalStorage() {
        localStorage.setItem('subscriptions', JSON.stringify(this.subscriptions));
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    getNextPayment() {
        if (this.subscriptions.length === 0) return '-';
        
        const today = new Date();
        const upcoming = this.subscriptions
            .map(sub => {
                const date = new Date(sub.billingDate);
                // If this month's date has passed, get next month's date
                while (date < today) {
                    date.setMonth(date.getMonth() + 1);
                }
                return {
                    name: sub.name,
                    date: date
                };
            })
            .sort((a, b) => a.date - b.date);

        if (upcoming.length === 0) return '-';
        
        const next = upcoming[0];
        return `${next.name} - ${this.formatDate(next.date)}`;
    }

    calculateMonthlyTotal() {
        return this.subscriptions.reduce((total, sub) => total + sub.price, 0);
    }

    updateUI() {
        // Update stats
        document.getElementById('monthlyTotal').textContent = this.formatCurrency(this.calculateMonthlyTotal());
        document.getElementById('activeCount').textContent = this.subscriptions.length;
        document.getElementById('nextPayment').textContent = this.getNextPayment();

        // Update subscription cards
        this.subscriptionsList.innerHTML = this.subscriptions
            .sort((a, b) => new Date(a.billingDate) - new Date(b.billingDate))
            .map(sub => `
                <div class="subscription-card">
                    <div class="subscription-header">
                        <h3 class="service-name">${sub.name}</h3>
                        <p class="subscription-price">${this.formatCurrency(sub.price)}/mo</p>
                    </div>
                    <div class="subscription-details">
                        <div class="detail-item">
                            <span>Category</span>
                            <span>${sub.category.charAt(0).toUpperCase() + sub.category.slice(1)}</span>
                        </div>
                        <div class="detail-item">
                            <span>Next Billing</span>
                            <span>${this.formatDate(sub.billingDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span>Added On</span>
                            <span>${this.formatDate(sub.createdAt)}</span>
                        </div>
                    </div>
                    <button onclick="app.deleteSubscription(${sub.id})" 
                            style="background: none; border: none; color: var(--danger); 
                                   cursor: pointer; margin-top: 1rem; font-size: 0.875rem;">
                        Delete Subscription
                    </button>
                </div>
            `).join('');
    }
}

// Initialize the app
const app = new SubscriptionTracker();
