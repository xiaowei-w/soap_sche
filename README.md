Description
=======
Nodejs-based Cron job scheduler. 

Uses DayPilot Scheduler [https://www.daypilot.org/] to display the cron jobs.

Uses sqlite for persistence storage.

Uses crontab [https://github.com/dachev/node-crontab] for writing to system cron.

####  Usage
1. Initialize the sqlite DB. 
* cd soap_sche/data
* node init_sqlite3.js

2. Initialize and install modules
* npm install

3. Start Nodejs
* npm start

#### Some ENVs
PORT: Server listening port (Default: 8000 (development) / 80 (production) )
ENVIRON: Current environment. (Default: 'development' )
CRONWRITE: Enable/ disable writing to system cron (Default: 'false')

export PORT=xxxx

