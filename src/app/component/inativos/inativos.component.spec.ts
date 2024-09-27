import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InativosComponent } from './inativos.component';

describe('InativosComponent', () => {
  let component: InativosComponent;
  let fixture: ComponentFixture<InativosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InativosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InativosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
