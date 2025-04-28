using BoulderBuddyAPI.Models;
using BoulderBuddyAPI.Models.OpenBetaModels;

namespace BoulderBuddyAPI.Services
{
    public class OpenBetaQueryService : IOpenBetaQueryService
    {
        private readonly ILogger<OpenBetaQueryService> _logger;
        private readonly HttpClient _httpClient;

        private readonly string[] _supportedRootAreas;

        public OpenBetaQueryService(ILogger<OpenBetaQueryService> logger, HttpClient httpClient, OpenBetaConfig config)
        {
            _logger = logger;
            _httpClient = httpClient;
            _supportedRootAreas = config.SupportedRootAreas;
        }

        //query OpenBeta API for subareas in given root area
        public async Task<List<Area>> QuerySubAreasInArea(string rootArea)
        {
            if (!_supportedRootAreas.Contains(rootArea))
                throw new ArgumentException("given area is not supported");

            //build HTTP data section for OpenBeta POST request
            QueryHTTPDataSection data = new QueryHTTPDataSection
            {
                query = MakeClimbsInAreaQuery(rootArea),
                operationName = "ClimbsInArea"
            };

            //POST request to OpenBeta API
            using var response = await _httpClient.PostAsJsonAsync("", data);

            response.EnsureSuccessStatusCode(); //throw if not a successful request
            
            //gives { data: {...} } (SearchByLocationRootObj)
            var decodedQueryResponse = await response.Content.ReadFromJsonAsync<SearchByLocationRootObj>();

            //get first-level subareas within rootArea
            var subareas = decodedQueryResponse.data.areas[0].children;

            _logger.LogInformation($"Successfully ran ClimbsInArea query for \"{rootArea}\". Found {subareas.Count} subareas.");

            return subareas;
        }

        //take root area (like state, country, etc) and create a valid OpenBeta API query
        private string MakeClimbsInAreaQuery(string rootArea)
        {
            string query = @"
query ClimbsInArea {
  areas(filter: {area_name: {exactMatch: true, match: ";
            query += "\"" + rootArea + "\"";
            query += @"}}) {
    children {
      areaName
      id
      metadata {
        lat
        lng
        areaId
      }
      climbs {
        name
        metadata {
          lat
          lng
        }
        id
        grades {
          font
          french
          vscale
          yds
        }
        safety
      }
      children {
        areaName
        id
        metadata {
          lat
          lng
          areaId
        }
        climbs {
          name
          metadata {
            lat
            lng
          }
          id
          grades {
            font
            french
            vscale
            yds
          }
          safety
        }
        children {
          areaName
          id
          metadata {
            lat
            lng
            areaId
          }
          climbs {
            name
            metadata {
              lat
              lng
            }
            id
            grades {
              font
              french
              vscale
              yds
            }
            safety
          }
          children {
            areaName
            id
            metadata {
              lat
              lng
              areaId
            }
            climbs {
              name
              metadata {
                lat
                lng
              }
              id
              grades {
                font
                french
                vscale
                yds
              }
              safety
            }
            children {
              areaName
              id
              metadata {
                lat
                lng
                areaId
              }
              climbs {
                name
                metadata {
                  lat
                  lng
                }
                id
                grades {
                  font
                  french
                  vscale
                  yds
                }
                safety
              }
              children {
                areaName
                id
                metadata {
                  lat
                  lng
                  areaId
                }
                climbs {
                  name
                  metadata {
                    lat
                    lng
                  }
                  id
                  grades {
                    font
                    french
                    vscale
                    yds
                  }
                  safety
                }
                children {
                  areaName
                  id
                  metadata {
                    lat
                    lng
                    areaId
                  }
                  climbs {
                    name
                    metadata {
                      lat
                      lng
                    }
                    id
                    grades {
                      font
                      french
                      vscale
                      yds
                    }
                    safety
                  }
                  children {
                    areaName
                    id
                    metadata {
                      lat
                      lng
                      areaId
                    }
                    climbs {
                      name
                      metadata {
                        lat
                        lng
                      }
                      id
                      grades {
                        font
                        french
                        vscale
                        yds
                      }
                      safety
                    }
                    children {
                      areaName
                      id
                      metadata {
                        lat
                        lng
                        areaId
                      }
                      climbs {
                        name
                        metadata {
                          lat
                          lng
                        }
                        id
                        grades {
                          font
                          french
                          vscale
                          yds
                        }
                        safety
                      }
                      children {
                        areaName
                        id
                        metadata {
                          lat
                          lng
                          areaId
                        }
                        climbs {
                          name
                          metadata {
                            lat
                            lng
                          }
                          id
                          grades {
                            font
                            french
                            vscale
                            yds
                          }
                          safety
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
            ";

            return query;
        }
    }
}
