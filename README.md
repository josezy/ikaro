# ikaro
Django based web server for running drones from a browser

## Project quickstart

* Clone and make sure you have python, pip, virtualenv, npm, node and yarn

```bash
virtualenv .venv
source .venv/bin/activate
pip install -r requirements.txt

python ikarodjango/manage.py migrate
```

Make sure to paste or set your env variables in `env/secrets.env`, then run:
```
python ikarodjango/manage.py runserver
```

For development, do the following before migrating and runing server
```bash
# Install javascript dependencies
npm i -g yarn

# For Bash: add this line to ~/.bashrc or ~/.bash_profile
PATH=./node_modules/.bin:$PATH
# For fish: add this line to ~/.config/fish/config.fish
set -x PATH ./node_modules/.bin $PATH

cd ikarodjango/js
yarn install
webpack --watch --mode development
```

## Useful commands
```
# Activate env
. .venv/bin/activate.fish

# Make sure redis is running
redis-cli ping

# Run server
python ikarodjango/manage.py runserver

# Run dron simulator, make sure venv is activated
dronekit-sitl copter --home=6.149014,-75.393962,0,180

# Run tukano service
python src/tukano_service.py

# Connect to BD - Activate virtual env
python ikarodjango/manage.py shell_plus

# To create demo data (Inside shell_plus)
u = User.objects.create_user(username="test", email="test@test.test", password="testtest")
d = Drone.objects.create(plate="00000000", owner=u)
r = Room.objects.create(host=u, drone=d)
```
