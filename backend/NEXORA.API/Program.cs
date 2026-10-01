using NEXORA.Application.Interfaces;
using NEXORA.Application.UseCases;
using NEXORA.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddCors(options => options.AddPolicy("Angular", policy =>
    policy.WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod()));

builder.Services.AddSingleton<IRepositorioCarrito, RepositorioCarritoMemoria>();
builder.Services.AddScoped<AgregarArticuloAlCarrito>();

var app = builder.Build();

if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.UseHttpsRedirection();
app.UseCors("Angular");
app.MapControllers();
app.Run();
