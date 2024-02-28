import websockets
from channels.generic.websocket import AsyncWebsocketConsumer

class BinanceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept() # accept connections from frontend and microservice
        await self.subscribe() # loop to listening exchanges

    async def subscribe(self):
        symbols = ["btcusdt", "ethusdt", "xrpusdt", "maticusdt", "dotusdt", "ethbtc", "xrpbtc", "maticbtc", "dotbtc"]
        stream = "/".join([f"{s.lower()}@trade" for s in symbols])
        uri = f"wss://stream.binance.com:9443/stream?streams={stream}"
        
        async with websockets.connect(uri) as ws:
            async for msg in ws:
                await self.send(text_data=msg) # send to frontend and microservice
