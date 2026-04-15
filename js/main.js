/* ============================================
   LOOP — WILD INTERACTIONS ENGINE
   ============================================ */
(function () {
    'use strict';

    // ─── LOADING SCREEN ──────────────────────
    const loader = document.getElementById('loader');
    const loaderProgress = document.getElementById('loaderProgress');
    const loaderPercent = document.getElementById('loaderPercent');
    let loadProgress = 0;

    function animateLoader() {
        const increment = Math.random() * 30 + 20;
        loadProgress = Math.min(loadProgress + increment, 100);
        loaderProgress.style.width = loadProgress + '%';
        loaderPercent.textContent = Math.floor(loadProgress);

        if (loadProgress < 100) {
            setTimeout(animateLoader, 60 + Math.random() * 80);
        } else {
            setTimeout(() => {
                loader.classList.add('done');
                document.body.style.overflow = '';
                initAfterLoad();
            }, 200);
        }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('load', () => {
        if (sessionStorage.getItem('loopLoaded')) {
            loader.classList.add('done');
            document.body.style.overflow = '';
            initAfterLoad();
        } else {
            sessionStorage.setItem('loopLoaded', '1');
            setTimeout(animateLoader, 100);
        }
    });

    // ─── CUSTOM CURSOR ───────────────────────
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        }, { passive: true });

        function animateFollower() {
            followerX += (mouseX - followerX) * 0.12;
            followerY += (mouseY - followerY) * 0.12;
            follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        // Hover states
        const hoverTargets = 'a, button, .pill, .service-item, .team-card, .social-btn, input, textarea';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) {
                follower.classList.add('hover');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverTargets)) {
                follower.classList.remove('hover');
            }
        });
    }

    // ─── HERO CANVAS — PARTICLES ─────────────
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const brandColors = [
        'rgba(238,169,201,',
        'rgba(116,186,225,',
        'rgba(157,218,208,',
        'rgba(153,141,192,',
    ];

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resizeCanvas(); initParticles(); }, 200);
    });

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.radius = Math.random() * 2.5 + 0.5;
            this.color = brandColors[Math.floor(Math.random() * brandColors.length)];
            this.alpha = Math.random() * 0.5 + 0.1;
            this.alphaDir = Math.random() * 0.005 + 0.002;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha += this.alphaDir;
            if (this.alpha > 0.6 || this.alpha < 0.05) this.alphaDir *= -1;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();
        }
    }

    function initParticles() {
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 50);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawLines() {
        const len = particles.length;
        const threshold = 140;
        const thresholdSq = threshold * threshold;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < len; i++) {
            const pi = particles[i];
            for (let j = i + 1; j < len; j++) {
                const pj = particles[j];
                const dx = pi.x - pj.x;
                const dy = pi.y - pj.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < thresholdSq) {
                    const a = (1 - Math.sqrt(distSq) / threshold) * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(pi.x, pi.y);
                    ctx.lineTo(pj.x, pj.y);
                    ctx.strokeStyle = 'rgba(242,242,241,' + a + ')';
                    ctx.stroke();
                }
            }
        }
    }

    let particlesRunning = true;
    let particleRAF = 0;

    // Pause particles when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            particlesRunning = false;
        } else {
            particlesRunning = true;
            if (!particleRAF) particleRAF = requestAnimationFrame(animateParticles);
        }
    });

    function animateParticles() {
        if (!particlesRunning) { particleRAF = 0; return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawLines();
        particleRAF = requestAnimationFrame(animateParticles);
    }

    // Skip heavy animations if user prefers reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        initParticles();
        animateParticles();
    }
    } // end if canvas

    // ─── AFTER LOAD INIT ─────────────────────
    function initAfterLoad() {
        initScrollReveal();
        initNavbar();
        initRadialMenu();
        initFlyingIcons();
        initSmoothScroll();
        initCounters();
        initMagnetic();
        initFormHandler();
        initPortfolioFilter();
        initClientFilter();
        initLangToggle();
        initScrollTop();
        initScrollProgress();
    }

    // ─── SCROLL REVEAL ───────────────────────
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal-up');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        reveals.forEach(el => observer.observe(el));
    }

    // ─── NAVBAR ──────────────────────────────
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            if (y > 80) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            lastScroll = y;
        }, { passive: true });
    }

    // ─── RADIAL MENU ───────────────────────
    function initRadialMenu() {
        const wrap = document.getElementById('radialWrap');
        const trigger = document.getElementById('radialTrigger');
        const backdrop = document.getElementById('radialBackdrop');
        if (!wrap || !trigger) return;

        let previousFocus = null;

        function openMenu() {
            previousFocus = document.activeElement;
            wrap.classList.add('active');
            trigger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            wrap.classList.remove('active');
            trigger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            if (previousFocus) previousFocus.focus();
        }

        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-label', 'Navigation menu');

        trigger.addEventListener('click', () => {
            if (wrap.classList.contains('active')) closeMenu();
            else openMenu();
        });

        if (backdrop) {
            backdrop.addEventListener('click', closeMenu);
        }

        wrap.querySelectorAll('.radial-item').forEach(item => {
            item.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && wrap.classList.contains('active')) {
                closeMenu();
            }
        });

        // Focus trap within menu
        wrap.addEventListener('keydown', (e) => {
            if (!wrap.classList.contains('active') || e.key !== 'Tab') return;
            const focusable = wrap.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    }

    // ─── FLYING ICONS PARALLAX ──────────────
    function initFlyingIcons() {
        const container = document.getElementById('flyingIcons');
        if (!container) return;
        const icons = container.querySelectorAll('.fly-icon');
        let flyRAF = 0;
        let flyMX = 0, flyMY = 0;

        document.addEventListener('mousemove', (e) => {
            flyMX = e.clientX;
            flyMY = e.clientY;
            if (!flyRAF) {
                flyRAF = requestAnimationFrame(() => {
                    const cx = window.innerWidth / 2;
                    const cy = window.innerHeight / 2;
                    const dx = (flyMX - cx) / cx;
                    const dy = (flyMY - cy) / cy;
                    icons.forEach((icon, i) => {
                        const depth = 0.5 + (i % 3) * 0.3;
                        const tx = dx * 20 * depth;
                        const ty = dy * 12 * depth;
                        icon.style.transform = `translate(${tx}px, ${ty}px)`;
                    });
                    flyRAF = 0;
                });
            }
        }, { passive: true });
    }

    // ─── SMOOTH SCROLL ──────────────────────
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const top = target.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });

        // Page transitions for internal links
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || link.getAttribute('target') === '_blank') return;
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.body.classList.add('page-leaving');
                setTimeout(() => { window.location.href = href; }, 200);
            });
        });
    }

    // ─── COUNTER ─────────────────────────────
    function initCounters() {
        const counters = document.querySelectorAll('.stat-num[data-target]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
    }

    function animateCounter(el) {
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const val = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
            el.textContent = val;
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        }
        requestAnimationFrame(tick);
    }

    // ─── MAGNETIC BUTTONS ────────────────────
    function initMagnetic() {
        if (window.innerWidth <= 768) return;
        const magnetics = document.querySelectorAll('[data-magnetic]');

        magnetics.forEach(el => {
            let magRAF = 0;
            el.addEventListener('mousemove', (e) => {
                if (magRAF) return;
                magRAF = requestAnimationFrame(() => {
                    const rect = el.getBoundingClientRect();
                    const dx = e.clientX - (rect.left + rect.width / 2);
                    const dy = e.clientY - (rect.top + rect.height / 2);
                    el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
                    magRAF = 0;
                });
            }, { passive: true });
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0,0)';
                el.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
                setTimeout(() => { el.style.transition = ''; }, 500);
            });
        });
    }

    // ─── FORM ────────────────────────────────
    function initFormHandler() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Prevent double-submit
            if (form.dataset.submitting === 'true') return;

            const btn = form.querySelector('.btn-submit .btn-text');
            const orig = btn.textContent;
            const emailInput = form.querySelector('#email');
            const messageInput = form.querySelector('#message');
            const nameInput = form.querySelector('#name');

            // Validation
            if (nameInput && nameInput.value.trim().length < 2) {
                shakeField(nameInput);
                return;
            }
            if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
                shakeField(emailInput);
                return;
            }
            if (messageInput && messageInput.value.trim().length < 10) {
                shakeField(messageInput);
                return;
            }

            form.dataset.submitting = 'true';
            btn.textContent = 'SENDING...';
            btn.parentElement.style.opacity = '0.7';
            btn.parentElement.style.pointerEvents = 'none';

            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            }).then(r => {
                if (r.ok) {
                    btn.textContent = 'SENT! ✓';
                    btn.parentElement.style.background = '#9ddad0';
                    btn.parentElement.style.opacity = '1';
                    form.reset();
                    resetBtn(btn, orig, form, 3000);
                } else {
                    btn.textContent = 'ERROR ✕';
                    btn.parentElement.style.background = '#e06060';
                    btn.parentElement.style.opacity = '1';
                    resetBtn(btn, orig, form, 3000);
                }
            }).catch(() => {
                btn.textContent = 'ERROR ✕';
                btn.parentElement.style.background = '#e06060';
                btn.parentElement.style.opacity = '1';
                resetBtn(btn, orig, form, 3000);
            });
        });

        function shakeField(el) {
            el.style.borderColor = '#e06060';
            el.classList.add('shake');
            el.focus();
            setTimeout(() => { el.classList.remove('shake'); el.style.borderColor = ''; }, 600);
        }

        function resetBtn(btn, orig, form, ms) {
            setTimeout(() => {
                btn.textContent = orig;
                btn.parentElement.style.background = '';
                btn.parentElement.style.pointerEvents = '';
                form.dataset.submitting = 'false';
            }, ms);
        }
    }

    // ─── SCROLL TO TOP ────────────────────────
    function initScrollTop() {
        const btn = document.getElementById('scrollTop');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 600) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, { passive: true });
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ─── SCROLL PROGRESS BAR ────────────────
    function initScrollProgress() {
        const bar = document.getElementById('scrollProgress');
        if (!bar) return;
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = progress + '%';
        }, { passive: true });
    }

    // ─── PORTFOLIO FILTER ────────────────────
    function initPortfolioFilter() {
        const buttons = document.querySelectorAll('.portfolio-filters .filter-btn');
        const cards = document.querySelectorAll('.portfolio-card');
        if (!buttons.length || !cards.length) return;

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;

                cards.forEach(card => {
                    const cat = card.dataset.category;
                    if (filter === 'all' || cat === filter) {
                        card.style.display = '';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        requestAnimationFrame(() => {
                            card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        });
                    } else {
                        card.style.transition = 'all 0.3s ease';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        setTimeout(() => { card.style.display = 'none'; }, 300);
                    }
                });
            });
        });
    }

    function initClientFilter() {
        const buttons = document.querySelectorAll('.client-filters .filter-btn');
        const cards = document.querySelectorAll('.ig-card');
        if (!buttons.length || !cards.length) return;

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;

                cards.forEach(card => {
                    const cat = card.dataset.category;
                    if (filter === 'all' || cat === filter) {
                        card.style.display = '';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        requestAnimationFrame(() => {
                            card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        });
                    } else {
                        card.style.transition = 'all 0.3s ease';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        setTimeout(() => { card.style.display = 'none'; }, 300);
                    }
                });
            });
        });
    }

    // ─── LANGUAGE TOGGLE (SITE-WIDE) ─────────────────────
    function initLangToggle() {
        var toggle = document.getElementById('langToggle');
        if (!toggle) return;

        var path = window.location.pathname.toLowerCase();
        var page = 'index';
        if (path.indexOf('portfolio') !== -1) page = 'portfolio';
        else if (path.indexOf('clients') !== -1) page = 'clients';
        else if (path.indexOf('solutions') !== -1) page = 'solutions';
        else if (path.indexOf('blog') !== -1) page = 'blog';

        var navCta = { en: 'LET\u2019S GO', ar: '\u0647\u064a\u0627 \u0646\u0628\u062f\u0623' };
        var footerCopy = {
            en: '\u00a9 2026 LOOP MARKETING SOLUTIONS \u2014 ALL RIGHTS RESERVED',
            ar: '\u00a9 2026 LOOP \u0644\u0644\u062d\u0644\u0648\u0644 \u0627\u0644\u062a\u0633\u0648\u064a\u0642\u064a\u0629 \u2014 \u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629'
        };
        var navLabels = {
            en: ['HOME','WORK','CLIENTS','SOLUTIONS','SERVICES','CONTACT'],
            ar: ['\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629','\u0623\u0639\u0645\u0627\u0644\u0646\u0627','\u0639\u0645\u0644\u0627\u0624\u0646\u0627','\u0627\u0644\u062d\u0644\u0648\u0644','\u0627\u0644\u062e\u062f\u0645\u0627\u062a','\u062a\u0648\u0627\u0635\u0644']
        };

        var pages = {
            index: {
                en: {
                    heroTag:'SOCIAL MEDIA MARKETING',
                    heroTitle:[['WE','DON\u2019T'],['FOLLOW','TRENDS'],['WE','CREATE','THEM.']],
                    heroDesc:'Loop for Marketing Solutions \u2014 where creativity meets strategy to amplify your brand\u2019s presence.',
                    heroBtn:'EXPLORE', scroll:'SCROLL',
                    stats:['CLIENT\nSATISFACTION','SUCCESSFUL\nACTIVATIONS','REACHED\nIMPRESSIONS','TARGETED\nRESULTS'],
                    aboutLabel:'( ABOUT US )',
                    aboutHeadingHTML:'WE BUILD<br><span class="holo-word">EMPIRES</span>,<br>NOT JUST<br>BRANDS.',
                    aboutP1:'Loop for Marketing Solutions was founded to break the mold. We\u2019re not your average agency \u2014 we\u2019re a full-service creative powerhouse that turns businesses into cultural phenomena.',
                    aboutP2:'We assemble dedicated staff, advanced tools, and relentless creativity to provide customized strategies that don\u2019t just hit targets \u2014 they shatter them.',
                    pills:['STRATEGY','CREATIVITY','TECHNOLOGY','GROWTH','RESULTS','INNOVATION'],
                    servicesLabel:'( WHAT WE DO )',
                    servicesHeadingHTML:'OUR <span class="holo-word">ARSENAL</span>',
                    serviceTitles:['DIGITAL MARKETING','DIRECT MARKETING','EVENT SERVICES','CREATIVE SOLUTIONS'],
                    serviceDescs:[
                        'Social Media Management \u2022 Advertising \u2022 Analytics & Reporting \u2022 Influencer Engagement \u2022 Event Promotion & Coverage',
                        'In-store Promotions \u2022 Mall Activations \u2022 Road Shows \u2022 Printings \u2022 Giveaways \u2022 Brand Activations',
                        'Online Registration \u2022 Event Websites \u2022 Theme Conceptualization \u2022 Stage Designs \u2022 3D Mockups \u2022 Branding',
                        'Concept Creation \u2022 Brand Identity \u2022 Web & App Design \u2022 Video Production \u2022 Print Design \u2022 Campaigns'
                    ],
                    ctaHTML:'YOUR BRAND +<br>OUR <span class="holo-word">MADNESS</span> =<br>MAGIC \u2726',
                    teamLabel:'( THE CREW )',
                    teamHeadingHTML:'MEET THE <span class="holo-word">MANIACS</span>',
                    teamRoles:['CEO','DESIGN','ACCOUNTS','ACCOUNTS','DESIGN','VIDEO'],
                    teamJobTitles:['Chief Executive Officer','Designer','Account Manager','Account Manager','Designer','Video Editor'],
                    contactLabel:'( LET\u2019S TALK )',
                    contactHeadingHTML:'READY TO<br>GO <span class="holo-word">VIRAL</span>?',
                    formPlaceholders:['YOUR NAME','YOUR EMAIL','SUBJECT','YOUR MESSAGE'],
                    formBtn:'SEND IT \ud83d\ude80',
                    marquee:['SOCIAL MEDIA','DIGITAL MARKETING','BRAND IDENTITY','CREATIVE SOLUTIONS','VIDEO PRODUCTION','EVENT SERVICES','DIRECT MARKETING'],
                    marqueeBig:['THINK BIG','ACT BOLD','GROW FAST','REPEAT']
                },
                ar: {
                    heroTag:'\u062a\u0633\u0648\u064a\u0642 \u0639\u0628\u0631 \u0627\u0644\u0633\u0648\u0634\u0627\u0644 \u0645\u064a\u062f\u064a\u0627',
                    heroTitle:[['\u0644\u0627','\u0646\u062a\u0628\u0639'],['\u0628\u0644','\u0646\u0642\u0648\u062f'],['\u0648\u0646\u0635\u0646\u0639','\u0643\u0644','\u0627\u0644\u062a\u0631\u0646\u062f\u0627\u062a.']],
                    heroDesc:'LOOP \u0644\u0644\u062d\u0644\u0648\u0644 \u0627\u0644\u062a\u0633\u0648\u064a\u0642\u064a\u0629 \u2014 \u062d\u064a\u062b \u064a\u0644\u062a\u0642\u064a \u0627\u0644\u0625\u0628\u062f\u0627\u0639 \u0628\u0627\u0644\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0644\u062a\u0639\u0632\u064a\u0632 \u062d\u0636\u0648\u0631 \u0639\u0644\u0627\u0645\u062a\u0643 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629.',
                    heroBtn:'\u0627\u0633\u062a\u0643\u0634\u0641', scroll:'\u0645\u0631\u0631 \u0644\u0644\u0623\u0633\u0641\u0644',
                    stats:['\u0631\u0636\u0627\n\u0627\u0644\u0639\u0645\u0644\u0627\u0621','\u062a\u0641\u0639\u064a\u0644\u0627\u062a\n\u0646\u0627\u062c\u062d\u0629','\u0627\u0646\u0637\u0628\u0627\u0639\u0627\u062a\n\u0645\u062d\u0642\u0642\u0629','\u0646\u062a\u0627\u0626\u062c\n\u0645\u0633\u062a\u0647\u062f\u0641\u0629'],
                    aboutLabel:'( \u0645\u0646 \u0646\u062d\u0646 )',
                    aboutHeadingHTML:'\u0646\u0628\u0646\u064a<br><span class="holo-word">\u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064a\u0627\u062a</span>,<br>\u0644\u064a\u0633 \u0641\u0642\u0637<br>\u0639\u0644\u0627\u0645\u0627\u062a \u062a\u062c\u0627\u0631\u064a\u0629.',
                    aboutP1:'LOOP \u0644\u0644\u062d\u0644\u0648\u0644 \u0627\u0644\u062a\u0633\u0648\u064a\u0642\u064a\u0629 \u062a\u0623\u0633\u0633\u062a \u0644\u0643\u0633\u0631 \u0627\u0644\u0642\u0627\u0644\u0628. \u0644\u0633\u0646\u0627 \u0648\u0643\u0627\u0644\u0629 \u0639\u0627\u062f\u064a\u0629 \u2014 \u0646\u062d\u0646 \u0642\u0648\u0629 \u0625\u0628\u062f\u0627\u0639\u064a\u0629 \u0645\u062a\u0643\u0627\u0645\u0644\u0629 \u062a\u062d\u0648\u0644 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0625\u0644\u0649 \u0638\u0648\u0627\u0647\u0631 \u062b\u0642\u0627\u0641\u064a\u0629.',
                    aboutP2:'\u0646\u062c\u0645\u0639 \u0641\u0631\u064a\u0642\u0627\u064b \u0645\u062a\u062e\u0635\u0635\u0627\u064b\u060c \u0623\u062f\u0648\u0627\u062a \u0645\u062a\u0642\u062f\u0645\u0629\u060c \u0648\u0625\u0628\u062f\u0627\u0639\u0627\u064b \u0644\u0627 \u064a\u062a\u0648\u0642\u0641 \u0644\u062a\u0642\u062f\u064a\u0645 \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0627\u062a \u0645\u062e\u0635\u0635\u0629 \u0644\u0627 \u062a\u0635\u064a\u0628 \u0627\u0644\u0623\u0647\u062f\u0627\u0641 \u0641\u062d\u0633\u0628 \u2014 \u0628\u0644 \u062a\u062d\u0637\u0645\u0647\u0627.',
                    pills:['\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629','\u0625\u0628\u062f\u0627\u0639','\u062a\u0643\u0646\u0648\u0644\u0648\u062c\u064a\u0627','\u0646\u0645\u0648','\u0646\u062a\u0627\u0626\u062c','\u0627\u0628\u062a\u0643\u0627\u0631'],
                    servicesLabel:'( \u0645\u0627\u0630\u0627 \u0646\u0641\u0639\u0644 )',
                    servicesHeadingHTML:'<span class="holo-word">\u062a\u0631\u0633\u0627\u0646\u062a\u0646\u0627</span>',
                    serviceTitles:['\u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0627\u0644\u0631\u0642\u0645\u064a','\u0627\u0644\u062a\u0633\u0648\u064a\u0642 \u0627\u0644\u0645\u0628\u0627\u0634\u0631','\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a','\u0627\u0644\u062d\u0644\u0648\u0644 \u0627\u0644\u0625\u0628\u062f\u0627\u0639\u064a\u0629'],
                    serviceDescs:[
                        '\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0633\u0648\u0634\u0627\u0644 \u0645\u064a\u062f\u064a\u0627 \u2022 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u2022 \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a \u0648\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631 \u2022 \u0627\u0644\u0645\u0624\u062b\u0631\u064a\u0646 \u2022 \u062a\u0631\u0648\u064a\u062c \u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a',
                        '\u0639\u0631\u0648\u0636 \u062f\u0627\u062e\u0644 \u0627\u0644\u0645\u062a\u0627\u062c\u0631 \u2022 \u062a\u0641\u0639\u064a\u0644\u0627\u062a \u0627\u0644\u0645\u0648\u0644\u0627\u062a \u2022 \u0631\u0648\u062f \u0634\u0648\u0632 \u2022 \u0645\u0637\u0628\u0648\u0639\u0627\u062a \u2022 \u0647\u062f\u0627\u064a\u0627 \u2022 \u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0639\u0644\u0627\u0645\u0629',
                        '\u062a\u0633\u062c\u064a\u0644 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u2022 \u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0641\u0639\u0627\u0644\u064a\u0627\u062a \u2022 \u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0645\u0641\u0627\u0647\u064a\u0645 \u2022 \u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0645\u0633\u0627\u0631\u062d \u2022 \u0645\u0627\u0643\u064a\u062a\u0627\u062a 3D \u2022 \u0628\u0631\u0627\u0646\u062f\u0646\u062c',
                        '\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0641\u0627\u0647\u064a\u0645 \u2022 \u0627\u0644\u0647\u0648\u064a\u0629 \u0627\u0644\u0628\u0635\u0631\u064a\u0629 \u2022 \u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0648\u064a\u0628 \u0648\u0627\u0644\u062a\u0637\u0628\u064a\u0642\u0627\u062a \u2022 \u0625\u0646\u062a\u0627\u062c \u0627\u0644\u0641\u064a\u062f\u064a\u0648 \u2022 \u062a\u0635\u0645\u064a\u0645 \u0627\u0644\u0645\u0637\u0628\u0648\u0639\u0627\u062a \u2022 \u0627\u0644\u062d\u0645\u0644\u0627\u062a'
                    ],
                    ctaHTML:'\u0639\u0644\u0627\u0645\u062a\u0643 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 +<br><span class="holo-word">\u062c\u0646\u0648\u0646\u0646\u0627</span> =<br>\u0633\u062d\u0631 \u2726',
                    teamLabel:'( \u0627\u0644\u0641\u0631\u064a\u0642 )',
                    teamHeadingHTML:'\u062a\u0639\u0631\u0641 \u0639\u0644\u0649 <span class="holo-word">\u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0646</span>',
                    teamRoles:['\u0631\u0626\u064a\u0633 \u062a\u0646\u0641\u064a\u0630\u064a','\u062a\u0635\u0645\u064a\u0645','\u0625\u062f\u0627\u0631\u0629 \u062d\u0633\u0627\u0628\u0627\u062a','\u0625\u062f\u0627\u0631\u0629 \u062d\u0633\u0627\u0628\u0627\u062a','\u062a\u0635\u0645\u064a\u0645','\u0641\u064a\u062f\u064a\u0648'],
                    teamJobTitles:['\u0627\u0644\u0631\u0626\u064a\u0633 \u0627\u0644\u062a\u0646\u0641\u064a\u0630\u064a','\u0645\u0635\u0645\u0645','\u0645\u062f\u064a\u0631 \u0627\u0644\u062d\u0633\u0627\u0628\u0627\u062a','\u0645\u062f\u064a\u0631 \u062d\u0633\u0627\u0628\u0627\u062a','\u0645\u0635\u0645\u0645','\u0645\u062d\u0631\u0631 \u0641\u064a\u062f\u064a\u0648'],
                    contactLabel:'( \u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627 )',
                    contactHeadingHTML:'\u062c\u0627\u0647\u0632 \u062a\u0635\u064a\u0631<br><span class="holo-word">\u0641\u0627\u064a\u0631\u0644</span>\u061f',
                    formPlaceholders:['\u0627\u0633\u0645\u0643','\u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a','\u0627\u0644\u0645\u0648\u0636\u0648\u0639','\u0631\u0633\u0627\u0644\u062a\u0643'],
                    formBtn:'\u0623\u0631\u0633\u0644 \ud83d\ude80',
                    marquee:['\u0633\u0648\u0634\u0627\u0644 \u0645\u064a\u062f\u064a\u0627','\u062a\u0633\u0648\u064a\u0642 \u0631\u0642\u0645\u064a','\u0647\u0648\u064a\u0629 \u0628\u0635\u0631\u064a\u0629','\u062d\u0644\u0648\u0644 \u0625\u0628\u062f\u0627\u0639\u064a\u0629','\u0625\u0646\u062a\u0627\u062c \u0641\u064a\u062f\u064a\u0648','\u062e\u062f\u0645\u0627\u062a \u0641\u0639\u0627\u0644\u064a\u0627\u062a','\u062a\u0633\u0648\u064a\u0642 \u0645\u0628\u0627\u0634\u0631'],
                    marqueeBig:['\u0641\u0643\u0651\u0631 \u0628\u0643\u0628\u0631','\u062a\u0635\u0631\u0651\u0641 \u0628\u062c\u0631\u0623\u0629','\u0627\u0646\u0645\u0648 \u0628\u0633\u0631\u0639\u0629','\u0643\u0631\u0651\u0631']
                }
            },
            portfolio: {
                en: {
                    heroTag:'PORTFOLIO',
                    heroTitle:[['OUR','WORK'],['SPEAKS','LOUD.']],
                    heroDesc:'From viral campaigns to on-ground activations \u2014 every project is crafted with strategy, creativity, and a dash of madness.',
                    filters:['ALL','SOCIAL MEDIA','ACTIVATIONS','BRANDING','EVENTS','VIDEO'],
                    ctaHTML:'HAVE A PROJECT <span class="holo-word">IN MIND? \u2726</span>',
                    ctaBtn:'LET\u2019S TALK'
                },
                ar: {
                    heroTag:'\u0623\u0639\u0645\u0627\u0644\u0646\u0627',
                    heroTitle:[['\u0623\u0639\u0645\u0627\u0644\u0646\u0627','\u062a\u062a\u0643\u0644\u0645'],['\u0628\u0635\u0648\u062a','\u0639\u0627\u0644\u064d.']],
                    heroDesc:'\u0645\u0646 \u0627\u0644\u062d\u0645\u0644\u0627\u062a \u0627\u0644\u0641\u0627\u064a\u0631\u0644 \u0625\u0644\u0649 \u0627\u0644\u062a\u0641\u0639\u064a\u0644\u0627\u062a \u0627\u0644\u0645\u064a\u062f\u0627\u0646\u064a\u0629 \u2014 \u0643\u0644 \u0645\u0634\u0631\u0648\u0639 \u0645\u0635\u0646\u0648\u0639 \u0628\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0648\u0625\u0628\u062f\u0627\u0639 \u0648\u0644\u0645\u0633\u0629 \u062c\u0646\u0648\u0646.',
                    filters:['\u0627\u0644\u0643\u0644','\u0633\u0648\u0634\u0627\u0644 \u0645\u064a\u062f\u064a\u0627','\u062a\u0641\u0639\u064a\u0644\u0627\u062a','\u0628\u0631\u0627\u0646\u062f\u0646\u062c','\u0641\u0639\u0627\u0644\u064a\u0627\u062a','\u0641\u064a\u062f\u064a\u0648'],
                    ctaHTML:'\u0639\u0646\u062f\u0643 \u0645\u0634\u0631\u0648\u0639 <span class="holo-word">\u0628\u0628\u0627\u0644\u0643\u061f \u2726</span>',
                    ctaBtn:'\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627'
                }
            },
            clients: {
                en: {
                    heroTag:'CLIENTS',
                    heroTitle:[['ACCOUNTS','WE'],['MANAGE','DAILY.']],
                    heroDesc:'Real brands. Real growth. Explore the Instagram pages we manage across Jordan.',
                    clientFilters:{all:'ALL',services:'SERVICES',realestate:'REAL ESTATE',clothing:'FASHION',education:'EDUCATION',food:'FOOD',appliances:'APPLIANCES',health:'HEALTH',travel:'TRAVEL'},
                    categories:{services:'SERVICES',realestate:'REAL ESTATE',clothing:'FASHION',education:'EDUCATION',food:'FOOD',appliances:'APPLIANCES',health:'HEALTH',travel:'TRAVEL'},
                    managed:'MANAGED BY LOOP',
                    ctaHTML:'LET\u2019S GROW <span class="holo-word">TOGETHER \u2726</span>',
                    ctaBtn:'LET\u2019S TALK'
                },
                ar: {
                    heroTag:'\u0639\u0645\u0644\u0627\u0624\u0646\u0627',
                    heroTitle:[['\u0627\u0644\u062d\u0633\u0627\u0628\u0627\u062a','\u0627\u0644\u062a\u064a'],['\u0646\u064f\u062f\u064a\u0631\u0647\u0627','\u064a\u0648\u0645\u064a\u0627\u064b.']],
                    heroDesc:'\u062d\u0633\u0627\u0628\u0627\u062a \u062d\u0642\u064a\u0642\u064a\u0629. \u0646\u0645\u0648 \u062d\u0642\u064a\u0642\u064a. \u0627\u0633\u062a\u0639\u0631\u0636 \u0635\u0641\u062d\u0627\u062a \u0627\u0644\u0627\u0646\u0633\u062a\u063a\u0631\u0627\u0645 \u0627\u0644\u062a\u064a \u0646\u062f\u064a\u0631\u0647\u0627 \u0641\u064a \u0627\u0644\u0623\u0631\u062f\u0646.',
                    clientFilters:{all:'\u0627\u0644\u0643\u0644',services:'\u062e\u062f\u0645\u0627\u062a',realestate:'\u0639\u0642\u0627\u0631\u0627\u062a',clothing:'\u0645\u0644\u0627\u0628\u0633 \u0648\u0623\u062d\u0630\u064a\u0629',education:'\u062a\u0639\u0644\u064a\u0645',food:'\u0637\u0639\u0627\u0645',appliances:'\u0623\u062c\u0647\u0632\u0629 \u0645\u0646\u0632\u0644\u064a\u0629',health:'\u0635\u062d\u0629',travel:'\u0633\u064a\u0627\u062d\u0629 \u0648\u0633\u0641\u0631'},
                    categories:{services:'\u062e\u062f\u0645\u0627\u062a',realestate:'\u0639\u0642\u0627\u0631\u0627\u062a',clothing:'\u0645\u0644\u0627\u0628\u0633 \u0648\u0623\u062d\u0630\u064a\u0629',education:'\u062a\u0639\u0644\u064a\u0645',food:'\u0637\u0639\u0627\u0645',appliances:'\u0623\u062c\u0647\u0632\u0629 \u0645\u0646\u0632\u0644\u064a\u0629',health:'\u0635\u062d\u0629',travel:'\u0633\u064a\u0627\u062d\u0629 \u0648\u0633\u0641\u0631'},
                    managed:'\u062a\u064f\u062f\u0627\u0631 \u0628\u0648\u0627\u0633\u0637\u0629 LOOP',
                    ctaHTML:'\u0628\u062f\u0643 \u0646\u064f\u062f\u064a\u0631 <span class="holo-word">\u0628\u0631\u0627\u0646\u062f\u0643\u061f \u2726</span>',
                    ctaBtn:'\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627'
                }
            },
            solutions: {
                en: {
                    heroTag:'DIGITAL SOLUTIONS',
                    heroTitle:[['WE','BUILD'],['DIGITAL','FUTURES.']],
                    heroDesc:'Websites, mobile apps, and custom software \u2014 engineered to scale your business and dominate the digital space.',
                    cardTitles:['WEB DEVELOPMENT','MOBILE APPS','CUSTOM SOFTWARE','SOCIAL MEDIA MARKETING'],
                    cardDescs:[
                        'Custom websites, landing pages, e-commerce platforms, and web applications built with modern technologies and stunning design.',
                        'Native and cross-platform mobile applications for iOS and Android that deliver seamless user experiences and drive engagement.',
                        'Tailored software solutions to automate processes, manage data, and streamline operations for businesses of all sizes.',
                        'Full-service social media management, advertising, and content creation to grow your brand across all platforms.'
                    ],
                    cardFeatures:[
                        ['Corporate Websites','E-Commerce Stores','Landing Pages','Web Applications','CMS Integration','SEO Optimized'],
                        ['iOS Development','Android Development','Cross-Platform (Flutter)','UI/UX Design','App Store Publishing','Push Notifications'],
                        ['CRM Systems','ERP Solutions','Dashboard & Analytics','API Development','Cloud Hosting','Maintenance & Support'],
                        ['Content Strategy & Calendars','Social Media Management','Paid Ads (Meta, TikTok, Google)','Influencer Marketing','Analytics & Reporting','Community Management']
                    ],
                    processLabel:'( HOW WE WORK )',processHeading:'THE PROCESS',
                    processTitles:['DISCOVERY','STRATEGY & DESIGN','DEVELOPMENT','LAUNCH & SUPPORT'],
                    processDescs:[
                        'We dive deep into your business, goals, audience, and competitors to build a solid foundation for your project.',
                        'Wireframes, prototypes, and UI/UX design crafted for maximum impact and conversion.',
                        'Clean, scalable code. Modern frameworks. Responsive design. Tested on every device and browser.',
                        'Deployment, performance monitoring, and ongoing maintenance to keep everything running at peak.'
                    ],
                    whyLabel:'( WHY LOOP )',whyHeading:'NOT JUST CODE',
                    whyTitles:['MARKETING + TECH','INSANE DESIGN','FAST DELIVERY','FULL SUPPORT'],
                    whyDescs:[
                        'We don\u2019t just build \u2014 we build with marketing DNA. Every feature is designed to convert and grow.',
                        'Pixel-perfect, award-worthy interfaces that make competitors jealous and users obsessed.',
                        'Agile process, clear milestones, no BS delays. We ship fast without cutting corners.',
                        'Post-launch maintenance, updates, hosting, and scaling. We\u2019re with you for the long run.'
                    ],
                    ctaHTML:'LET\u2019S BUILD SOMETHING <span class="holo-word">INSANE \u2726</span>',
                    ctaBtn:'START YOUR PROJECT'
                },
                ar: {
                    heroTag:'\u0627\u0644\u062d\u0644\u0648\u0644 \u0627\u0644\u0631\u0642\u0645\u064a\u0629',
                    heroTitle:[['\u0646\u062d\u0646','\u0646\u0628\u0646\u064a'],['\u0645\u0633\u062a\u0642\u0628\u0644\u0627\u064b','\u0631\u0642\u0645\u064a\u0627\u064b.']],
                    heroDesc:'\u0645\u0648\u0627\u0642\u0639 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629\u060c \u062a\u0637\u0628\u064a\u0642\u0627\u062a \u062c\u0648\u0627\u0644\u060c \u0648\u0628\u0631\u0645\u062c\u064a\u0627\u062a \u0645\u062e\u0635\u0635\u0629 \u2014 \u0645\u0635\u0645\u0645\u0629 \u0644\u062a\u0648\u0633\u064a\u0639 \u0623\u0639\u0645\u0627\u0644\u0643 \u0648\u0627\u0644\u0633\u064a\u0637\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u0641\u0636\u0627\u0621 \u0627\u0644\u0631\u0642\u0645\u064a.',
                    cardTitles:['\u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0645\u0648\u0627\u0642\u0639','\u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0627\u0644\u062c\u0648\u0627\u0644','\u0628\u0631\u0645\u062c\u064a\u0627\u062a \u0645\u062e\u0635\u0635\u0629','\u062a\u0633\u0648\u064a\u0642 \u0627\u0644\u0633\u0648\u0634\u0627\u0644 \u0645\u064a\u062f\u064a\u0627'],
                    cardDescs:[
                        '\u0645\u0648\u0627\u0642\u0639 \u0645\u062e\u0635\u0635\u0629\u060c \u0635\u0641\u062d\u0627\u062a \u0647\u0628\u0648\u0637\u060c \u0645\u0646\u0635\u0627\u062a \u062a\u062c\u0627\u0631\u0629 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629\u060c \u0648\u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0648\u064a\u0628 \u0628\u062a\u0642\u0646\u064a\u0627\u062a \u062d\u062f\u064a\u062b\u0629 \u0648\u062a\u0635\u0645\u064a\u0645 \u0645\u0630\u0647\u0644.',
                        '\u062a\u0637\u0628\u064a\u0642\u0627\u062a \u062c\u0648\u0627\u0644 \u0623\u0635\u0644\u064a\u0629 \u0648\u0645\u062a\u0639\u062f\u062f\u0629 \u0627\u0644\u0645\u0646\u0635\u0627\u062a \u0644\u0640 iOS \u0648 Android \u062a\u0642\u062f\u0645 \u062a\u062c\u0631\u0628\u0629 \u0645\u0633\u062a\u062e\u062f\u0645 \u0633\u0644\u0633\u0629.',
                        '\u062d\u0644\u0648\u0644 \u0628\u0631\u0645\u062c\u064a\u0629 \u0645\u062e\u0635\u0635\u0629 \u0644\u0623\u062a\u0645\u062a\u0629 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a \u0648\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0648\u062a\u0628\u0633\u064a\u0637 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a \u0644\u062c\u0645\u064a\u0639 \u0627\u0644\u0623\u062d\u062c\u0627\u0645.',
                        '\u0625\u062f\u0627\u0631\u0629 \u0633\u0648\u0634\u0627\u0644 \u0645\u064a\u062f\u064a\u0627 \u0645\u062a\u0643\u0627\u0645\u0644\u0629\u060c \u0625\u0639\u0644\u0627\u0646\u0627\u062a\u060c \u0648\u0625\u0646\u0634\u0627\u0621 \u0645\u062d\u062a\u0648\u0649 \u0644\u062a\u0646\u0645\u064a\u0629 \u0639\u0644\u0627\u0645\u062a\u0643 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0639\u0628\u0631 \u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0646\u0635\u0627\u062a.'
                    ],
                    cardFeatures:[
                        ['\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0634\u0631\u0643\u0627\u062a','\u0645\u062a\u0627\u062c\u0631 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0629','\u0635\u0641\u062d\u0627\u062a \u0647\u0628\u0648\u0637','\u062a\u0637\u0628\u064a\u0642\u0627\u062a \u0648\u064a\u0628','\u062a\u0643\u0627\u0645\u0644 CMS','\u0645\u062d\u0633\u0651\u0646 \u0644\u0645\u062d\u0631\u0643\u0627\u062a \u0627\u0644\u0628\u062d\u062b'],
                        ['\u062a\u0637\u0648\u064a\u0631 iOS','\u062a\u0637\u0648\u064a\u0631 Android','\u0645\u062a\u0639\u062f\u062f \u0627\u0644\u0645\u0646\u0635\u0627\u062a (Flutter)','\u062a\u0635\u0645\u064a\u0645 UI/UX','\u0646\u0634\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u062a\u062c\u0631','\u0625\u0634\u0639\u0627\u0631\u0627\u062a \u0641\u0648\u0631\u064a\u0629'],
                        ['\u0623\u0646\u0638\u0645\u0629 CRM','\u062d\u0644\u0648\u0644 ERP','\u0644\u0648\u062d\u0627\u062a \u062a\u062d\u0643\u0645 \u0648\u062a\u062d\u0644\u064a\u0644\u0627\u062a','\u062a\u0637\u0648\u064a\u0631 API','\u0627\u0633\u062a\u0636\u0627\u0641\u0629 \u0633\u062d\u0627\u0628\u064a\u0629','\u0635\u064a\u0627\u0646\u0629 \u0648\u062f\u0639\u0645'],
                        ['\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0627\u0644\u0645\u062d\u062a\u0648\u0649','\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0633\u0648\u0634\u0627\u0644','\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0645\u062f\u0641\u0648\u0639\u0629','\u062a\u0633\u0648\u064a\u0642 \u0639\u0628\u0631 \u0627\u0644\u0645\u0624\u062b\u0631\u064a\u0646','\u062a\u062d\u0644\u064a\u0644\u0627\u062a \u0648\u062a\u0642\u0627\u0631\u064a\u0631','\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u062c\u062a\u0645\u0639']
                    ],
                    processLabel:'( \u0637\u0631\u064a\u0642\u0629 \u0639\u0645\u0644\u0646\u0627 )',processHeading:'\u0627\u0644\u0639\u0645\u0644\u064a\u0629',
                    processTitles:['\u0627\u0644\u0627\u0643\u062a\u0634\u0627\u0641','\u0627\u0644\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629 \u0648\u0627\u0644\u062a\u0635\u0645\u064a\u0645','\u0627\u0644\u062a\u0637\u0648\u064a\u0631','\u0627\u0644\u0625\u0637\u0644\u0627\u0642 \u0648\u0627\u0644\u062f\u0639\u0645'],
                    processDescs:[
                        '\u0646\u062a\u0639\u0645\u0642 \u0641\u064a \u0623\u0639\u0645\u0627\u0644\u0643 \u0648\u0623\u0647\u062f\u0627\u0641\u0643 \u0648\u062c\u0645\u0647\u0648\u0631\u0643 \u0648\u0645\u0646\u0627\u0641\u0633\u064a\u0643 \u0644\u0628\u0646\u0627\u0621 \u0623\u0633\u0627\u0633 \u0645\u062a\u064a\u0646 \u0644\u0645\u0634\u0631\u0648\u0639\u0643.',
                        '\u0625\u0637\u0627\u0631\u0627\u062a \u0633\u0644\u0643\u064a\u0629\u060c \u0646\u0645\u0627\u0630\u062c \u0623\u0648\u0644\u064a\u0629\u060c \u0648\u062a\u0635\u0645\u064a\u0645 UI/UX \u0645\u0635\u0645\u0645 \u0644\u062a\u062d\u0642\u064a\u0642 \u0623\u0642\u0635\u0649 \u062a\u0623\u062b\u064a\u0631 \u0648\u062a\u062d\u0648\u064a\u0644.',
                        '\u0643\u0648\u062f \u0646\u0638\u064a\u0641 \u0648\u0642\u0627\u0628\u0644 \u0644\u0644\u062a\u0648\u0633\u0639. \u0625\u0637\u0627\u0631\u0627\u062a \u062d\u062f\u064a\u062b\u0629. \u062a\u0635\u0645\u064a\u0645 \u0645\u062a\u062c\u0627\u0648\u0628. \u0645\u062e\u062a\u0628\u0631 \u0639\u0644\u0649 \u0643\u0644 \u062c\u0647\u0627\u0632 \u0648\u0645\u062a\u0635\u0641\u062d.',
                        '\u0646\u0634\u0631\u060c \u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0623\u062f\u0627\u0621\u060c \u0648\u0635\u064a\u0627\u0646\u0629 \u0645\u0633\u062a\u0645\u0631\u0629 \u0644\u0644\u062d\u0641\u0627\u0638 \u0639\u0644\u0649 \u0643\u0644 \u0634\u064a\u0621 \u0641\u064a \u0623\u0639\u0644\u0649 \u0645\u0633\u062a\u0648\u0649.'
                    ],
                    whyLabel:'( \u0644\u064a\u0634 LOOP )',whyHeading:'\u0645\u0634 \u0628\u0633 \u0643\u0648\u062f',
                    whyTitles:['\u062a\u0633\u0648\u064a\u0642 + \u062a\u0643\u0646\u0648\u0644\u0648\u062c\u064a\u0627','\u062a\u0635\u0645\u064a\u0645 \u062e\u064a\u0627\u0644\u064a','\u062a\u0633\u0644\u064a\u0645 \u0633\u0631\u064a\u0639','\u062f\u0639\u0645 \u0643\u0627\u0645\u0644'],
                    whyDescs:[
                        '\u0644\u0627 \u0646\u0628\u0646\u064a \u0641\u0642\u0637 \u2014 \u0646\u0628\u0646\u064a \u0628\u062d\u0645\u0636 \u062a\u0633\u0648\u064a\u0642\u064a. \u0643\u0644 \u0645\u064a\u0632\u0629 \u0645\u0635\u0645\u0645\u0629 \u0644\u0644\u062a\u062d\u0648\u064a\u0644 \u0648\u0627\u0644\u0646\u0645\u0648.',
                        '\u0648\u0627\u062c\u0647\u0627\u062a \u062f\u0642\u064a\u0642\u0629 \u0644\u0644\u0628\u0643\u0633\u0644\u060c \u062a\u0633\u062a\u062d\u0642 \u0627\u0644\u062c\u0648\u0627\u0626\u0632\u060c \u062a\u062e\u0644\u064a \u0627\u0644\u0645\u0646\u0627\u0641\u0633\u064a\u0646 \u064a\u063a\u0627\u0631\u0648\u0627.',
                        '\u0639\u0645\u0644\u064a\u0629 Agile\u060c \u0645\u0631\u0627\u062d\u0644 \u0648\u0627\u0636\u062d\u0629\u060c \u0628\u062f\u0648\u0646 \u062a\u0623\u062e\u064a\u0631. \u0646\u0633\u0644\u0645 \u0628\u0633\u0631\u0639\u0629 \u0628\u062f\u0648\u0646 \u0627\u0644\u062a\u0636\u062d\u064a\u0629 \u0628\u0627\u0644\u062c\u0648\u062f\u0629.',
                        '\u0635\u064a\u0627\u0646\u0629 \u0628\u0639\u062f \u0627\u0644\u0625\u0637\u0644\u0627\u0642\u060c \u062a\u062d\u062f\u064a\u062b\u0627\u062a\u060c \u0627\u0633\u062a\u0636\u0627\u0641\u0629\u060c \u0648\u062a\u0648\u0633\u064a\u0639. \u0646\u062d\u0646 \u0645\u0639\u0643 \u0639\u0644\u0649 \u0627\u0644\u0645\u062f\u0649 \u0627\u0644\u0637\u0648\u064a\u0644.'
                    ],
                    ctaHTML:'\u062e\u0644\u064a\u0646\u0627 \u0646\u0628\u0646\u064a \u0634\u064a <span class="holo-word">\u062c\u0646\u0648\u0646\u064a \u2726</span>',
                    ctaBtn:'\u0627\u0628\u062f\u0623 \u0645\u0634\u0631\u0648\u0639\u0643'
                }
            },
            blog: {
                en: {
                    heroTag:'BLOG',
                    heroTitle:[['MARKETING','&'],['TECH','INSIGHTS.']],
                    heroDesc:'Expert knowledge from Jordan\u2019s leading marketing and technology agency. Tips, strategies, and insights to grow your business.',
                    ctaHTML:'READY TO <span class="holo-word">GROW</span><br>YOUR BRAND? \u2726',
                    ctaBtn:'LET\u2019S TALK'
                },
                ar: {
                    heroTag:'\u0627\u0644\u0645\u062f\u0648\u0646\u0629',
                    heroTitle:[['\u062a\u0633\u0648\u064a\u0642','\u0648'],['\u062a\u0643\u0646\u0648\u0644\u0648\u062c\u064a\u0627','\u0648\u0631\u0624\u0649.']],
                    heroDesc:'\u0645\u0639\u0631\u0641\u0629 \u0627\u062d\u062a\u0631\u0627\u0641\u064a\u0629 \u0645\u0646 \u0623\u0641\u0636\u0644 \u0648\u0643\u0627\u0644\u0629 \u062a\u0633\u0648\u064a\u0642 \u0648\u062a\u0643\u0646\u0648\u0644\u0648\u062c\u064a\u0627 \u0641\u064a \u0627\u0644\u0623\u0631\u062f\u0646. \u0646\u0635\u0627\u0626\u062d \u0648\u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0627\u062a \u0648\u0631\u0624\u0649 \u0644\u062a\u0646\u0645\u064a\u0629 \u0623\u0639\u0645\u0627\u0644\u0643.',
                    ctaHTML:'\u062c\u0627\u0647\u0632 <span class="holo-word">\u062a\u0646\u0645\u0651\u064a</span><br>\u0628\u0631\u0627\u0646\u062f\u0643\u061f \u2726',
                    ctaBtn:'\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627'
                }
            }
        };

        var currentLang = localStorage.getItem('loopLang') || 'en';

        function q(s){return document.querySelector(s);}
        function qa(s){return document.querySelectorAll(s);}

        function applyLang(lang) {
            var t = pages[page][lang];
            var isAr = lang === 'ar';
            document.body.classList.toggle('is-arabic', isAr);
            document.documentElement.lang = isAr ? 'ar' : 'en';

            // ── Nav ──
            qa('.radial-item-label').forEach(function(el,i){
                if(navLabels[lang][i]) el.textContent = navLabels[lang][i];
            });
            var cs = q('.nav-cta span');
            if(cs) cs.textContent = navCta[lang];

            // ── Footer ──
            qa('.footer-nav a').forEach(function(el,i){
                if(navLabels[lang][i]) el.textContent = navLabels[lang][i];
            });
            var fc = q('.footer-copy');
            if(fc) fc.textContent = footerCopy[lang];

            // ── Hero (all pages) ──
            var ht = q('.hero-tag.glitch');
            if(ht && t.heroTag){ ht.textContent = t.heroTag; ht.setAttribute('data-text', t.heroTag); }

            if(t.heroTitle){
                var lines = qa('.hero-title .title-line');
                t.heroTitle.forEach(function(words,li){
                    if(!lines[li]) return;
                    var spans = lines[li].querySelectorAll('.title-word');
                    words.forEach(function(w,wi){ if(spans[wi]) spans[wi].textContent = w; });
                });
            }

            var desc = q('.page-hero-desc') || q('.hero-desc');
            if(desc && t.heroDesc) desc.textContent = t.heroDesc;

            // ── CTA ──
            var massive = q('.massive-text');
            if(massive && t.ctaHTML) massive.innerHTML = t.ctaHTML;
            var ctaBtn = q('.big-text-section .btn-text');
            if(ctaBtn && t.ctaBtn) ctaBtn.textContent = t.ctaBtn;

            // ── Toggle label ──
            toggle.querySelector('.lang-toggle-text').textContent = isAr ? 'EN' : '\u0639\u0631\u0628\u064a';

            // ══════ INDEX ══════
            if(page === 'index'){
                if(t.heroBtn){ var hb = q('.hero-bottom .btn-text'); if(hb) hb.textContent = t.heroBtn; }
                if(t.scroll !== undefined){ var sh = q('.scroll-hint span'); if(sh) sh.textContent = t.scroll; }
                if(t.stats){ qa('.stat-txt').forEach(function(el,i){ if(t.stats[i]) el.innerHTML = t.stats[i].replace('\n','<br>'); }); }
                if(t.aboutLabel){ var al = q('.about .section-label'); if(al) al.textContent = t.aboutLabel; }
                if(t.aboutHeadingHTML){ var ah = q('.about .big-heading'); if(ah) ah.innerHTML = t.aboutHeadingHTML; }
                if(t.aboutP1){ var ab = qa('.about-text-block .big-text'); if(ab[0]) ab[0].textContent = t.aboutP1; }
                if(t.aboutP2){ var ab2 = qa('.about-text-block p'); if(ab2[1]) ab2[1].textContent = t.aboutP2; }
                if(t.pills){ qa('.about .pill').forEach(function(el,i){ if(t.pills[i]) el.textContent = t.pills[i]; }); }
                if(t.servicesLabel){ var sl = q('.services .section-label'); if(sl) sl.textContent = t.servicesLabel; }
                if(t.servicesHeadingHTML){ var sh2 = q('.services .big-heading'); if(sh2) sh2.innerHTML = t.servicesHeadingHTML; }
                if(t.serviceTitles){ qa('.service-title').forEach(function(el,i){ if(t.serviceTitles[i]) el.textContent = t.serviceTitles[i]; }); }
                if(t.serviceDescs){ qa('.service-right p').forEach(function(el,i){ if(t.serviceDescs[i]) el.textContent = t.serviceDescs[i]; }); }
                if(t.teamLabel){ qa('.section-label').forEach(function(el){ if(el.textContent.indexOf('CREW')!==-1||el.textContent.indexOf('\u0627\u0644\u0641\u0631\u064a\u0642')!==-1) el.textContent=t.teamLabel; }); }
                if(t.teamHeadingHTML){ qa('.big-heading').forEach(function(el){ if(el.innerHTML.indexOf('MANIACS')!==-1||el.innerHTML.indexOf('\u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0646')!==-1) el.innerHTML=t.teamHeadingHTML; }); }
                if(t.teamRoles){ qa('.team-overlay span').forEach(function(el,i){ if(t.teamRoles[i]) el.textContent=t.teamRoles[i]; }); }
                if(t.teamJobTitles){ qa('.team-info span').forEach(function(el,i){ if(t.teamJobTitles[i]) el.textContent=t.teamJobTitles[i]; }); }
                if(t.contactLabel){ qa('.section-label').forEach(function(el){ if(el.textContent.indexOf('TALK')!==-1||el.textContent.indexOf('\u062a\u0648\u0627\u0635\u0644')!==-1) el.textContent=t.contactLabel; }); }
                if(t.contactHeadingHTML){ qa('.big-heading').forEach(function(el){ if(el.innerHTML.indexOf('VIRAL')!==-1||el.innerHTML.indexOf('\u0641\u0627\u064a\u0631\u0644')!==-1) el.innerHTML=t.contactHeadingHTML; }); }
                if(t.formPlaceholders){ qa('#contactForm input, #contactForm textarea').forEach(function(el,i){ if(t.formPlaceholders[i]) el.placeholder=t.formPlaceholders[i]; }); }
                if(t.formBtn){ var fb = q('.btn-submit .btn-text'); if(fb) fb.textContent=t.formBtn; }
                if(t.marquee){ qa('.marquee-content:not(.marquee-big) > span:not(.marquee-dot)').forEach(function(el,i){ el.textContent=t.marquee[i % t.marquee.length]; }); }
                if(t.marqueeBig){ qa('.marquee-big > span:not(.marquee-dot)').forEach(function(el,i){ el.textContent=t.marqueeBig[i % t.marqueeBig.length]; }); }
            }

            // ══════ PORTFOLIO ══════
            if(page === 'portfolio'){
                if(t.filters){ qa('.portfolio-filters .filter-btn').forEach(function(el,i){ if(t.filters[i]) el.textContent=t.filters[i]; }); }
            }

            // ══════ CLIENTS ══════
            if(page === 'clients'){
                if(t.clientFilters){ qa('.client-filters .filter-btn').forEach(function(btn){ var f=btn.dataset.filter; if(t.clientFilters[f]) btn.textContent=t.clientFilters[f]; }); }
                if(t.categories){
                    qa('.ig-card').forEach(function(card){
                        var cat=card.dataset.category;
                        var cs2=card.querySelector('.ig-category');
                        if(cs2 && t.categories[cat]) cs2.innerHTML='<i class="fas fa-tag"></i> '+t.categories[cat];
                        var mg=card.querySelector('.ig-managed');
                        if(mg && t.managed) mg.textContent=t.managed;
                    });
                }
            }

            // ══════ SOLUTIONS ══════
            if(page === 'solutions'){
                if(t.cardTitles){ qa('.solution-card-title').forEach(function(el,i){ if(t.cardTitles[i]) el.textContent=t.cardTitles[i]; }); }
                if(t.cardDescs){ qa('.solution-card-desc').forEach(function(el,i){ if(t.cardDescs[i]) el.textContent=t.cardDescs[i]; }); }
                if(t.cardFeatures){ qa('.solution-card').forEach(function(card,ci){ if(!t.cardFeatures[ci]) return; card.querySelectorAll('.solution-feature').forEach(function(el,fi){ if(t.cardFeatures[ci][fi]) el.textContent=t.cardFeatures[ci][fi]; }); }); }
                if(t.processLabel){ qa('.section-label').forEach(function(el){ if(el.textContent.indexOf('HOW')!==-1||el.textContent.indexOf('\u0637\u0631\u064a\u0642\u0629')!==-1) el.textContent=t.processLabel; }); }
                if(t.processHeading){ qa('.big-heading').forEach(function(el){ if(el.textContent.indexOf('PROCESS')!==-1||el.textContent.indexOf('\u0627\u0644\u0639\u0645\u0644\u064a\u0629')!==-1) el.textContent=t.processHeading; }); }
                if(t.processTitles){ qa('.process-step h3').forEach(function(el,i){ if(t.processTitles[i]) el.textContent=t.processTitles[i]; }); }
                if(t.processDescs){ qa('.process-step p').forEach(function(el,i){ if(t.processDescs[i]) el.textContent=t.processDescs[i]; }); }
                if(t.whyLabel){ qa('.section-label').forEach(function(el){ if(el.textContent.indexOf('WHY')!==-1||el.textContent.indexOf('\u0644\u064a\u0634')!==-1) el.textContent=t.whyLabel; }); }
                if(t.whyHeading){ qa('.big-heading').forEach(function(el){ if(el.textContent.indexOf('CODE')!==-1||el.textContent.indexOf('\u0643\u0648\u062f')!==-1||el.textContent.indexOf('\u0628\u0633')!==-1) el.textContent=t.whyHeading; }); }
                if(t.whyTitles){ qa('.why-card h4').forEach(function(el,i){ if(t.whyTitles[i]) el.textContent=t.whyTitles[i]; }); }
                if(t.whyDescs){ qa('.why-card p').forEach(function(el,i){ if(t.whyDescs[i]) el.textContent=t.whyDescs[i]; }); }
            }

            localStorage.setItem('loopLang', lang);
            currentLang = lang;
        }

        applyLang(currentLang);
        toggle.addEventListener('click', function(){ applyLang(currentLang === 'en' ? 'ar' : 'en'); });
    }

})();

/* === PAGE TRANSITIONS === */
(function(){
    // Intercept internal links for smooth page transition
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a[href]');
        if (!link) return;
        var href = link.getAttribute('href');
        // Skip anchors, external links, javascript:, mailto:, tel:
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) return;
        // Skip if modifier key held
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        document.body.classList.add('page-leaving');
        setTimeout(function(){ window.location.href = href; }, 200);
    });
})();
