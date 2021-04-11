# from django.test import TestCase
# from channels.db import database_sync_to_async
# # from channels.testing import HttpCommunicator
# from channels.testing import WebsocketCommunicator
# # from panel.consumers import PanelConsumer
# from channels.routing import get_default_application

# from ikaro.models import User
# from panel.models import Drone, Room


# class BaseTest(TestCase):
#     def setUp(self) -> None:
#         self. user = User.objects.create_user(
#             username="jose", email="test@mail.com", password="banana")
#         self.drone = Drone.objects.create(plate="00000000", owner=self.user)
#         self.room = Room.objects.create(drone=self.drone, host=self.user)


# class PanelConsumerTests(BaseTest):

#     @database_sync_to_async
#     def blah(self):
#         print("self.room", self.room)
#         print(f"ROOMS == ", Room.objects.all())

#     async def test_consumer(self) -> None:
#         communicator = WebsocketCommunicator(
#             get_default_application(), f"/mavlink/{self.room.short_id}")
#         communicator.scope['user'] = self.user # Trick to login
#         await self.blah()
#         connected, subprotocol = await communicator.connect()

#         assert connected

#         # Test sending text
#         await communicator.send_to(text_data="hello")
#         response = await communicator.receive_from()
#         assert response == "hello"

#         # Close
#         await communicator.disconnect()

#     #     communicator = HttpCommunicator(PanelConsumer, "GET", "/test/")
#     #     response = await communicator.get_response()
#     #     self.assertEqual(response["body"], b"test response")
#     #     self.assertEqual(response["status"], 200)
