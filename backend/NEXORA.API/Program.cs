var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<NEXORA.Application.IUsuarioRepository, NEXORA.Infrastructure.UsuarioRepositoryMemoria>();
builder.Services.AddScoped<NEXORA.Application.UsuarioService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("PermitirAngular");
app.MapControllers();

app.Run();