using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using PharmacyManagementAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        // It tells C# to ignore Case-Sensitivity when reading your data// this made me crying and confused for 2 hours, I thought it was a problem with my React code but it was just C# being mean and not accepting the camelCase data from React
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Paymob Service
builder.Services.AddHttpClient<PaymobService>();


builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",   // React dev server (http)
                "https://localhost:3000"   // React dev server (https)
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});




var app = builder.Build();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        var message = exception?.InnerException?.Message ?? exception?.Message ?? "An unexpected server error occurred.";
        Console.Error.WriteLine($"Unhandled API error: {message}");
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { message = $"Server error: {message}" });
    });
});

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApiDbContext>();

    var pendingMigrations = db.Database.GetPendingMigrations();

    if (pendingMigrations.Any())
    {
        db.Database.Migrate();
    }

    DbSeeder.Seed(db);
}
// 2. Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseAuthorization();
app.MapControllers();
app.Run();
