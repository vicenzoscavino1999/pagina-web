export class ContentDomWriter {
    #root: Document;

    constructor(root: Document = document) {
        this.#root = root;
    }

    getById(id: string): HTMLElement | null {
        return this.#root.getElementById(id);
    }

    setText(id: string, value: string): void {
        const el = this.getById(id);
        if (el) {
            el.textContent = value;
        }
    }

    setHtml(id: string, value: string): void {
        const el = this.getById(id);
        if (el) {
            el.innerHTML = value;
        }
    }

    setHref(id: string, href: string): void {
        const el = this.getById(id);
        if (el && el instanceof HTMLAnchorElement) {
            el.href = href;
        }
    }

    setAttribute(id: string, name: string, value: string): void {
        const el = this.getById(id);
        if (el) {
            el.setAttribute(name, value);
        }
    }

    replaceTextList(listId: string, items: readonly string[], itemClassName: string): void {
        const listEl = this.getById(listId);
        if (!listEl) return;

        listEl.innerHTML = '';
        items.forEach((item) => {
            const li = this.#root.createElement('li');
            li.className = itemClassName;
            li.textContent = item;
            listEl.appendChild(li);
        });
    }
}
