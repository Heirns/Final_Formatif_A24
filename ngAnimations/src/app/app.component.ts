import { transition, trigger, useAnimation } from '@angular/animations';
import { Component } from '@angular/core';
import { bounce, shake, shakeX, tada } from 'ng-animate';
import { lastValueFrom, timer } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    animations:[
      trigger("shake", [transition(":increment", useAnimation(shake))]),
      trigger("bounce", [transition(":increment", useAnimation(bounce))]),
      trigger("tada", [transition(":increment", useAnimation(tada))]),
    ],
    styleUrls: ['./app.component.css'],
    standalone: true
})
export class AppComponent {
  title = 'ngAnimations';

  red:number = 0;
  green:number = 0;
  blue:number = 0;

  loop:boolean = false;

  rotate:boolean = false;

  constructor() {
  }

  async animate(){
    this.red++;
    await this.waitFor(2);
    this.green++
    await this.waitFor(4);
    this.blue++;
    await this.waitFor(3);

    if (this.loop) await this.animate();
  }

  async ToggleAnimate(){
    this.loop = !this.loop
    await this.animate();
  }

  async Rotate(){
    this.rotate = true;
    await this.waitFor(2);
    this.rotate = false;
  }

  async waitFor(delayInSeconds:number) {
    await lastValueFrom(timer(delayInSeconds * 1000));
  }
}
