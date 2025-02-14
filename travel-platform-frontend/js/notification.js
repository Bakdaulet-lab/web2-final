class NotificationService {
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <p>${message}</p>
            <button class="close-btn">&times;</button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // Close button functionality
        notification.querySelector('.close-btn').addEventListener('click', () => {
            notification.remove();
        });
    }

    static success(message) {
        this.showNotification(message, 'success');
    }

    static error(message) {
        this.showNotification(message, 'error');
    }

    static warning(message) {
        this.showNotification(message, 'warning');
    }
}