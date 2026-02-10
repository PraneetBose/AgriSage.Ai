(function () {
    const savedTheme = localStorage.getItem('theme');
    const applyTheme = () => {
        if (savedTheme === 'light') {
            document.body.classList.remove('dark-mode');
        } else {
            document.body.classList.add('dark-mode');
        }
    };
    if (document.body) {
        applyTheme();
    } else {
        document.addEventListener('DOMContentLoaded', applyTheme);
    }
})();