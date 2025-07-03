// This script runs BEFORE any React hydration
// It immediately applies theme styles to prevent any flash
(function() {
  try {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Set dark mode class on <html> element immediately
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#111827';
      document.documentElement.style.color = '#f9fafb';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f9fafb';
      document.documentElement.style.color = '#111827';
    }
    
    // Create a style block that will prevent any flash
    const style = document.createElement('style');
    style.textContent = isDark 
      ? `
        html { background-color: #111827 !important; color: #f9fafb !important; }
        body { background-color: #111827 !important; }
        .bg-gray-50 { background-color: #111827 !important; }
        .text-black, .text-gray-900 { color: #f9fafb !important; }
      `
      : `
        html { background-color: #f9fafb !important; color: #111827 !important; }
        body { background-color: #f9fafb !important; }
      `;
    document.head.appendChild(style);
  } catch (e) {
    console.error('Theme initialization error:', e);
  }
})();
