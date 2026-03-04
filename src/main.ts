import { App } from './app/App';
import { installRuntimeMonitor } from './app/runtimeMonitor';
import { installWebVitalsMonitor } from './app/webVitalsMonitor';

const clearStalePwaCachesInDev = (): void => {
    if (!import.meta.env.DEV) return;
    if (!('serviceWorker' in navigator)) return;
    if (!('caches' in window)) return;

    window.addEventListener(
        'load',
        () => {
            void navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((registration) => {
                    void registration.unregister();
                });
            });

            void caches.keys().then((keys) => {
                keys.forEach((key) => {
                    void caches.delete(key);
                });
            });
        },
        { once: true }
    );
};

clearStalePwaCachesInDev();
installRuntimeMonitor();
installWebVitalsMonitor();

const app = new App();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init(), { once: true });
} else {
    app.init();
}
