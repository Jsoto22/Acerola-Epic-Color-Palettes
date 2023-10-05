import { Component, TemplateRef } from '@angular/core';

import { ToastService } from './toast.service';

@Component({
	selector: 'app-toasts',
	templateUrl: './toast.component.html',
	host: { class: 'toast-container position-fixed bottom-0 d-flex flex-column align-items-center p-3', style: 'z-index: 1200; width: 100vw;' },
})
export class ToastsContainer {
	constructor(public toastService: ToastService) {}

	isTemplate(toast: { textOrTpl: any; }) {
		return toast.textOrTpl instanceof TemplateRef;
	}
}