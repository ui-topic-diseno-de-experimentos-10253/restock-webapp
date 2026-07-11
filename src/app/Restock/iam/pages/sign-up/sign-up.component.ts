import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthenticationService } from '../../services/authentication.service';
import { SignUpRequest } from "../../model/sign-up.request";
import { MatError } from "@angular/material/form-field";
import { MatButton } from "@angular/material/button";
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { BaseFormComponent } from '../../../../shared/components/base-form.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatError,
    MatButton,
    MatIcon,
    NgIf,
    RouterLink
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent extends BaseFormComponent implements OnInit {
  form!: FormGroup;
  submitted: boolean = false;
  hidePassword = true;
  heroImage = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1920&q=80';

  onHeroImageError(): void {
    this.heroImage = 'assets/imagen-principal.png';
  }

  constructor(
    private builder: FormBuilder,
    private authenticationService: AuthenticationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = this.builder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required]  // ← role es un string plano
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password, role } = this.form.value;

    const signUpRequest = new SignUpRequest(username, password, role);
    this.authenticationService.signUp(signUpRequest);
    this.submitted = true;
  }

  selectRole(roleId: number) {
    this.form.get('role')!.setValue(roleId);
  }
}
