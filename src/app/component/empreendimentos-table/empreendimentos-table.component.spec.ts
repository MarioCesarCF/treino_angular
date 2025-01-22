import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpreendimentosTableComponent } from './empreendimentos-table.component';

describe('EmpreendimentosTableComponent', () => {
  let component: EmpreendimentosTableComponent;
  let fixture: ComponentFixture<EmpreendimentosTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpreendimentosTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmpreendimentosTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
