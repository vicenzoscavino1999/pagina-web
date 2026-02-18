export class Ticker {
    #container: HTMLElement | null;
    #template: HTMLTemplateElement | null;

    constructor() {
        this.#container = document.getElementById('ticker-container');
        this.#template = document.getElementById('ticker-content') as HTMLTemplateElement;
    }

    init(): void {
        if (!this.#container || !this.#template) return;

        void document.fonts.ready.then(() => {
            if (!this.#container || !this.#template) return;
            const content = this.#template.content.cloneNode(true);
            this.#container.appendChild(content);

            const clone = this.#template.content.cloneNode(true);
            this.#container.appendChild(clone);
        });
    }

    destroy(): void {
        if (this.#container) {
            this.#container.innerHTML = '';
        }
    }
}

