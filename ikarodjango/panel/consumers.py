import asyncio

from channels.consumer import AsyncConsumer
from channels.exceptions import StopConsumer


class PanelConsumer(AsyncConsumer):
    async def websocket_connect(self, event):
        self.flight_room = "some_room_for_now"
        await self.channel_layer.group_add(
            self.flight_room,
            self.channel_name
        )

        await self.send({
            'type': 'websocket.accept'
        })

    async def websocket_receive(self, event):
        mav_msg = event.get('text', None)
        if mav_msg is not None:
            await self.channel_layer.group_send(
                self.flight_room,
                {
                    'type': 'flight_message',
                    'message': mav_msg,
                    'sender_channel_name': self.channel_name
                }
            )

    async def flight_message(self, event):
        if self.channel_name != event.get('sender_channel_name'):
            await self.send({
                'type': 'websocket.send',
                'text': event.get('message')
            })

    async def websocket_disconnect(self, event):
        await self.channel_layer.group_discard(
            self.flight_room,
            self.channel_name
        )
        await self.send({
            "type": "websocket.close"
        })
        raise StopConsumer()


class VideoConsumer(AsyncConsumer):
    async def websocket_connect(self, event):
        self.flight_room = "some_room_for_now_video"
        await self.channel_layer.group_add(
            self.flight_room,
            self.channel_name
        )

        await self.send({
            'type': 'websocket.accept'
        })

    async def websocket_receive(self, event):
        encoded_frame = event.get('text', None)
        if encoded_frame is not None:
            print("Video frame. Length:", len(encoded_frame))
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
        await self.send({
            "type": "websocket.close"
        })
        raise StopConsumer()
