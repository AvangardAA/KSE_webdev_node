from django.shortcuts import render
from django.http import JsonResponse
from django.core.cache import cache
from django.views.decorators.csrf import csrf_exempt
import logging
from datetime import datetime
import pytz

from pymongo import MongoClient

import json
import requests

client = MongoClient('mongodb+srv://dbkse:pzz6CHKyqqjxa0CW@cluster0.pc3wpi6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client.get_database('test')
opp_collection = db.arbitragecycles
report_collection = db.reports

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.FileHandler('python_logs.log'))

def home(request):
    logger.debug(str(datetime.now(pytz.timezone("Europe/Kyiv"))) + "- home retrieved")
    return render(request, 'home.html')

def get_best_opp(request):
    """ returns best arbitrage opportunity to frontend from database """
    if request.method == "GET":
        b_opp = opp_collection.find_one({}, sort=[('result', -1)])
        b_opp_dict = {
            'cycle': b_opp['cycle'],
            'result': b_opp['result']
        }
        logger.debug(str(datetime.now(pytz.timezone("Europe/Kyiv"))) + "- best opportunity retrieved, result: " + str(b_opp_dict["result"]))
        return JsonResponse(b_opp_dict)
    else:
        return JsonResponse({'msg': 'bad request'}, status=400)

@csrf_exempt
def report(request):
    """ CRUD project requirement, Create/Update/Delete on POST """ \
    """ And Read part on GET, returns either success or failure of operation with database"""

    if request.method == 'POST':
        dt = json.loads(request.body.decode('utf-8'))
        r_type = request.headers.get('type')
        
        if r_type == 'create':
            report = {
                'title': dt.get('title'),
                'comment': dt.get('comment'),
                'arbitrage_opportunity': float(dt.get('arbitrage_opportunity'))
            }
            res = report_collection.insert_one(report)
            logger.debug(str(datetime.now(pytz.timezone("Europe/Kyiv"))) + "- report created")
            return JsonResponse({'msg': 'report creation success'})
        
        elif r_type == 'update':
            report = {
                'title': dt.get('title'),
                'comment': dt.get('comment'),
                'arbitrage_opportunity': float(dt.get('arbitrage_opportunity'))
            }
            res = report_collection.update_one({'title': dt.get('title')}, {'$set': report})
            if res.modified_count == 0:
                logger.error(str(datetime.now(pytz.timezone("Europe/Kyiv"))) + "- report not found on update")
                return JsonResponse({'msg': 'report not found'}, status=404)
            logger.debug(str(datetime.now(pytz.timezone("Europe/Kyiv"))) + "- report updated")
            return JsonResponse({'msg': 'report update success'})
        
        elif r_type == 'delete':
            res = report_collection.delete_one({'title': dt.get('title')})
            if res.deleted_count == 0:
                logger.error(str(datetime.now(pytz.timezone("Europe/Kyiv"))) + "- report not found on delete")
                return JsonResponse({'msg': 'report not found'}, status=404)
            logger.debug(str(datetime.now(pytz.timezone("Europe/Kyiv"))) + "- report deleted")
            return JsonResponse({'msg': 'report delete success'})
        
    if request.method == "GET":
        reports = list(report_collection.find().sort('_id', -1).limit(3))
        sreport = [{'title': rep['title'], 'comment': rep['comment'], 'arbitrage_opportunity': rep['arbitrage_opportunity']} for rep in reports]
        logger.debug(str(datetime.now(pytz.timezone("Europe/Kyiv"))) + "- reports retrieved")
        return JsonResponse(sreport, safe=False)
    
    logger.error(str(datetime.now(pytz.timezone("Europe/Kyiv"))) + "- bad request for report")
    return JsonResponse({'msg': 'bad request'}, status=400)

def compare(request):
    """ this endpoint shows difference between 3 exchanges and 5 pairs on them """ \
    """ and here caching functionality from requirements is implemented """ \
    """ 30 sec cache is used to provide general look on numbers there """ \
    """ so they can change in future and change will be visible by eye """ \
    """ PS: info from Bybit is from testnet, not main spot data to ease access to it"""
    if request.method == "GET":
        cache_c = cache.get('comp_dt')
        if cache_c:
            logger.debug(str(datetime.now(pytz.timezone("Europe/Kyiv"))) + "- retrieving cached comparison info")
            return JsonResponse(cache_c)

        bin_dt = requests.get("https://api.binance.com/api/v3/ticker/24hr").json()
        huobi_dt = requests.get("https://api.huobi.pro/market/tickers").json()
        bybit_dt = requests.get("https://api-testnet.bybit.com/v5/market/tickers?category=spot").json()

        bin_c = { e['symbol']: e for e in bin_dt if e['symbol'] in ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'MATICUSDT', 'DOTUSDT'] }
        huobi_c = { e['symbol']: e for e in huobi_dt['data'] if e['symbol'] in ['btcusdt', 'ethusdt', 'xrpusdt', 'maticusdt', 'dotusdt'] }
        bybit_c = { e['symbol']: e for e in bybit_dt['result']['list'] if e['symbol'] in ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'MATICUSDT', 'DOTUSDT'] }

        comp_dt = {}
        
        for s, i in bybit_c.items():
            comp_dt[s] = {
                'Bybit': {
                    'low': float(i['lowPrice24h']),
                    'high': float(i['highPrice24h']),
                    'volume': float(i['volume24h']),
                }
            }

        for s, i in huobi_c.items():
            comp_dt[s.upper()].setdefault('Huobi', {
                'low': float(i['low']),
                'high': float(i['high']),
                'volume': float(i['vol']),
            })

        for s, i in bin_c.items():
            comp_dt[s.upper()].setdefault('Binance', {
                'low': float(i['lowPrice']),
                'high': float(i['highPrice']),
                'volume': float(i['volume']),
            })

        logger.debug(str(datetime.now(pytz.timezone("Europe/Kyiv"))) + "- cache set")
        cache.set('comp_dt', comp_dt, 30)

        logger.debug(str(datetime.now(pytz.timezone("Europe/Kyiv"))) + "- comparison retrieved")
        return JsonResponse(comp_dt)
    else:
        return JsonResponse({'msg': 'bad request'}, status=400)
