import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InformationService } from 'src/app/shared/helpers/information.service';
import { UsuarioClienteRegistro } from 'src/app/shared/models/usuario.model';
import { UsuariosService } from 'src/app/shared/services/usuarios.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
})
export class RegisterComponent {
    valCheck: string[] = ['remember'];
    password!: string;
    userForm!: FormGroup;
    submited = false;
    cancelClicked = false;
    habilitado: Boolean = false;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private usuarioService: UsuariosService,
        private informationService: InformationService,
    ) {}

    ngOnInit(): void {
        this.userForm = this.fb.group({
            nombre: ['', Validators.required],
            paterno: ['', Validators.required],
            ci: ['', Validators.required],
            email: ['', [Validators.email, Validators.required]],
            password1: ['', Validators.required]
        });
    }

    public onCancel(): void {
        this.cancelClicked = true;
    }

    public onRegister(): void {
        this.cancelClicked = false;
    }

    showResponse(event: any) {
        this.habilitado = true;
    }

    public onSubmit(): void {
        if (this.cancelClicked) {
            this.router.navigate(['']);
        } else {
            if (!this.userForm.valid) {
                this.informationService.showWarning('Verifique los datos');
                return;
            }

            if (this.userForm.controls['ci'].value.length<5) {
                this.informationService.showWarning('El ci es inválido');
                return;
            }

            const password1 = this.userForm.controls['password1'].value;

            if (password1==this.userForm.controls['email'].value) {
                this.informationService.showWarning('El password no puede ser igual que el email');
                return;
            }

            this.submited = true;
            const user: UsuarioClienteRegistro = {
                nombre: this.userForm.controls['nombre'].value,
                paterno: this.userForm.controls['paterno'].value,
                ci: this.userForm.controls['ci'].value,
                email: this.userForm.controls['email'].value,
                password: this.userForm.controls['password1'].value,
            };

            this.usuarioService.addClientUser(user).subscribe({
                next: (res) => {
                    this.informationService.showSuccess(res.message);
                    this.router.navigate(['/auth/login']);
                },
                error: (err) => {
                    this.informationService.showError(err.error.message);
                    this.submited = false;
                },
            });
        }
    }

}
