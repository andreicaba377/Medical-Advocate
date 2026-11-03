using MedicalAdvocate.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient();
builder.Services.AddScoped<IPiiAnonymizerService, PiiAnonymizerService>();
builder.Services.AddScoped<IMedicalAiService, MedicalAiService>();

// 1. Definim regula CORS pentru Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Portul aplicației React
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 2. Activăm regula CORS (trebuie să fie înainte de MapControllers)
app.UseCors("AllowReactApp");

app.MapControllers();
app.Run();