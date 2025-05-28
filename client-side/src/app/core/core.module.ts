import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
 import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';


@NgModule({
  declarations: [
    LoadingOverlayComponent
  ],
  imports: [
    CommonModule,
    
  ],
  providers: [
    AuthGuard,
    AuthService
    // Singleton services, guards, interceptors will be provided here later
    // e.g., AuthService, AuthGuard, RoleGuard, AuthInterceptor
  ],
  exports: [
    LoadingOverlayComponent // Export it for AppModule to use
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule?: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}