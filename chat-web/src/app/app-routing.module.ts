/**
 * アプリのルートルーティングモジュール。
 *
 * @module ./app/app-routing.module
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TopComponent } from './top/top.component';
import { RoomComponent } from './rooms/room.component';

/** ルート定義 */
const routes: Routes = [
  { path: '', pathMatch: 'full', component: TopComponent },
  { path: 'rooms/:id', component: RoomComponent },
];

/**
 * アプリのルートルーティングモジュールクラス。
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
