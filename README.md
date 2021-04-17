# ITLog
## _The Irresistible Technical Event Logs_

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.5.<br>
This project was made to serve as the event logger for users of the team's domain system. The version releases are [here](https://github.com/bossbuwi/itlog/releases). Current version is 0.1-beta and is ready for production. This project is just the frontend for an event logging app. For this to function completely, a compatible backend that serves data through a REST API must be used. The recommended backend provider is [bilog](https://github.com/bossbuwi/bilog).

### Setup for Development
#### Prerequisites
- An editor, preferably VS Code
- Node js installed
- Angular CLI installed globally

1. Clone the repository or download the code as zip and extract to a directory. This will be referred to as the _project directory_.
2. Open a command prompt on the project directory and run `npm install` to install the project's dependencies.
3. Open src/app/model/constants/properties.ts and modify the REST_SERVER static field to the url of the REST server. Also modify the remaining field of the RestUrls class to the REST server's endpoints. If [bilog](https://github.com/bossbuwi/bilog) is used as the REST provider, there is no need to modify these fields.
4. To run the project, open command prompt on the project directory and run `ng serve -open`. This would compile the project and automatically open it on the default browser once it is finished.

### Setup for Production
1. Open a command prompt on the project directory and run `ng build --prod`. Wait until the build is finished.
2. Go to the output directory, usually at `project directory/dist/itlog/` and copy the files to the deployement server.
3. If you are using an Apache server, copy the `.htaccess` file from the project directory and put it on the same directory as the production files on the server. This is needed in order to allow users to bookmark a direct url to the different routes.
