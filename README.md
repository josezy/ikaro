# ikaro
Django based web server for tucano services

### Project quickstart

* Clone this repo
* Run these commands
```bash
apt install python3.7 python3-pip npm
python3.7 -m pip install --user pipenv

cd ikaro

# For Bash: add this line to ~/.bashrc or ~/.bash_profile
PATH=~/.local/bin:$PATH
# For fish: add this line to ~/.config/fish/config.fish
set -x PATH ~/.local/bin $PATH

pipenv install

# Install javascript dependencies (dev machines only)
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

### Server management


# SSL CERTS

### SELF SIGNED
`openssl req -x509 -nodes -days 3650 -newkey rsa:4096 -keyout tucanoar.com.key -out tucanoar.com.crt -subj "/C=CO/ST=Antioquia/L=Rionegro/O=TucanoAR/CN=tucanoar.com"`

### LetsEncrypt
# create volume
    `- /root/certs-data:/data/letsencrypt/`
# add location (comment rewrite)
    `location /.well-known/ { allow all; root /data/letsencrypt/; }`
# run certbot
    `certbot certonly --webroot -w /root/certs-data -d tucanoar.com -d www.tucanoar.com`



### MANAGEMENT COMMANDS
# setup handled by docker
    ```
    apt install docker.io docker-compose
    docker-compose up -d --build
    ```

# start
    `docker-compose up -d`
# stop
    `docker-compose down`

# deploy
    ```
    git pull
    docker-compose down
    docker-compose up -d --build
    ```

# backup
    --

