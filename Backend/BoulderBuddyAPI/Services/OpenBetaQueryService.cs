using BoulderBuddyAPI.Models;
using BoulderBuddyAPI.Models.OpenBetaModels;
using System.Text.Json;

namespace BoulderBuddyAPI.Services
{
    public class OpenBetaQueryService : IOpenBetaQueryService
    {
        private readonly ILogger<OpenBetaQueryService> _logger;
        private readonly HttpClient _httpClient;

        private readonly string[] _supportedRootAreas;
        private readonly string _cacheDirectory;

        public OpenBetaQueryService(ILogger<OpenBetaQueryService> logger, HttpClient httpClient, OpenBetaConfig config)
        {
            _logger = logger;
            _httpClient = httpClient;
            _supportedRootAreas = config.SupportedRootAreas;
            _cacheDirectory = config.CacheDirectory;
        }

        //query OpenBeta API for subareas in given root area
        public async Task<List<Area>> QuerySubAreasInArea(string rootAreaName)
        {
            if (!_supportedRootAreas.Contains(rootAreaName))
                throw new ArgumentException("given area is not supported");

            //build HTTP data section for OpenBeta POST request
            QueryHTTPDataSection data = new QueryHTTPDataSection
            {
                query = MakeClimbsInAreaNameQuery(rootAreaName),
                operationName = "ClimbsInAreaName"
            };

            //get expected file path for the cache file for this root area
            var formattedDate = DateTime.Now.ToString("yyyyMMdd");
            var fullDirectory = $"{_cacheDirectory}\\{formattedDate}";
            var cacheFilePath = $"{fullDirectory}\\{rootAreaName}.json";

            List<Area> subareas;

            //read from today's cached file
            if (File.Exists(cacheFilePath))
            {
                _logger.LogInformation($"Cache hit for \"{rootAreaName}\" search");

                var jsonContent = File.ReadAllText(cacheFilePath);
                subareas = JsonSerializer.Deserialize<List<Area>>(jsonContent);
            }

            //rootArea hasn't been cached today; query OpenBeta
            else
            {
                _logger.LogInformation($"OpenBeta query necessary for \"{rootAreaName}\" search");

                //POST request to OpenBeta API
                using var response = await _httpClient.PostAsJsonAsync("", data);

                response.EnsureSuccessStatusCode(); //throw if not a successful request

                //gives { data: {...} } (SearchByLocationRootObj)
                var responseString = await response.Content.ReadAsStringAsync();
                var decodedQueryResponse = JsonSerializer.Deserialize<SearchByLocationRootObj>(responseString);

                //get first-level subareas under rootArea
                subareas = decodedQueryResponse.data.areas[0].children;

                //cache this response
                Directory.CreateDirectory(fullDirectory);
                File.WriteAllText(cacheFilePath, JsonSerializer.Serialize(subareas));
            }

            _logger.LogInformation($"Successfully ran ClimbsInAreaName query for \"{rootAreaName}\". Found {subareas.Count} subareas.");
            return subareas;
        }

        //query OpenBeta API for a specific area by area ID
        public async Task<Area> QueryAreaByAreaID(string rootAreaID)
        {

            //build HTTP data section for OpenBeta POST request
            QueryHTTPDataSection data = new QueryHTTPDataSection
            {
                query = MakeClimbsInAreaIDQuery(rootAreaID),
                operationName = "ClimbsInAreaID"
            };

            //get expected file path for the cache file for this root area
            var formattedDate = DateTime.Now.ToString("yyyyMMdd");
            var fullDirectory = $"{_cacheDirectory}\\{formattedDate}";
            var cacheFilePath = $"{fullDirectory}\\{rootAreaID}.json";

            List<Area> subareas;

            //read from today's cached file
            if (File.Exists(cacheFilePath))
            {
                _logger.LogInformation($"Cache hit for \"{rootAreaID}\" search");

                var jsonContent = File.ReadAllText(cacheFilePath);
                subareas = JsonSerializer.Deserialize<List<Area>>(jsonContent);
            }

            //rootArea hasn't been cached today; query OpenBeta
            else
            {
                _logger.LogInformation($"OpenBeta query necessary for \"{rootAreaID}\" search");

                //POST request to OpenBeta API
                using var response = await _httpClient.PostAsJsonAsync("", data);

                response.EnsureSuccessStatusCode(); //throw if not a successful request

                //gives { data: {...} } (SearchByLocationRootObj)
                var responseString = await response.Content.ReadAsStringAsync();
                var decodedQueryResponse = JsonSerializer.Deserialize<SearchByLocationRootObj>(responseString);

                //get first-level subareas under rootArea
                subareas = decodedQueryResponse.data.areas[0].children;

                //cache this response
                Directory.CreateDirectory(fullDirectory);
                File.WriteAllText(cacheFilePath, JsonSerializer.Serialize(subareas));
            }

            _logger.LogInformation($"Successfully ran ClimbsInAreaID query for \"{rootAreaID}\". Found {subareas.Count} subareas.");
            return subareas.First();
        }


        //take root area (like state, country, etc) and create a valid OpenBeta API query
        private string MakeClimbsInAreaNameQuery(string rootArea)
        {
            string query = @"
query ClimbsInAreaName {
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

        private string MakeClimbsInAreaIDQuery(string rootAreaID)
        {
            string query = @"
query ClimbsInAreaID {
  area(uuid: ";
            query += "\"" + rootAreaID + "\"";
            query += @") {
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
            ";

            return query;
        }
    }
}
