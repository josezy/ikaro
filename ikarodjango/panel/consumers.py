import asyncio

from urllib import parse

from channels.consumer import AsyncConsumer
from channels.exceptions import StopConsumer
from channels.db import database_sync_to_async

from panel.models import Drone, Room


class PanelConsumer(AsyncConsumer):
    is_drone = False

    @database_sync_to_async
    def get_drone_room(self, plate):
        return Drone.objects.get(plate=plate.upper()).room

    @database_sync_to_async
    def get_room(self, room_id):
        return Room.objects.get(id__startswith=room_id)

    async def websocket_connect(self, event):
        self.user = self.scope["user"]

        # User
        if self.user.is_authenticated:
            room_id = self.scope["url_route"]["kwargs"].get("room_id", None)
            if room_id:
                room = await self.get_room(room_id)
                self.flight_room = room.short_id
                await self.channel_layer.group_add(
                    self.flight_room,
                    self.channel_name
                )
                await self.send({"type": "websocket.accept"})
            else:
                await self.send({"type": "websocket.close"})

        # Drone
        else:
            query_string = self.scope["query_string"].decode("utf-8")
            if query_string:
                parsed_qs = parse.parse_qs(query_string)
                plate_qs = parsed_qs.get("plate", [])
                if len(plate_qs) == 1:
                    plate = plate_qs[0]
                    drone_room = await self.get_drone_room(plate)
                    if drone_room:
                        self.is_drone = True
                        self.flight_room = drone_room.short_id
                        await self.channel_layer.group_add(
                            self.flight_room,
                            self.channel_name
                        )
                        await self.send({'type': 'websocket.accept'})
                    else:
                        await self.send({"type": "websocket.close"})
                else:
                    await self.send({"type": "websocket.close"})
            else:
                await self.send({"type": "websocket.close"})

    async def websocket_receive(self, event):
        mav_msg = event.get('text', None)
        if mav_msg is not None:
            await self.channel_layer.group_send(
                self.flight_room,
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
        await self.channel_layer.group_discard(
            self.flight_room,
            self.channel_name
        )
        await self.send({"type": "websocket.close"})
        raise StopConsumer()


class VideoConsumer(AsyncConsumer):
    async def websocket_connect(self, event):
        self.flight_room = "some_room_for_now_video"
        await self.channel_layer.group_add(
            self.flight_room,
            self.channel_name
        )
        await self.send({'type': 'websocket.accept'})

    async def websocket_receive(self, event):
        encoded_frame = event.get('text', None)
        if encoded_frame is not None:
            await self.channel_layer.group_send(
                self.flight_room,
                {
                    'type': 'video_frame',
                    'frame': encoded_frame,
                    'sender_channel_name': self.channel_name
                }
            )

    async def video_frame(self, event):
        if self.channel_name != event.get('sender_channel_name'):
            await self.send({
                'type': 'websocket.send',
                'text': event.get('frame')
            })

    async def websocket_disconnect(self, event):
        await self.channel_layer.group_discard(
            self.flight_room,
            self.channel_name
        )
        await self.send({"type": "websocket.close"})
        raise StopConsumer()
