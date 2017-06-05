import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './_components/nav-bar/nav-bar.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [NavBarComponent],
  exports: [NavBarComponent]
})
export class NavBarModule { }
