import { vi } from 'vitest';

// Mock IntersectionObserver
const IntersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
}));

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// Mock window.scrollTo
vi.stubGlobal('scrollTo', vi.fn());

// Mock Element.prototype.scrollIntoView
Element.prototype.scrollIntoView = vi.fn();
