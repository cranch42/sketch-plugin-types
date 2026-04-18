declare module 'sketch/async' {
    /**
     * Keeps the plugin's JS context alive across async work. Create a fiber
     * before starting an asynchronous operation and call `cleanup()` when the
     * work is done; register teardown work via `onCleanup()` so that Sketch
     * can reclaim resources even if it tears the fiber down itself.
     */
    export interface Fiber {
        cleanup(): void;
        onCleanup(handler: () => void): void;
    }

    export function createFiber(): Fiber;
}
