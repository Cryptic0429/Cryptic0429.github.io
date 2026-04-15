document.addEventListener('DOMContentLoaded', function () {
    var body = document.body;
    var header = document.querySelector('[data-site-header]');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var menuPanel = document.querySelector('[data-menu-panel]');
    var yearNodes = document.querySelectorAll('[data-year]');
    var navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
    var revealNodes = Array.from(document.querySelectorAll('[data-reveal]'));

    function updateHeader() {
        if (!header) return;
        header.classList.toggle('is-scrolled', window.scrollY > 12);
    }

    function setMenu(open) {
        if (!menuToggle || !menuPanel) return;
        menuToggle.setAttribute('aria-expanded', String(open));
        menuPanel.hidden = !open;
        body.classList.toggle('menu-open', open);
    }

    function activateNav(id) {
        if (!id) return;
        navLinks.forEach(function (link) {
            var target = (link.getAttribute('href') || '').replace(/^.*#/, '');
            link.classList.toggle('is-active', target === id);
        });
    }

    function activatePath() {
        var currentPath = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(function (link) {
            var href = link.getAttribute('href') || '';
            if (href.startsWith('#') || href.startsWith('mailto:')) return;
            var targetPath = href.split('/').pop();
            link.classList.toggle('is-active', targetPath === currentPath);
        });
    }

    yearNodes.forEach(function (node) {
        node.textContent = String(new Date().getFullYear());
    });

    activatePath();
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuToggle && menuPanel) {
        setMenu(false);

        menuToggle.addEventListener('click', function () {
            var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
            setMenu(!expanded);
        });

        menuPanel.addEventListener('click', function (event) {
            var target = event.target;
            if (target instanceof HTMLElement && target.matches('[data-nav-link]')) {
                setMenu(false);
            }
        });

        window.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                setMenu(false);
            }
        });
    }

    if (navLinks.length > 0 && 'IntersectionObserver' in window) {
        var observedIds = Array.from(new Set(navLinks
            .map(function (link) {
                var href = link.getAttribute('href') || '';
                return href.startsWith('#') ? href.slice(1) : '';
            })
            .filter(Boolean)));

        var sections = observedIds
            .map(function (id) { return document.getElementById(id); })
            .filter(Boolean);

        if (sections.length > 0) {
            var sectionObserver = new IntersectionObserver(function (entries) {
                var visible = entries
                    .filter(function (entry) { return entry.isIntersecting; })
                    .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });

                if (visible[0]) {
                    activateNav(visible[0].target.id);
                }
            }, {
                threshold: [0.2, 0.45, 0.7],
                rootMargin: '-18% 0px -45% 0px'
            });

            sections.forEach(function (section) {
                sectionObserver.observe(section);
            });
        }
    }

    if (revealNodes.length > 0) {
        if ('IntersectionObserver' in window) {
            var revealObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            }, {
                threshold: 0.15,
                rootMargin: '0px 0px -10% 0px'
            });

            revealNodes.forEach(function (node) {
                node.classList.add('reveal');
                revealObserver.observe(node);
            });
        } else {
            revealNodes.forEach(function (node) {
                node.classList.add('is-visible');
            });
        }
    }
});
