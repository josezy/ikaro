import asyncio

from channels.consumer import AsyncConsumer


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
                    'message': mav_msg
                }
            )

    async def flight_message(self, event):
        await self.send({
            'type': 'websocket.send',
            'text': event.get('message')
        })

    async def websocket_disconnect(self, event):
        await self.send({
            "type": "websocket.close"
        })
        print("disconnected", event)
