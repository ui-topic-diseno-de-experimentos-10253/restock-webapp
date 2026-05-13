import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.css'
})
export class LanguageSwitcher {
  currentLang = 'en';

  constructor(private translate: TranslateService) {
    const storedLang = localStorage.getItem('lang') || 'en';
    this.translate.use(storedLang);
    this.currentLang = storedLang;
  }

  useLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.currentLang = lang;
  }

  toggleLanguage() {
    const nextLang = this.currentLang === 'en' ? 'es' : 'en';
    this.useLanguage(nextLang);
  }

}
