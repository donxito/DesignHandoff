// Theme initialization script
// This script runs before the page loads to prevent flash of wrong theme

(function() {
  // Check if the theme is saved in localStorage
  const savedTheme = localStorage.getItem('theme');
  
  // Check if the user prefers dark mode
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Determine if dark mode should be applied
  const shouldApplyDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  
  // Define CSS variables for both themes
  const darkModeVars = {
    bgPrimary: '#121212',
    bgSecondary: '#1e1e1e',
    bgTertiary: '#2a2a2a',
    textPrimary: '#f8f9fa',
    textSecondary: '#e9ecef',
    border: '#ffffff'
  };

  const lightModeVars = {
    bgPrimary: 'white',
    bgSecondary: '#f8f9fa',
    bgTertiary: '#e9ecef',
    textPrimary: '#212529',
    textSecondary: '#495057',
    border: '#000000'
  };
  
  if (shouldApplyDark) {
    // Apply dark mode class
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.style.colorScheme = 'dark';
    
    // Set CSS variables for dark mode
    document.documentElement.style.setProperty('--bg-primary', darkModeVars.bgPrimary);
    document.documentElement.style.setProperty('--bg-secondary', darkModeVars.bgSecondary);
    document.documentElement.style.setProperty('--bg-tertiary', darkModeVars.bgTertiary);
    document.documentElement.style.setProperty('--text-primary', darkModeVars.textPrimary);
    document.documentElement.style.setProperty('--text-secondary', darkModeVars.textSecondary);
    document.documentElement.style.setProperty('--border-color', darkModeVars.border);
    
    // Apply enhanced dark mode styles inline for immediate effect
    const style = document.createElement('style');
    style.textContent = `
      /* Base elements */
      html { background-color: var(--bg-primary) !important; }
      body { 
        background-color: var(--bg-primary) !important; 
        color: var(--text-primary) !important; 
      }
      
      /* Background colors */
      .bg-white { background-color: var(--bg-tertiary) !important; }
      [class*="bg-[#f5f5f5]"] { background-color: var(--bg-primary) !important; }
      [class*="bg-neutral-100"] { background-color: var(--bg-primary) !important; }
      [class*="bg-neutral-200"] { background-color: var(--bg-primary) !important; }
      [class*="bg-neutral-900"] { background-color: var(--bg-primary) !important; }
      [class*="dark:bg-"] { background-color: var(--bg-primary) !important; }
      
      /* Text colors */
      .text-black { color: var(--text-primary) !important; }
      [class*="text-neutral-800"] { color: var(--text-primary) !important; }
      [class*="text-neutral-900"] { color: var(--text-primary) !important; }
      .text-adaptive { color: var(--text-primary) !important; }
      
      /* Border colors */
      .border-black { border-color: var(--border-color) !important; }
      [class*="border-neutral-900"] { border-color: var(--border-color) !important; }
      .border-adaptive { border-color: var(--border-color) !important; }
      
      /* Shadows */
      .shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] { 
        box-shadow: 3px 3px 0px 0px rgba(248,249,250,0.7) !important; 
      }
      [class*="shadow-[8px_8px_0px_0px_rgba(0,0,0,1)"] { 
        box-shadow: 8px 8px 0px 0px rgba(248,249,250,0.7) !important; 
      }
      
      /* Form elements */
      input, select, textarea { 
        background-color: var(--bg-tertiary) !important; 
        color: var(--text-primary) !important; 
        border-color: var(--border-color) !important; 
      }
      
      /* Cards and UI elements */
      .card, [class*="Card"] { 
        background-color: var(--bg-secondary) !important;
        color: var(--text-primary) !important;
      }
      
      /* SVG icons */
      svg[fill="white"] { fill: var(--text-primary) !important; }
      svg[fill="black"] { fill: var(--text-primary) !important; }
    `;
    document.head.appendChild(style);
  } else {
    // Apply light mode class
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.style.colorScheme = 'light';
    
    // Set CSS variables for light mode
    document.documentElement.style.setProperty('--bg-primary', lightModeVars.bgPrimary);
    document.documentElement.style.setProperty('--bg-secondary', lightModeVars.bgSecondary);
    document.documentElement.style.setProperty('--bg-tertiary', lightModeVars.bgTertiary);
    document.documentElement.style.setProperty('--text-primary', lightModeVars.textPrimary);
    document.documentElement.style.setProperty('--text-secondary', lightModeVars.textSecondary);
    document.documentElement.style.setProperty('--border-color', lightModeVars.border);
    
    // Apply light mode styles inline for immediate effect
    const style = document.createElement('style');
    style.textContent = `
      /* Base elements */
      html { background-color: var(--bg-primary) !important; }
      body { 
        background-color: var(--bg-primary) !important; 
        color: var(--text-primary) !important; 
      }
      
      /* Override any dark mode classes that might be in the HTML */
      [class*="dark:bg-"] { background-color: transparent !important; }
      [class*="dark:text-"] { color: inherit !important; }
      [class*="dark:border-"] { border-color: inherit !important; }
      
      /* Ensure white text is not used in light mode */
      .text-white { color: var(--text-primary) !important; }
      .text-adaptive { color: var(--text-primary) !important; }
      
      /* Cards and UI elements */
      .card, [class*="Card"] { 
        background-color: var(--bg-primary) !important;
        color: var(--text-primary) !important;
      }
      
      /* SVG icons */
      svg[fill="white"] { fill: var(--text-primary) !important; }
    `;
    document.head.appendChild(style);
  }
})();
