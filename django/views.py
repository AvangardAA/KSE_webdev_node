from django.http import HttpResponse
import requests
import json

def show_top_nbu_rates(request):
    rates = requests.get("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json")
    rateDict = rates.json()
    responseList: list = []
    for i in sorted(rateDict, key=lambda d: d['rate'], reverse=True)[0:10]:
        responseList.append(i)

    return HttpResponse(content=json.dumps(responseList), content_type="application/json")