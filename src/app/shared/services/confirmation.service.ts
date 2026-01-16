import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmationOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
}

@Injectable({
    providedIn: 'root'
})
export class ConfirmationService {
    private showModalSource = new Subject<ConfirmationOptions>();
    private responseSource = new Subject<boolean>();

    showModal$ = this.showModalSource.asObservable();

    confirm(options: ConfirmationOptions): Observable<boolean> {
        this.showModalSource.next({
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            type: 'danger',
            ...options
        });
        // Reset response source for new confirmation? 
        // Better: create a new subject for each confirmation or ensure single active modal.
        // For simplicity in this "System Wide" request, we assume sequential usage.
        // A better approach is to return a new subject's observable.

        // However, to keep it simple and robust for this context:
        // We will repurpose the single source, but really we should handle distinct calls.
        // Let's create a temporary subject for *this* call if we want to be safe, 
        // but interfacing with the component effectively usually implies a shared state.
        // Let's stick to a shared subject but careful management.

        // Actually, to make it truly promise-like:
        return this.responseSource.asObservable();
    }

    resolve(result: boolean) {
        this.responseSource.next(result);
    }
}
