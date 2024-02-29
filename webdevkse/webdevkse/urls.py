"""
URL configuration for webdevkse project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, re_path

from .consumer import BinanceConsumer
from .views import home, compare, get_best_opp, report

ws_urlpatterns = [
    path('ws/bin_feed/', BinanceConsumer.as_asgi()),
]

urlpatterns = [
    path('', home, name='home'),
    path('compare/', compare, name="compare"),
    path('get_best_opp/', get_best_opp, name="opportunity"),
    path('report/', report, name="report"),
    re_path(r'^.*$', home, name='n404') # all not found to home
]
