class PaymentService {
    static async checkBalance() {
        try {
            const response = await ApiService.request('/payments/balance');
            return response;
        } catch (error) {
            console.error('Error checking balance:', error);
            throw error;
        }
    }

    static async sendPayment(recipientWallet, amount) {
        try {
            const response = await ApiService.request('/payments/send', {
                method: 'POST',
                body: JSON.stringify({ recipientWallet, amount })
            });
            return response;
        } catch (error) {
            console.error('Error sending payment:', error);
            throw error;
        }
    }

    static async getTransactionHistory() {
        try {
            const response = await ApiService.request('/payments/transactions');
            return response;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    }
}