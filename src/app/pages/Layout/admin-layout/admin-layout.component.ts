import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from "../../Dashboard/Widgets/nav-bar/nav-bar.component";
import { ToastComponent } from "../../../shared/components/toast/toast.component";

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, NavBarComponent, ToastComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  isSidebarOpen = true; // الشريط الجانبي مفتوح دائمًا في لوحة التحكم

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
