import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { AboutComponent } from './component/about/about.component';
import { TableComponent } from './component/table/table.component';
import { ListComponent } from './features/list/list.component';

export const routes: Routes = [
    {
        path: "",
        component: HomeComponent
    },
    {
        path: "about",
        component: AboutComponent
    },
    {
        path: "list",
        component: ListComponent
    }
];
