const currentPage = window.location.pathname.split("/").pop() || "home.html";

const navigation = document.createElement("nav");
navigation.className = "quick-nav";
navigation.setAttribute("aria-label", "Navigasi utama");
navigation.innerHTML = `
    <a class="nav-icon" href="home.html" aria-label="Beranda Learning Notebook" title="Beranda">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m3 10 9-7 9 7"></path>
            <path d="M5 9v11h14V9"></path>
            <path d="M9 20v-6h6v6"></path>
        </svg>
    </a>
    <a class="nav-icon" href="data.html" aria-label="Buka catatan" title="Catatan">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2 6h4"></path>
            <path d="M2 10h4"></path>
            <path d="M2 14h4"></path>
            <path d="M2 18h4"></path>
            <rect x="4" y="2" width="18" height="20" rx="2"></rect>
            <path d="M10 8h6"></path>
            <path d="M10 12h6"></path>
            <path d="M10 16h6"></path>
        </svg>
    </a>
`;

const activeLink = navigation.querySelector(`a[href="${currentPage}"]`);
if (activeLink) {
    activeLink.setAttribute("aria-current", "page");
}

document.body.prepend(navigation);
