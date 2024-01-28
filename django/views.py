from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.csrf import csrf_exempt
from urllib.parse import urlparse, parse_qs
import os
import requests
import json

def show_top_nbu_rates(request):
    rates = requests.get("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json")
    rateDict = rates.json()
    responseList: list = []
    for i in sorted(rateDict, key=lambda d: d['rate'], reverse=True)[0:10]:
        responseList.append(i)

    return HttpResponse(content=json.dumps(responseList), content_type="application/json")

@csrf_exempt
def show_image(request, imagepth):
    if request.method == "GET":
        img_path = os.path.join("../assets", imagepth)
        if os.path.exists(img_path) and os.path.isfile(img_path):
            with open(img_path, 'rb') as fl:
                img_send = fl.read()

            content_map = {
                '.png': 'image/png',
                '.jpeg': 'image/jpeg',
                '.jpg': 'image/jpeg',
            }
            _, ext = os.path.splitext(img_path)
            content_type = content_map.get(ext, 'application/octet-stream')

            return HttpResponse(img_send, content_type=content_type)
        else:
            return HttpResponseNotFound(json.dumps({"error": "image not found"}), content_type="application/json")
    else:
        return HttpResponseBadRequest("wrong method")
    
@csrf_exempt
def url_validate(request):
    """ Send url as json encoded object : {"url": "..."}
        Example of working string is {"url": "https://dummy.com/dummy1/dummy2?param1=1&param2=2"}
    """
    if request.method == "POST":
        try:
            url = json.loads(request.body)
            p_url = urlparse(url["url"])

            protocol = p_url.scheme
            domain = p_url.netloc
            path_steps = p_url.path.strip('/').split('/')
            query_params = parse_qs(p_url.query)

            if protocol not in ["http", "https", "ftp"]:
                return HttpResponseBadRequest(content=json.dumps({"error": "invalid protocol"}), content_type="application/json")
            elif domain == "":
                return HttpResponseBadRequest(content=json.dumps({"error": "cant resolve domain"}), content_type="application/json")
            elif path_steps == []:
                return HttpResponseBadRequest(content=json.dumps({"error": "empty path steps"}), content_type="application/json")
            elif query_params == {}:
                return HttpResponseBadRequest(content=json.dumps({"error": "empty query params"}), content_type="application/json")
            else:
                return HttpResponse(content=json.dumps({
                    'done': {
                        'protocol': protocol,
                        'domain': domain,
                        'path_steps': path_steps,
                        'query_params': query_params,
                    }
                }), content_type="application/json")
        
        except Exception as e:
            return HttpResponseBadRequest(content=json.dumps({"error": "something wrong with request body"}), content_type="application/json")
    else:
        return HttpResponseBadRequest("wrong method")