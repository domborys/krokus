using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using krokus_api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using krokus_api.Services;
using krokus_api.Models;
using Microsoft.AspNetCore.Identity;
using System;
using Microsoft.OpenApi.Models;
using krokus_api.Consts;
using NetTopologySuite.IO.Converters;
using NetTopologySuite;
using krokus_api.AuthHandlers;
using Microsoft.AspNetCore.Authorization;
//using krokus_api.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ObservationContext") ?? throw new InvalidOperationException("Connection string 'ObservationContext' not found."),
    x => x.UseNetTopologySuite()));

builder.Services.AddIdentity<User, IdentityRole>()
    .AddRoles<IdentityRole>()
    .AddRoleManager<RoleManager<IdentityRole>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();


// Add services to the container.
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IObservationService, ObservationService>();
builder.Services.AddScoped<IConfirmationService, ConfirmationService>();
builder.Services.AddScoped<IPictureService, PictureService>();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // this constructor is overloaded.  see other overloads for options.
        var geoJsonConverterFactory = new GeoJsonConverterFactory();
        options.JsonSerializerOptions.Converters.Add(geoJsonConverterFactory);
    });
builder.Services.AddSingleton(NtsGeometryServices.Instance);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(Policies.HasUserRights, policy => policy.RequireRole(Roles.User, Roles.Moderator, Roles.Admin));
    options.AddPolicy(Policies.HasModeratorRights, policy => policy.RequireRole(Roles.Moderator, Roles.Admin));
    options.AddPolicy(Policies.HasAdminRights, policy => policy.RequireRole(Roles.Admin));
    options.AddPolicy(Policies.IsAuthorOrHasModeratorRights, policy => policy.Requirements.Add(new SameUserRequirement() { 
        AlwaysAllowedRoles = new List<string> { Roles.Moderator, Roles.Admin }
    }));
});

builder.Services.AddScoped<IAuthorizationHandler, ResourceWithUserIdAuthorizationHandler>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();


//builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Krokus API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header using the Bearer scheme. \r\n\r\n 
                      Enter 'Bearer' [space] and then your token in the text input below.
                      \r\n\r\nExample: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,

            },
            new List<string>()
        }
    });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    //app.UseExceptionHandler("/api/ErrorDevelopment");
}
else
{
    app.UseExceptionHandler("/api/Error");
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    var userService = services.GetRequiredService<IUserService>();
    await userService.CreateRoles();
    await userService.CreateAdminIfDoesntExist();
}

app.Run();
