import asyncio

from urllib import parse

from channels.consumer import AsyncConsumer
from channels.exceptions import StopConsumer
from channels.db import database_sync_to_async

from panel.models import Drone, Room


class MavlinkConsumer(AsyncConsumer):
    # is_drone = False

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


    async def websocket_connect(self, event):
        # self.user = self.scope["user"]

        type = self.scope["url_route"]["kwargs"].get("type", None)
        id = self.scope["url_route"]["kwargs"].get("id", None)

        if type == "room":
            room = await self.get_room(id)
        elif type == "plate":
            # self.is_drone = True
            room = await self.get_drone_room(id)
        else:
            print("REJECTING CONNECTION")
            return await self.send({"type": "websocket.close"})

        if not room:
            print("REJECTING CONNECTION")
            return await self.send({"type": "websocket.close"})

        self.room_id = room.short_id

        await self.send({"type": "websocket.accept"})
        await self.channel_layer.group_add(
            self.room_id,
            self.channel_name
        )

    async def websocket_receive(self, event):
        # if not (self.is_drone or self.scope["user"].is_authenticated):
        #     print("REJECTING MESSAGE", event)
        #     return

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
        # print("CHANNEL_NAME", self.channel_name)
        if self.channel_name != event.get("sender_channel_name"):
            await self.send({
                "type": "websocket.send",
                "text": event.get("message")
            })

    async def websocket_disconnect(self, event):
        await self.channel_layer.group_discard(
            self.room_id,
            self.channel_name
        )
        await self.send({"type": "websocket.close"})
        raise StopConsumer()
