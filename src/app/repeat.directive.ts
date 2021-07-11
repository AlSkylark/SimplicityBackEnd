import { ViewContainerRef } from '@angular/core';
import { Input } from '@angular/core';
import { TemplateRef } from '@angular/core';
import { Directive } from '@angular/core';

@Directive({
  selector: '[appRepeat]'
})
export class RepeatDirective {
  range: number[];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }

  @Input() 
  set appRepeat(num: number[]){
    this.viewContainer.clear();
    this.range = this.generateRange(num[0],num[1]);

    this.range.forEach(num =>{
      this.viewContainer.createEmbeddedView(this.templateRef, {$implicit: num})
    });
    
   }

   generateRange(from: number, to: number): number[] {
    let rng: number[] = [];
    for(let i=from; i < from + to; i++){
      rng.push(i);
    }
    return rng;
   }

}
