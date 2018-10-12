# ivt
IVT Site for Alban Delamarre

Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

Installing
Below is a step by step guide on how run the website locally:

On a new folder in your machine, pull the github repository

mkdir IVT
cd ./IVT
git init
git remote add origin https://github.com/blastoy/ivt.git
git pull origin master
Make sure you have MongoDB running

mongod
Restore the latest backup of the database (OPTIONAL)

cd ./parse/dumps
mongorestore --drop -d ivt ./ivt-db-012118-1200/ivt
Get .env file from other developer or from production server, save inside folder 'parse'

Install all server dependencies

cd ./parse
npm install
==========================================
Run the server

npm run start
==========================================
Install all development client dependencies

cd ./vue
npm install
==========================================
Install the vue cli

npm install -g vue-cli
==========================================
If you are on Windows, set NODE_ENV to development. In Powershell, you can do it like so:

$env:NODE_ENV="development"
==========================================
Run the development client framework

npm run dev
The website should now be accessible at the default PORT 8080

http://localhost:8080
==========================================
Deployment
To build for deployment, make sure you have installed all server dependencies and have both MongoDB and the server running

Then, run the build script inside the client folder

cd ./vue
npm run build
This will compile, compress, and minimize all CSS, HTML, JS, and framework dependencies and move the outputted files to the server's frontend API endpoint

cd ./parse/public
ls
You can now visit the deployed site by visiting the server frontend API endpoint at the default PORT 1337

http://localhost:1337
