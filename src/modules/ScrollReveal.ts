export class ScrollReveal {
    #observer: IntersectionObserver;

    constructor() {
        this.#observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    this.#observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });
    }

    init(): void {
        const elements = document.querySelectorAll('.reveal');
        elements.forEach(el => this.#observer.observe(el));
    }

    destroy(): void {
        this.#observer.disconnect();
    }
}

