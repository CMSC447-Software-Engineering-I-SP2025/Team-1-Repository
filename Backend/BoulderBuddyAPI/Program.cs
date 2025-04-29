using BoulderBuddyAPI.Models;
using BoulderBuddyAPI.Services;

namespace BoulderBuddyAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();

            //Swagger/OpenAPI developer UI page (see https://aka.ms/aspnetcore/swashbuckle)
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            //direct inject appsettings sections
            builder.Services.AddSingleton(builder.Configuration.GetSection("OpenBetaConfig")
                .Get<OpenBetaConfig>());
            builder.Services.AddSingleton(builder.Configuration.GetSection("GradeRanges")
                .Get<GradeRangesConfig>());

            //direct inject connection service for making queries to OpenBeta API
            builder.Services.AddHttpClient<IOpenBetaQueryService, OpenBetaQueryService>(client =>
            {
                client.BaseAddress = new Uri(builder.Configuration.GetSection("OpenBetaConfig")["OpenBetaEndpoint"]);
            });

            //Add database service
            builder.Services.AddSingleton<DatabaseInitializer>();
            builder.Services.AddScoped<DatabaseService>();
            builder.Services.AddScoped<IDatabaseService, DatabaseService>();

            var app = builder.Build();

            // Initialize the database, cache OpenBeta results for MD and adjacent states
            using (var scope = app.Services.CreateScope())
            {
                var dbInitializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
                dbInitializer.Initialize();

                //cache nearby states if they're not yet cached by calling search
                var obqs = scope.ServiceProvider.GetRequiredService<IOpenBetaQueryService>();
                obqs.QuerySubAreasInArea("Maryland").Wait();
                obqs.QuerySubAreasInArea("Delaware").Wait();
                obqs.QuerySubAreasInArea("Pennsylvania").Wait();
                obqs.QuerySubAreasInArea("Virginia").Wait();
                obqs.QuerySubAreasInArea("West Virginia").Wait();
            }

            //add Swagger middleware for development environment
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors(options => options.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

            app.UseHttpsRedirection();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
