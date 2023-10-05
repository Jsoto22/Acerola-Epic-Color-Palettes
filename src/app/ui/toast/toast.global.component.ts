import { Component, OnDestroy, TemplateRef } from '@angular/core';

import { ToastService } from './toast.service';

@Component({ selector: 'ngbd-toast-global', templateUrl: './toast.global.component.html' })
export class NgbdToastGlobal implements OnDestroy {
	constructor(public toastService: ToastService) {}

	ngOnDestroy(): void {
		this.toastService.clear();
	}
}