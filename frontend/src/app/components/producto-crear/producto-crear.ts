import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { NuevoProducto } from '../../models/producto.model';

@Component({
  selector: 'app-producto-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-crear.html',
  styleUrl: './producto-crear.scss'
})
export class ProductoCrear {
  mensajeExito = '';
  mensajeError = '';
  cargando = false;

  formulario;

  constructor(
    private formBuilder: FormBuilder,
    private productoService: ProductoService
  ) {
    this.formulario = this.formBuilder.nonNullable.group({
      titulo: ['', Validators.required],

      precio: [
        0,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],

      descripcion: ['', Validators.required],

      imagenUrl: [
        '',
        [
          Validators.required,
          Validators.pattern(/^https?:\/\/.+/i)
        ]
      ],

      categoria: ['', Validators.required]
    });
  }

  registrar(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const producto: NuevoProducto = this.formulario.getRawValue();

    this.cargando = true;

    this.productoService.registrar(producto).subscribe({
      next: (productoRegistrado) => {
        this.cargando = false;

        this.mensajeExito =
          `Producto registrado correctamente. ID: ${productoRegistrado.id}`;

        this.formulario.reset({
          titulo: '',
          precio: 0,
          descripcion: '',
          imagenUrl: '',
          categoria: ''
        });
      },

      error: () => {
        this.cargando = false;
        this.mensajeError =
          'No fue posible registrar el producto. Intenta nuevamente.';
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }
}