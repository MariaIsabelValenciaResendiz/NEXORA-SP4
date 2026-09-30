using NEXORA.Application.Interfaces;
using NEXORA.Application.UseCases;
using NEXORA.Infrastructure.Repositories;
using NEXORA.API.Authentication;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<NEXORA.Infrastructure.UsuarioRepositoryMemoria>();
builder.Services.AddSingleton<NEXORA.Application.IUsuarioRepository>(services =>
    services.GetRequiredService<NEXORA.Infrastructure.UsuarioRepositoryMemoria>());
builder.Services.AddSingleton<IConsultaUsuarios>(services =>
    services.GetRequiredService<NEXORA.Infrastructure.UsuarioRepositoryMemoria>());
builder.Services.AddSingleton<IAccesoUsuarios>(services =>
    services.GetRequiredService<NEXORA.Infrastructure.UsuarioRepositoryMemoria>());
builder.Services.AddScoped<NEXORA.Application.UsuarioService>();
builder.Services.AddScoped<IListarUsuarios, ListarUsuarios>();

builder.Services.AddAuthentication()
    .AddScheme<AuthenticationSchemeOptions, UsuariosBasicHandler>(UsuariosBasicHandler.NombreEsquema, _ => { });
builder.Services.AddAuthorization();

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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
