from panel.models import Room


def is_pilot(room_id, user_id) -> bool:
    room = Room.objects.get(id__startswith=room_id)
    return room.drone.owner.id == user_id or room.host.id == user_id
