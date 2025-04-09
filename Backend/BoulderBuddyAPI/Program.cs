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

            var app = builder.Build();

            //add Swagger middleware for development environment
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors(options => options.AllowAnyOrigin().AllowAnyMethod());
            app.UseHttpsRedirection();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
