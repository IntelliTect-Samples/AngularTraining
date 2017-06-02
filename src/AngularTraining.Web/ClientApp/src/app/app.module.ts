import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MyAppComponent } from './_components/my-app/my-app.component';

@NgModule({
    imports: [
        BrowserModule
    ],
    bootstrap: [MyAppComponent],
    declarations: [
        MyAppComponent
    ]
})
export class AppModule { }