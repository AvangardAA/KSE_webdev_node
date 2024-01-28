from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from urllib.parse import urlparse, parse_qs
import requests
import json

def show_top_nbu_rates(request):
    rates = requests.get("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json")
    rateDict = rates.json()
    responseList: list = []
    for i in sorted(rateDict, key=lambda d: d['rate'], reverse=True)[0:10]:
        responseList.append(i)

    return HttpResponse(content=json.dumps(responseList), content_type="application/json")

def show_image(request):
    if request.method == "POST":
        return HttpResponse()
    else:
        return HttpResponseBadRequest("wrong method")
    
@csrf_exempt
def url_validate(request):
    """ Send url as json encoded object : {"url": "..."}"""
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
