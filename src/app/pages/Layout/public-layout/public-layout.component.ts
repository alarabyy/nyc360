import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { NavBarComponent } from "../../Public/Widgets/nav-bar/nav-bar.component";
import { FooterComponent } from "../../Public/Widgets/footer/footer.component";

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, FooterComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent {

}
