# Boulder Buddy

This is a web application designed for Climbers.

## Getting Started

Follow these instructions to get a copy of the project up and running on your computer.

## Prerequisites

Make sure you have Node.js and npm installed on your computer. You can download them from [nodejs.org](https://nodejs.org/).

Install a C#/.NET IDE of choice like [Visual Studio Community Edition](https://visualstudio.microsoft.com/downloads/) (free by default) or [JetBrains Rider](https://www.jetbrains.com/rider/) (only free if you apply for a free [student license](https://www.jetbrains.com/community/education/#students)).

If using Visual Studio, open the Visual Studio Installer application, click the "Modify" button for Visual Studio Community 2022, and install the "ASP.NET and web development" workload if it is not already installed.

## Installation

1. Clone the repository

2. Navigate to the Frontend Directory:

   ```sh
   cd Frontend
   ```

3. Install the dependencies:

   ```sh
   npm install
   ```

## Starting the application

### Frontend

1. Navigate to the Frontend Directory:

   ```sh
   cd Frontend
   ```

2. Start the development server:

   ```sh
   npm run dev
   ```

3. Navigate to `http://localhost:3000` on a browser to see the website running.

### Backend

1. Open the `BoulderBuddyAPI.sln` file in the `/Backend/BoulderBuddyAPI/` directory using your .NET IDE of choice.

2. Run the program using your IDE (Main function is in Program.cs).

3. The API listens for requests on `http://localhost:5091` and `https://localhost:7195`

4. The Swagger developer webpage (GUI view) for the API is available at `https://localhost:7195/swagger/index.html` on a browser.

## Creating code coverage reports for backend unit tests

### Prerequisite tooling

With the project open in Visual Studio, enter the "View" menu on the top of the window, then click "Terminal" (or use Ctrl+\`). Enter this command into the console: `dotnet tool install -g dotnet-reportgenerator-globaltool`

### Locally generating code coverage reports (manually)

1. Open the Visual Studio Developer Terminal (as described above).

2. Enter the following command to run unit tests and generate a machine-readable .xml code coverage report. <br>
`dotnet test --collect:"XPlat Code Coverage"`

3. Enter the following command to generate a human-readable .html code coverage report. <br>
`reportgenerator -reports:"\coverage.cobertura.xml" -targetdir:"../BoulderBuddyAPI.Tests/coveragereport" -reporttypes:Html`

4. Delete the directory `/Backend/BoulderAPI.Tests/TestResults` so it doesn't interfere with your next coverage report.

5. In your File Explorer or Visual Studio, locate the file `/Backend/BoulderBuddyAPI.Tests/coveragereport/index.html` and open it in your browser of choice.

### Automatically generated code coverage reports (GitHub pushes/pull requests)

1. The automated code coverage report generation triggers off one of three cases:
	1. git push to the `Backend` directory
	2. git push that updates `.gitignore`
	3. pull request to `main` branch

2. When you trigger the automated report, click the ✔, ❌, or 🔴 icon that displays next to the push/pull request on GitHub

3. Open the `Upload test code coverage report artifact` step. Open the `Artifact download URL` displayed at the bottom of the console output

4. Unzip the downloaded artifact folder

5. Use your browser of choice to open the `index.html` file from inside the unzipped folder
