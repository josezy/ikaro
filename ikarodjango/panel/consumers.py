import asyncio

from channels.consumer import AsyncConsumer
from channels.exceptions import StopConsumer
from channels.db import database_sync_to_async

from panel.models import Drone, Room
from panel.utils import is_pilot


class MavlinkConsumer(AsyncConsumer):
    can_receive = False

    @database_sync_to_async
    def get_drone_room(self, plate):
        drone_qs = Drone.objects.filter(plate=plate.upper())
        if not drone_qs.exists():
            return None
        return drone_qs[0].room

    @database_sync_to_async
    def get_room(self, room_id):
        room_qs = Room.objects.filter(id__startswith=room_id)
        if not room_qs.exists():
            return None
        return room_qs[0]

    @database_sync_to_async
    def add_viewer(self, n):
        room = Room.objects.get(id__startswith=self.room_id)
        room.total_viewers += n
        room.save()


    async def websocket_connect(self, event):
        self.user = self.scope["user"]

        type = self.scope["url_route"]["kwargs"].get("type", None)
        id = self.scope["url_route"]["kwargs"].get("id", None)

        if type == "room":
            room = await self.get_room(id)
        elif type == "plate":
            self.can_receive = True
            room = await self.get_drone_room(id)
        else:
            print("REJECTING CONNECTION")
            return await self.send({"type": "websocket.close"})

        if not room:
            print("REJECTING CONNECTION: no room")
            return await self.send({"type": "websocket.close"})

        self.room_id = room.short_id

        pilot = await database_sync_to_async(is_pilot)(self.room_id, self.scope["user"].id)
        if self.user.is_authenticated and pilot:
            self.can_receive = True

        await self.send({"type": "websocket.accept"})
        await self.channel_layer.group_add(
            self.room_id,
            self.channel_name
        )
        # await self.add_viewer(1)

    async def websocket_receive(self, event):
        if not self.can_receive:
            return

        mav_msg = event.get('text', None)
        if mav_msg is not None:
            await self.channel_layer.group_send(
                self.room_id,
                {
                    "type": "flight_message",
                    "message": mav_msg,
                    "sender_channel_name": self.channel_name
                }
            )

    async def flight_message(self, event):
        if self.channel_name != event.get("sender_channel_name"):
            await self.send({
                "type": "websocket.send",
                "text": event.get("message")
            })

    async def websocket_disconnect(self, event):
        print("Gracefully disconnecting....")
        await self.channel_layer.group_discard(
            self.room_id,
            self.channel_name
        )
        await self.send({"type": "websocket.close"})
        # await self.add_viewer(-1)
        # raise StopConsumer()
