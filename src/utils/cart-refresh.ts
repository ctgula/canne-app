/**
 * Utility to refresh cart data when product structure changes
 */

export const clearCartData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('canne-cart');
    window.location.reload();
  }
};

export const refreshCartWithNewData = () => {
  if (typeof window !== 'undefined') {
    // Clear old cart data
    localStorage.removeItem('canne-cart');
    
    // Show notification
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ec4899, #8b5cf6);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
      ">
        🔄 Cart refreshed with updated product data!
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
    
    // Reload page to refresh cart
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};
