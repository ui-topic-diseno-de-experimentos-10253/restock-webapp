import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';

import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../model/profile.entity';
import {Business} from '../../model/business.entity';
import {ThisReceiver} from '@angular/compiler';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-business-data-settings',
  imports: [
    MatButton,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelect,
    MatOption,
    MatChipsModule,
    NgForOf,
    FormsModule,
    MatIcon,
    TranslatePipe
  ],
  templateUrl: './business-data-settings.component.html',
  styleUrl: './business-data-settings.component.css'
})

export class BusinessDataSettingsComponent implements OnChanges {
  @Input() business: Business = new Business();
  @Input() currentCategories: string[] = [];
  @Input() categoriesOptions: string[] = [];
  @Input() refreshTrigger: number = 0;

  localBusiness = {
    name: '',
    address: '',
    categories: '',
    phone: '',
    email: '',
    description: ''
  }

  selectedCategories: string[] = [];

  @Output() profileAndBusinessUpdated: EventEmitter<Business> = new EventEmitter<Business>();

  removeCategory(category: string) {
    this.selectedCategories = this.selectedCategories.filter(c => c !== category);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['business'] && changes['business'].currentValue) || 
        (changes['refreshTrigger'] && changes['refreshTrigger'].currentValue)) {
      this.localBusiness = {
        name: this.business.name,
        address: this.business.address,
        categories: this.business.categories,
        phone: this.business.phone,
        email: this.business.email,
        description: this.business.description || ''
      };

      this.selectedCategories = this.currentCategories;
    }

  }

  onSaveChanges() {
    console.log('DEBUG BusinessDataSettings - onSaveChanges called');
    console.log('DEBUG BusinessDataSettings - this.business:', this.business);
    console.log('DEBUG BusinessDataSettings - this.localBusiness:', this.localBusiness);

    this.localBusiness.categories = this.selectedCategories.join(', ');

    const updatedBusiness = {
      id: this.business.id,
      name: this.localBusiness.name,
      address: this.localBusiness.address,
      categories: this.localBusiness.categories,
      phone: this.localBusiness.phone,
      email: this.localBusiness.email,
      description: this.localBusiness.description
    };

    console.log('DEBUG BusinessDataSettings - updatedBusiness:', updatedBusiness);
    this.profileAndBusinessUpdated.emit(updatedBusiness);
  }
}

