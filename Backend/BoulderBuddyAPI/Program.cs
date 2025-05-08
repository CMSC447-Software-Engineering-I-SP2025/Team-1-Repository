using BoulderBuddyAPI.Models;
using BoulderBuddyAPI.Services;

namespace BoulderBuddyAPI
{
    public class Program
    {
        public static async Task Main(string[] args)
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
            using var scope = app.Services.CreateScope();
            var dbInitializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
            dbInitializer.Initialize();

            //cache nearby states if they're not yet cached by calling search
            var obqs = scope.ServiceProvider.GetRequiredService<IOpenBetaQueryService>();
            await obqs.QuerySubAreasInArea("Maryland");
            await obqs.QuerySubAreasInArea("Delaware");
            await obqs.QuerySubAreasInArea("Pennsylvania");
            await obqs.QuerySubAreasInArea("Virginia");
            await obqs.QuerySubAreasInArea("West Virginia");

            //cache the rest of the Eastern US without blocking the app from starting
            CacheEasternUS(obqs);

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

        //caches the rest of Eastern US, ordered by proximity to MD, with a 7 second delay between OpenBeta queries
        private static async Task CacheEasternUS(IOpenBetaQueryService obqs)
        {
            //ordered by distance to MD according to Microsoft Copilot. Order is irrelevant though
            string[] eastOfTheMississippi = ["New Jersey", "New York", "Ohio", "North Carolina", "Connecticut",
                    "Massachusetts", "Rhode Island", "Vermont", "New Hampshire", "Maine", "Kentucky", "Indiana",
                    "Tennessee", "Michigan", "Illinois", "South Carolina", "Georgia", "Alabama", "Florida", "Wisconsin"];

            foreach (var state in eastOfTheMississippi)
            {
                var watch = System.Diagnostics.Stopwatch.StartNew();
                await obqs.QuerySubAreasInArea(state);
                watch.Stop();

                //offset OpenBeta requests by 7 seconds (when they didn't cache hit)
                if (watch.ElapsedMilliseconds > 500)
                    await Task.Delay(7000);
            }
        }
    }
}
