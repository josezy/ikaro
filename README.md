# ikaro
Django based web server for running drones from a browser

## Project quickstart

* Clone and run `docker compose up` :boom:

Make sure to paste or set your env variables in `env/secrets.env`

## Setup DB (only once)
```
# Run Django and migrate:
docker compose run --rm django python manage.py migrate

# Connect to BD
docker compose run --rm django ./ikarodjango/manage.py shell_plus

# Create demo data (Inside shell_plus)
u = User.objects.create_user(username="test", email="test@test.test", password="testtest")
d = Drone.objects.create(plate="00000000", owner=u)
r = Room.objects.create(host=u, drone=d, videoroom_id="1234")
```

## Janus notes

Used ports:
    7088 - admin
    8088 - drone / http
    8188 - front / ws
Review [config files](https://github.com/meetecho/janus-gateway/tree/master/conf) to check additional ports

## Useful commands for tukano
```
# Run drone simulator, make sure venv is activated
dronekit-sitl copter --home=6.149014,-75.393962,0,180

# Run tukano service
python src/tukano_service.py

# Run janus publisher (dev cam)
python src/janus.py http://<DOCKER_IP>:8088/janus
```

## Production
```
# Run Django and collect statics
docker compose run --rm django python manage.py migrate
```