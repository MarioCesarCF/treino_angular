import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

type BtnVariants = "primary" | "secondary";

@Component({
  selector: 'btn-primary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './btn-primary.component.html',
  styleUrl: './btn-primary.component.css'
})
export class BtnPrimaryComponent {
  //O input é o texto do button já o output é a função submit.
  //Não entendi bem pq no input o btnText é usado no html e já a função é chamada como submit em vez de onSubmit
  @Input("btn-text") btnText: string = "";
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() variant: BtnVariants = "primary";

  @Output("submit") onSubmit = new EventEmitter();  

  submit() {
    this.onSubmit.emit();
  }
}
