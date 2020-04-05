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
```

For development
```bash
# Install javascript dependencies
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
