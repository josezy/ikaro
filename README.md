# ikaro
Django based web server for tucano services

### Project quickstart

* Clone this repo
* Run these commands
```bash
apt install python3 python3-pip npm
python3 -m pip install --user pipenv

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
