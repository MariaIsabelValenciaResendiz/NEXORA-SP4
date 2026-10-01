import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { NuevoProducto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';

function noSoloEspacios(
  control: AbstractControl
): ValidationErrors | null {
  const valor = control.value;

  if (typeof valor === 'string' && valor.trim().length === 0) {
    return { soloEspacios: true };
  }

  return null;
}

@Component({
  selector: 'app-producto-crear',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
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

      titulo: [
        '',
        [
          Validators.required,
          noSoloEspacios
        ]
      ],

      precio: [
        0,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],

      descripcion: [
        '',
        [
          Validators.required,
          noSoloEspacios
        ]
      ],

      imagenUrl: [
        '',
        [
          Validators.required,
          noSoloEspacios,
          Validators.pattern(/^https?:\/\/.+/i)
        ]
      ],

      categoria: [
        '',
        [
          Validators.required,
          noSoloEspacios
        ]
      ]
    });
  }

  registrar(): void {

    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();

    const producto: NuevoProducto = {
      titulo: valores.titulo.trim(),
      precio: valores.precio,
      descripcion: valores.descripcion.trim(),
      imagenUrl: valores.imagenUrl.trim(),
      categoria: valores.categoria.trim()
    };

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