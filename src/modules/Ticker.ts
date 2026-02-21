export class Ticker {
    #container: HTMLElement | null;
    #template: HTMLTemplateElement | null;
    #isMounted = false;
    #isDestroyed = false;

    constructor() {
        this.#container = document.getElementById('ticker-container');
        this.#template = document.getElementById('ticker-content') as HTMLTemplateElement;
    }

    init(): void {
        if (!this.#container || !this.#template || this.#isMounted) return;
        this.#isDestroyed = false;

        void document.fonts.ready.then(() => {
            if (!this.#container || !this.#template || this.#isMounted || this.#isDestroyed) return;
            const content = this.#template.content.cloneNode(true);
            this.#container.appendChild(content);

            const clone = this.#template.content.cloneNode(true);
            this.#container.appendChild(clone);
            this.#isMounted = true;
        });
    }

    destroy(): void {
        this.#isDestroyed = true;
        this.#isMounted = false;
        if (this.#container) {
            this.#container.innerHTML = '';
        }
    }
}

