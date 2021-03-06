# ikaro
Django based web server for tucano services

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
