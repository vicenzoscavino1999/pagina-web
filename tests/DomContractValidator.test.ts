import { beforeEach, describe, expect, it } from 'vitest';
import { assertCriticalDomContract } from '../src/app/DomContractValidator';
import { DomContractError } from '@utils/dom';

describe('DomContractValidator', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('ignora DOM vacio en tests', () => {
        expect(() => assertCriticalDomContract()).not.toThrow();
    });

    it('permite validar una sola seccion critica', () => {
        document.body.innerHTML = `
            <a id="skip-to-content" href="#main-content"></a>
            <nav id="navbar"></nav>
            <main id="main-content">
                <section id="hero-section">
                    <div id="hero-layout">
                        <div id="hero-copy"></div>
                    </div>
                </section>
            </main>
        `;

        expect(() => assertCriticalDomContract(document, ['shell', 'hero'])).not.toThrow();
    });

    it('falla con detalle cuando falta una regla critica', () => {
        document.body.innerHTML = `
            <nav id="navbar"></nav>
            <section id="hero-section">
                <div id="hero-layout"></div>
            </section>
        `;

        expect(() => assertCriticalDomContract(document, ['hero'])).toThrow(DomContractError);
        expect(() => assertCriticalDomContract(document, ['hero'])).toThrow('#hero-copy');
    });
});
