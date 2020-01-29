# ikaro
Django based web server for tucano services

## Project quickstart

* Clone this repo
* Run these commands
```bash
apt install python3.7 python-pip python-setuptools python3-venv virtualenv npm supervisor redis

cd ikaro

curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python3
poetry install

ln -fs /etc/supervisor/conf.d/ikaro.conf etc/supervisor/ikaro.conf
```

For development
```bash
# Install javascript dependencies
npm install -g npm
npm install --upgrade --global yarn

# For Bash: add this line to ~/.bashrc or ~/.bash_profile
PATH=./node_modules/.bin:$PATH
# For fish: add this line to ~/.config/fish/config.fish
set -x PATH ./node_modules/.bin $PATH

cd ikarodjango/js
yarn install
cd ..

# migrate
python manage.py migrate

# Start the development server
python manage.py runserver
```

## Database setup
### Init database directory
`initdb data/database`
### Set permissions
`chown -R postgres:postgres data/database`
### Run postgres
`postgres -D ./data/database`
### Create role with password and database
```bash
psql -c "CREATE USER ikaro WITH PASSWORD 'ikaro';" postgres
psql -c "CREATE DATABASE ikaro OWNER ikaro;" postgres
psql -c "GRANT ALL PRIVILEGES ON DATABASE ikaro TO ikaro;" postgres
psql -c "ALTER USER ikaro CREATEDB;" postgres
```
### Run migrations
`poetry run python ikarodjango/manage.py migrate`

## Server management
### SSL CERTS

#### SELF SIGNED
`openssl req -x509 -nodes -days 3650 -newkey rsa:4096 -keyout tucanoar.com.key -out tucanoar.com.crt -subj "/C=CO/ST=Antioquia/L=Rionegro/O=TucanoAR/CN=tucanoar.com"`

#### LetsEncrypt
##### add volume
    - /root/certs-data:/data/letsencrypt/
##### create location (comment rewrite)
    location /.well-known/ { allow all; root /data/letsencrypt/; }
##### run certbot
    certbot certonly --webroot -w /root/certs-data -d tucanoar.com -d www.tucanoar.com



### [[ DOCKER ZONE ]]
#### setup handled by docker
    apt install docker.io docker-compose
    docker-compose up -d --build

#### start
    docker-compose up -d
#### stop
    docker-compose down

#### deploy
    git pull
    docker-compose down
    docker-compose up -d --build

#### backup
    --

