/**
 * @file WebSocketサンプルChatアプリルートコンポーネント。
 */
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import browserHelper from './core/browser-helper';
import { EnvService } from './core/env.service';

/**
 * WebSocketサンプルChatアプリルートコンポーネントクラス。
 */
@Component({
	selector: 'app-root',
	templateUrl: 'app/app.component.html',
})
export class AppComponent {
	/** 環境情報 */
	environment: string;

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param translate 国際化サービス。
	 * @param envService システム設定サービス。
	 */
	constructor(
		private translate: TranslateService,
		private envService: EnvService) { }

	/**
	 * コンポーネント起動時の処理。
	 */
	async ngOnInit(): Promise<void> {
		// アプリで使用する言語を設定
		this.translate.setDefaultLang('en');
		this.translate.use(browserHelper.getLanguage());

		// システム設定を読み込む。バージョン等はローカライズ設定に動的にマージする
		const env = await this.envService.env();
		this.environment = env.environment;
		for (let lang in this.translate.getLangs()) {
			this.translate.setTranslation(lang, {
				VERSION: env.version,
			}, true);
		}
	}
}
