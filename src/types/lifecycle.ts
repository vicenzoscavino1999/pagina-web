export interface Destroyable {
    destroy(): void;
}

export interface Initializable {
    init(): void;
}

export type AppModule = Destroyable & Partial<Initializable>;
