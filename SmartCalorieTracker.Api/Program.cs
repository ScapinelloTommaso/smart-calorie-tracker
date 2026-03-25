using Microsoft.EntityFrameworkCore;
using SmartCalorieTracker.Api.Data;
using SmartCalorieTracker.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Aggiungiamo il supporto ai Controllers (FONDAMENTALE)
builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SmartCalorieTracker API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Inserisci 'Bearer' [spazio] e poi il tuo token JWT",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// 2. Registrazione del Database SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptionsAction: sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        }));

// 3. Registrazione del Servizio AI e Auth
builder.Services.AddHttpClient();
builder.Services.AddScoped<IFoodProcessingService, FoodProcessingService>();
builder.Services.AddScoped<IDiaryService, DiaryService>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddCors(options => { options.AddPolicy("AllowAll", policy => { policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader(); }); });

var app = builder.Build();

// 4. Configurazione della pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// 5. Mappiamo i Controllers (FONDAMENTALE)
app.MapControllers(); 

// --- FIX: CREAZIONE UTENTE FAKE PER IL TESTING ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var dummyUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    
    // Se l'utente non esiste nel database, lo creiamo!
    if (!db.Users.Any(u => u.Id == dummyUserId))
    {
        db.Users.Add(new SmartCalorieTracker.Api.Models.User 
        { 
            Id = dummyUserId, 
            Username = "TestUser", 
            DailyCalorieGoal = 2000, 
            DailyProteinGoal = 150 
        });
        db.SaveChanges();
    }
}

app.Run(); 