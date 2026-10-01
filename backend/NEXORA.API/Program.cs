using NEXORA.Application.Interfaces;
using NEXORA.Application.UseCases;
using NEXORA.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<
    NEXORA.Application.IUsuarioRepository,
    NEXORA.Infrastructure.UsuarioRepositoryMemoria>();
builder.Services.AddScoped<NEXORA.Application.UsuarioService>();
builder.Services.AddScoped<NEXORA.Application.IProductoRepository, NEXORA.Infrastructure.ProductoRepositoryMemoria>();
builder.Services.AddScoped<NEXORA.Application.ProductoService>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

builder.Services.AddSingleton<IRepositorioCarrito, RepositorioCarritoMemoria>();
builder.Services.AddScoped<AgregarArticuloAlCarrito>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("PermitirAngular");
app.MapControllers();

app.Run();