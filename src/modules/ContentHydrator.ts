import { SITE_CONTENT } from '../content/siteContent';

type NullableElement = HTMLElement | HTMLAnchorElement | null;
type TimelineState = (typeof SITE_CONTENT.tracking.timeline)[number]['state'];

export class ContentHydrator {
    #content = SITE_CONTENT;

    init(): void {
        this.#hydrateMedia();
        this.#hydrateBrand();
        this.#hydrateNavigation();
        this.#hydrateContact();
        this.#hydrateHero();
        this.#hydrateTracking();
        this.#hydrateApple();
        this.#hydrateTruck();
        this.#hydrateUniversityFeatures();
        this.#hydrateCarousel();
        this.#hydrateServices();
        this.#hydrateServiceCharacteristics();
        this.#hydrateFlow();
        this.#hydrateStats();
        this.#hydrateFaq();
        this.#hydrateTicker();
        this.#hydrateFooter();
    }

    #setText(id: string, value: string): void {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value;
        }
    }

    #setHtml(id: string, value: string): void {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = value;
        }
    }

    #setHref(id: string, href: string): void {
        const el = document.getElementById(id) as NullableElement;
        if (el && el instanceof HTMLAnchorElement) {
            el.href = href;
        }
    }

    #setAttribute(id: string, name: string, value: string): void {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute(name, value);
        }
    }

    #hydrateMedia(): void {
        this.#setAttribute('hero-bg', 'src', this.#content.media.heroBackgroundSrc);
        this.#setAttribute('hero-bg', 'alt', this.#content.media.heroBackgroundAlt);
        this.#setAttribute('apple-bg-image', 'src', this.#content.media.appleBackgroundSrc);
        this.#setAttribute('apple-bg-image', 'alt', this.#content.media.appleBackgroundAlt);
        this.#setAttribute('stats-bg', 'src', this.#content.media.statsBackgroundSrc);
        this.#setAttribute('stats-bg', 'alt', this.#content.media.statsBackgroundAlt);
    }

    #hydrateBrand(): void {
        this.#setText('logo-text', this.#content.brand.logoPrimary);
        this.#setText('logo-subtext', this.#content.brand.logoSecondary);
        this.#setText('uf-company-label', this.#content.brand.legalName);
        this.#setText('footer-brand-name', this.#content.brand.footerBrand);
    }

    #hydrateNavigation(): void {
        this.#setText('nav-services-link', this.#content.nav.servicesLabel);
        this.#setText('nav-tracking-link', this.#content.nav.trackingLabel);
        this.#setText('nav-coverage-link', this.#content.nav.coverageLabel);

        this.#setText('mobile-services-link', this.#content.nav.servicesLabel);
        this.#setText('mobile-tracking-link', this.#content.nav.trackingLabel);
        this.#setText('mobile-coverage-link', this.#content.nav.coverageLabel);
    }

    #hydrateContact(): void {
        const phoneLinkIds = [
            'nav-contract-link',
            'mobile-contract-link',
            'hero-contract-link',
            'contact-contract-link',
            'footer-contract-link',
        ];
        phoneLinkIds.forEach((id) => {
            this.#setHref(id, this.#content.contact.phoneHref);
        });

        this.#setText(
            'nav-contract-link',
            `${this.#content.contact.contractsLabel}: ${this.#content.contact.phoneDisplay}`
        );
        this.#setText(
            'mobile-contract-link',
            `${this.#content.contact.contractsLabel}: ${this.#content.contact.phoneDisplay}`
        );
        this.#setText(
            'hero-contract-text',
            `${this.#content.contact.contractsLabel}: ${this.#content.contact.phoneDisplay}`
        );
        this.#setText('contact-contract-link', this.#content.contact.phoneDisplay);
        this.#setText('footer-contract-text', this.#content.contact.phoneDisplay);
        this.#setText('contact-title', this.#content.contact.sectionTitle);
        this.#setText('contact-subtitle-prefix', this.#content.contact.sectionSubtitlePrefix);

        const whatsappLinkIds = ['footer-whatsapp-link', 'floating-whatsapp-link'];
        whatsappLinkIds.forEach((id) => {
            this.#setHref(id, this.#content.contact.whatsappHref);
        });
        this.#setText('footer-whatsapp-text', this.#content.footer.whatsappLabel);
        this.#setText('floating-whatsapp-text', `Chat ${this.#content.contact.phoneDisplay}`);
    }

    #hydrateHero(): void {
        this.#setText('hero-badge-text', this.#content.hero.badge);
        this.#setText('hero-title-main', this.#content.hero.titleMain);
        this.#setText('hero-title-sub', this.#content.hero.titleSub);
        this.#setText('hero-description', this.#content.hero.description);
        this.#setText('hero-primary-cta-text', this.#content.hero.primaryCta);
    }

    #hydrateTracking(): void {
        this.#setText('tracking-title', this.#content.tracking.title);
        this.#setText('tracking-subtitle', this.#content.tracking.subtitle);
        this.#setAttribute('tracking-input', 'placeholder', this.#content.tracking.inputPlaceholder);
        this.#setText('tracking-submit-text', this.#content.tracking.submitLabel);
        this.#setText('tracking-result-guide-label', this.#content.tracking.resultGuideLabel);
        this.#setText('tracking-result-estimated-label', this.#content.tracking.resultEstimatedLabel);
        this.#setText('tracking-reset-text', this.#content.tracking.resetLabel);
        this.#renderTrackingTimeline();
    }

    #renderTrackingTimeline(): void {
        const container = document.getElementById('tracking-timeline');
        if (!container) return;

        const getTitleClass = (state: TimelineState): string => {
            if (state === 'current') return 'text-sm font-bold text-accent-600';
            if (state === 'pending') return 'text-sm font-bold text-slate-400';
            return 'text-sm font-bold text-slate-800';
        };

        const getDetailClass = (state: TimelineState): string => {
            return state === 'pending' ? 'text-xs text-slate-400' : 'text-xs text-slate-500';
        };

        const timelineHtml = this.#content.tracking.timeline
            .map((step) => {
                const stateClass = step.state === 'pending' ? '' : ` ${step.state}`;
                return `
                    <div class="timeline-item${stateClass}">
                        <span class="timeline-dot"></span>
                        <p class="${getTitleClass(step.state)}">${step.title}</p>
                        <p class="${getDetailClass(step.state)}">${step.detail}</p>
                    </div>
                `;
            })
            .join('');

        container.innerHTML = timelineHtml;
    }

    #hydrateApple(): void {
        this.#setHtml('apple-heading', this.#content.apple.headingHtml);
        this.#setText('apple-subheading', this.#content.apple.subheading);
    }

    #hydrateTruck(): void {
        const firstStatus = this.#content.truck.statuses[0];
        if (firstStatus) {
            this.#setText('ts-status', firstStatus);
        }
        this.#setHtml('truck-headline', this.#content.truck.headlineHtml);
        this.#setText('truck-subheading', this.#content.truck.subheading);
        this.#setText('truck-origin-label', this.#content.truck.originLabel);
        this.#setText('truck-destination-label', this.#content.truck.destinationLabel);
        this.#setText('truck-scroll-cue-text', this.#content.truck.scrollCue);
        this.#renderTruckWaypoints();
    }

    #renderTruckWaypoints(): void {
        const container = document.getElementById('truck-waypoints');
        if (!container) return;

        const waypointsHtml = this.#content.truck.waypoints
            .map((waypoint) => {
                const waypointClass = waypoint.isHome ? 'ts-waypoint ts-waypoint--home' : 'ts-waypoint';
                const pinClass = waypoint.isHome ? 'wp-pin wp-pin--home' : 'wp-pin';
                return `
                    <div class="${waypointClass}" style="left:${waypoint.left}">
                        <div class="wp-pole"></div>
                        <div class="${pinClass}"><i class="${waypoint.iconClass}"></i></div>
                        <div class="wp-label">${waypoint.title}<br><span>${waypoint.subtitle}</span></div>
                    </div>
                `;
            })
            .join('');

        container.innerHTML = waypointsHtml;
    }

    #hydrateUniversityFeatures(): void {
        this.#setHtml('uf-title', this.#content.features.titleHtml);
        const firstFeatureLabel = this.#content.features.items[0]?.title;
        if (firstFeatureLabel) {
            this.#setText('uf-nav-label', firstFeatureLabel);
        }
        this.#renderUniversityFeatureList();
        this.#renderUniversityNavDots();

        this.#setText('uf-mockup-chip', this.#content.features.mockup.coverageChip);
        this.#setHtml('uf-mockup-pickup-text', this.#content.features.mockup.pickupTextHtml);
        this.#setText('uf-mockup-pickup-tag-one', this.#content.features.mockup.pickupTagOne);
        this.#setText('uf-mockup-pickup-tag-two', this.#content.features.mockup.pickupTagTwo);
        this.#setText('uf-mockup-shield-text', this.#content.features.mockup.shieldText);
        this.#setText('uf-mockup-shield-coverage', this.#content.features.mockup.shieldCoverage);
        this.#setText('uf-mockup-notif-one', this.#content.features.mockup.notificationOne);
        this.#setText('uf-mockup-notif-two', this.#content.features.mockup.notificationTwo);
        this.#setText('uf-mockup-notif-three', this.#content.features.mockup.notificationThree);
        this.#setText('uf-mockup-method-one', this.#content.features.mockup.methodOne);
        this.#setText('uf-mockup-method-two', this.#content.features.mockup.methodTwo);
        this.#setText('uf-mockup-method-three', this.#content.features.mockup.methodThree);
        this.#setText('uf-mockup-method-four', this.#content.features.mockup.methodFour);
        this.#setText('uf-mockup-receipt-one-label', this.#content.features.mockup.receiptOneLabel);
        this.#setText('uf-mockup-receipt-one-value', this.#content.features.mockup.receiptOneValue);
        this.#setText('uf-mockup-receipt-two-label', this.#content.features.mockup.receiptTwoLabel);
        this.#setText('uf-mockup-receipt-two-value', this.#content.features.mockup.receiptTwoValue);
        this.#setText('uf-mockup-receipt-three-label', this.#content.features.mockup.receiptThreeLabel);
        this.#setText('uf-mockup-receipt-three-value', this.#content.features.mockup.receiptThreeValue);
    }

    #renderUniversityFeatureList(): void {
        const container = document.getElementById('uf-feature-list');
        if (!container) return;

        const itemsHtml = this.#content.features.items
            .map((item, index) => `
                <div class="feature-item" data-index="${index}">
                    <div class="fi-icon"><i class="${item.iconClass}"></i></div>
                    <div class="fi-text">
                        <h3 class="fi-title">${item.title}</h3>
                        <p class="fi-desc">${item.description}</p>
                    </div>
                </div>
            `)
            .join('');

        container.innerHTML = itemsHtml;
    }

    #renderUniversityNavDots(): void {
        const dotsContainer = document.getElementById('uf-nav-dots');
        if (!dotsContainer) return;

        dotsContainer.innerHTML = '';
        this.#content.features.items.forEach((item, index) => {
            const dot = document.createElement('button');
            dot.className = index === 0 ? 'uf-nav-dot uf-nav-dot--active' : 'uf-nav-dot';
            dot.dataset['index'] = String(index);
            dot.setAttribute('aria-label', item.title);
            dotsContainer.appendChild(dot);
        });
    }

    #hydrateCarousel(): void {
        this.#setText('carousel-slide-1-label', this.#content.carousel.slideOne.label);
        this.#setHtml('carousel-slide-1-title', this.#content.carousel.slideOne.titleHtml);
        this.#setText('carousel-slide-1-body', this.#content.carousel.slideOne.body);
        this.#setText('carousel-slide-1-badge-one', this.#content.carousel.slideOne.badgeOne);
        this.#setText('carousel-slide-1-badge-two', this.#content.carousel.slideOne.badgeTwo);
        this.#setText('carousel-slide-1-badge-three', this.#content.carousel.slideOne.badgeThree);
        this.#setText('carousel-slide-1-phone-title', this.#content.carousel.slideOne.phoneTitle);
        this.#setText('carousel-slide-1-phone-label', this.#content.carousel.slideOne.phoneLabel);
        this.#setText('carousel-slide-1-phone-cta', this.#content.carousel.slideOne.phoneCta);

        this.#setText('carousel-slide-2-label', this.#content.carousel.slideTwo.label);
        this.#setHtml('carousel-slide-2-title', this.#content.carousel.slideTwo.titleHtml);
        this.#setText('carousel-slide-2-body', this.#content.carousel.slideTwo.body);
        this.#setText('carousel-slide-2-stat-one-label', this.#content.carousel.slideTwo.statOneLabel);
        this.#setText('carousel-slide-2-stat-two-label', this.#content.carousel.slideTwo.statTwoLabel);
        this.#setText('carousel-slide-2-phone-title', this.#content.carousel.slideTwo.phoneTitle);
        this.#setText('carousel-slide-2-route-one', this.#content.carousel.slideTwo.routeOne);
        this.#setText('carousel-slide-2-route-two', this.#content.carousel.slideTwo.routeTwo);
        this.#setText('carousel-slide-2-route-three', this.#content.carousel.slideTwo.routeThree);
        this.#setText('carousel-slide-2-eta-prefix', this.#content.carousel.slideTwo.etaPrefix);
        this.#setText('carousel-slide-2-eta-value', this.#content.carousel.slideTwo.etaValue);

        this.#setText('carousel-slide-3-label', this.#content.carousel.slideThree.label);
        this.#setHtml('carousel-slide-3-title', this.#content.carousel.slideThree.titleHtml);
        this.#setText('carousel-slide-3-body', this.#content.carousel.slideThree.body);
        this.#setText('carousel-slide-3-timer-one', this.#content.carousel.slideThree.timerOne);
        this.#setText('carousel-slide-3-timer-two', this.#content.carousel.slideThree.timerTwo);
        this.#setText('carousel-slide-3-phone-title', this.#content.carousel.slideThree.phoneTitle);
        this.#setText('carousel-slide-3-delivered-message', this.#content.carousel.slideThree.deliveredMessage);
        this.#setText('carousel-slide-3-delivered-time', this.#content.carousel.slideThree.deliveredTime);
    }

    #hydrateServices(): void {
        this.#setText('services-eyebrow', this.#content.services.eyebrow);
        this.#setText('services-title', this.#content.services.title);

        const container = document.getElementById('services-grid');
        if (!container) return;

        const scenePresets = [
            {
                kind: 'docs',
                primaryIcon: 'fa-solid fa-file-lines',
                secondaryIcon: 'fa-solid fa-pen',
                tertiaryIcon: 'fa-solid fa-circle-check',
            },
            {
                kind: 'valued',
                primaryIcon: 'fa-solid fa-shield-halved',
                secondaryIcon: 'fa-solid fa-certificate',
                tertiaryIcon: 'fa-solid fa-lock',
            },
            {
                kind: 'parcel',
                primaryIcon: 'fa-solid fa-truck-fast',
                secondaryIcon: 'fa-solid fa-box-open',
                tertiaryIcon: 'fa-solid fa-location-dot',
            },
        ] as const;

        const fallbackScenePreset = {
            kind: 'docs',
            primaryIcon: 'fa-solid fa-file-lines',
            secondaryIcon: 'fa-solid fa-pen',
            tertiaryIcon: 'fa-solid fa-circle-check',
        } as const;

        const cardsHtml = this.#content.services.cards
            .map((card, index) => {
                const delay = index > 0 ? ` style="transition-delay: ${index * 100}ms;"` : '';
                const preset = scenePresets[index] ?? fallbackScenePreset;
                const imageLoading = index === 0 ? 'eager' : 'lazy';
                return `
                <div class="reveal group service-card service-card--${preset.kind}" data-service-card data-service-kind="${preset.kind}"${delay}>
                    <div class="service-card-media parallax-wrapper">
                        <img src="${card.imageSrc}" width="800" height="500" alt="${card.imageAlt}" class="parallax-img service-card-bg" loading="${imageLoading}">
                        <div class="service-card-veil"></div>

                        <div class="service-scene" aria-hidden="true">
                            <span class="service-orb service-orb--one"></span>
                            <span class="service-orb service-orb--two"></span>
                            <span class="service-route" data-service-depth="0.2"></span>
                            <span class="service-icon-chip service-icon-chip--primary" data-service-depth="0.55"><i class="${preset.primaryIcon}"></i></span>
                            <span class="service-icon-chip service-icon-chip--secondary" data-service-depth="0.38"><i class="${preset.secondaryIcon}"></i></span>
                            <span class="service-icon-chip service-icon-chip--tertiary" data-service-depth="0.72"><i class="${preset.tertiaryIcon}"></i></span>
                        </div>

                        <div class="service-badge absolute bottom-4 left-4 ${card.badgeClass} text-white px-3 py-1 text-xs font-bold uppercase rounded shadow z-10">${card.badge}</div>
                    </div>
                    <div class="service-card-body p-8 relative">
                        <h3 class="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">${card.title}</h3>
                        <p class="text-slate-500 text-sm leading-relaxed mb-6">${card.description}</p>
                        <span class="text-brand-600 font-bold text-sm uppercase tracking-wide flex items-center gap-2 group-hover:gap-4 transition-[gap]">${card.cta} <i class="fa-solid fa-arrow-right"></i></span>
                    </div>
                </div>`;
            })
            .join('');

        container.innerHTML = cardsHtml;
    }

    #hydrateServiceCharacteristics(): void {
        this.#setText('service-characteristics-title', this.#content.serviceCharacteristics.title);

        const list = document.getElementById('service-characteristics-list');
        if (!list) return;

        const itemsHtml = this.#content.serviceCharacteristics.items
            .map((item, index) => {
                const delay = index > 0 ? ` style="transition-delay: ${index * 40}ms;"` : '';
                return `
                    <li class="reveal flex items-start gap-3 bg-white rounded-xl border border-slate-100 p-4 shadow-sm"${delay}>
                        <span class="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">&#10003;</span>
                        <span class="text-sm text-slate-700 leading-relaxed">${item}</span>
                    </li>
                `;
            })
            .join('');

        list.innerHTML = itemsHtml;
    }

    #hydrateFlow(): void {
        this.#setText('flow-title', this.#content.flow.title);

        const container = document.getElementById('flow-steps');
        if (!container) return;

        const connectorHtml = `
            <div class="flow-connector hidden md:block absolute left-[16%] right-[16%] z-0" aria-hidden="true">
                <span class="flow-connector-line"></span>
                <span class="flow-connector-scan"></span>
                <span class="flow-connector-node flow-connector-node--start"></span>
                <span class="flow-connector-node flow-connector-node--mid"></span>
                <span class="flow-connector-node flow-connector-node--end"></span>
            </div>
        `;
        const stepsHtml = this.#content.flow.steps
            .map((step, index) => {
                const delay = index > 0 ? ` style="transition-delay: ${index * 100}ms;"` : '';
                return `
                    <div class="reveal flow-step-card relative z-10"${delay} data-flow-step="${index + 1}">
                        <article class="flow-step-shell h-full text-left">
                            <div class="flow-step-media">
                                <img class="flow-step-image" src="${step.imageSrc}" alt="${step.imageAlt}" loading="lazy" decoding="async">
                                <div class="flow-step-media-overlay" aria-hidden="true"></div>
                                <div class="flow-step-grid" aria-hidden="true"></div>
                                <span class="flow-step-chip">Paso 0${index + 1}</span>
                                <div class="flow-step-icon" aria-hidden="true">
                                    <i class="${step.iconClass}"></i>
                                </div>
                                <span class="flow-step-orb flow-step-orb--one" aria-hidden="true"></span>
                                <span class="flow-step-orb flow-step-orb--two" aria-hidden="true"></span>
                            </div>
                            <div class="flow-step-content">
                                <h3 class="text-xl font-bold text-slate-900 mb-2">${step.title}</h3>
                                <p class="text-slate-500 text-sm leading-relaxed">${step.description}</p>
                                <div class="flow-step-progress" aria-hidden="true">
                                    <span class="flow-step-progress-bar"></span>
                                </div>
                            </div>
                        </article>
                    </div>
                `;
            })
            .join('');

        container.innerHTML = `${connectorHtml}${stepsHtml}`;
    }

    #hydrateStats(): void {
        const container = document.getElementById('stats-grid');
        if (!container) return;

        const itemsHtml = this.#content.stats.items
            .map((item, index) => {
                const delay = index > 0 ? ` style="transition-delay: ${index * 100}ms;"` : '';
                return `
                    <div class="reveal p-4"${delay}>
                        <div class="text-4xl md:text-5xl font-bold text-white mb-2 flex justify-center gap-1">
                            <span class="counter" data-target="${item.target}" data-suffix="${item.suffix}">0</span>
                        </div>
                        <div class="text-sm text-accent-400 font-bold uppercase tracking-wider">${item.label}</div>
                    </div>
                `;
            })
            .join('');

        container.innerHTML = itemsHtml;
    }

    #hydrateFaq(): void {
        const container = document.getElementById('faq-list');
        if (!container) return;

        const faqHtml = this.#content.faq.items
            .map((item) => `
                <details class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 reveal cursor-pointer">
                    <summary class="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-slate-900">
                        <span>${item.question}</span>
                        <span class="transition group-open:rotate-180">
                            <i class="fa-solid fa-chevron-down text-brand-600"></i>
                        </span>
                    </summary>
                    <div class="text-slate-500 px-6 pb-6 text-sm leading-relaxed border-t border-slate-50 pt-4">
                        ${item.answer}
                    </div>
                </details>
            `)
            .join('');

        container.innerHTML = faqHtml;
    }

    #hydrateTicker(): void {
        const template = document.getElementById('ticker-content') as HTMLTemplateElement | null;
        if (!template) return;

        const items = this.#content.ticker.items
            .map((item) => `<span class="flex items-center gap-2"><i class="${item.iconClass}"></i> ${item.label}</span>`)
            .join('');

        template.innerHTML = `<div class="text-2xl font-bold text-slate-300 flex gap-16 items-center pr-16">${items}</div>`;
    }

    #renderTextList(listId: string, items: readonly string[]): void {
        const listEl = document.getElementById(listId);
        if (!listEl) return;

        listEl.innerHTML = '';
        items.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'hover:text-white transition';
            li.textContent = item;
            listEl.appendChild(li);
        });
    }

    #hydrateFooter(): void {
        this.#setText('footer-intro', this.#content.footer.intro);
        this.#setText('footer-company-heading', this.#content.footer.companyHeading);
        this.#setText('footer-coverage-heading', this.#content.footer.coverageHeading);
        this.#setText('footer-contracts-heading', this.#content.footer.contractsHeading);
        this.#setText('footer-contracts-description', this.#content.footer.contractsDescription);
        this.#setHtml('footer-copyright', this.#content.footer.copyright);
        this.#renderFooterSignoff();
        this.#renderTextList('footer-company-list', this.#content.footer.companyItems);
        this.#renderTextList('footer-coverage-list', this.#content.footer.coverageItems);
    }

    #renderFooterSignoff(): void {
        const signoff = document.getElementById('footer-signoff');
        if (!signoff) return;

        signoff.innerHTML = '';
        this.#content.footer.signoff.forEach((item) => {
            const span = document.createElement('span');
            span.textContent = item;
            signoff.appendChild(span);
        });
    }
}

