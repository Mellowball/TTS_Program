from django.shortcuts import render, redirect
from .models import AnnounceBoard
from gtts import gTTS
import googletrans
import os
import datetime
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib import auth
# Create your views here.

languages = ['ko', 'en', 'zh-cn', 'ja', 'tl', 'vi', 'th']

def index(request):
    postlist = AnnounceBoard.objects.all().order_by('-number')
    context = {
        'postlist': postlist
    }
    return render(request, 'app/index.html', context)

def board(request, tnum):
    post = AnnounceBoard.objects.get(number=tnum)
    context = {
        'post': post,
    }
    return render(request, 'app/board.html', context)


def home_others(request, countrylang):
    postlist = AnnounceBoard.objects.all().order_by('-number')
    translator = googletrans.Translator()
    for post in postlist:
        transtitle = translator.translate(post.title, dest=countrylang)
        post.title = transtitle.text
    context = {
        'postlist': postlist,
        'countrylang': countrylang,
    }
    return render(request, 'app/home_others.html', context)
    

def board_others(request, countrylang, tnum):
    post = AnnounceBoard.objects.get(number=tnum)
    translator = googletrans.Translator()
    transtitle = translator.translate(post.title, dest=countrylang)
    transtext = translator.translate(post.text, dest=countrylang)
    post.title = transtitle.text
    post.text = transtext.text
    context = {
        'post': post,
        'countrylang': countrylang,
    }
    return render(request, 'app/board_others.html', context)

def admin_home(request):
    postlist = AnnounceBoard.objects.all().order_by('-number')
    context = {
        'postlist': postlist,
    }
    return render(request, 'app/admin_home.html', context)

def admin_create(request):
    if request.method == "POST":
        post = AnnounceBoard()
        post.title = request.POST['title']
        post.text = request.POST['text']
        post.save()
        
        translator = googletrans.Translator()
                
        for language in languages:
            transresult = translator.translate(post.text, dest=language)
            tts = gTTS(text=transresult.text, lang=language)    
            tts.save('%s.mp3' % os.path.join('./media/audio', "audio" + str(post.number) + "_" + language ))
    
        return redirect('admin_home')
    
    else:
        post = AnnounceBoard.objects.all()
        return render(request, 'app/admin_create.html', {'post': post})
    
def admin_fix(request, tnum):
    post = AnnounceBoard.objects.get(number=tnum)
    if 'create' in request.POST:
        post.title = request.POST['title']
        post.text = request.POST['text']
        post.date_time = datetime.datetime.now()
        post.save()
        
        translator = googletrans.Translator()
                
        for language in languages:
            transresult = translator.translate(post.text, dest=language)
            tts = gTTS(text=transresult.text, lang=language)    
            tts.save('%s.mp3' % os.path.join('./media/audio', "audio" + str(post.number) + "_" + language ))

        return redirect('admin_home')
    
    elif 'delete' in request.POST:
        try:
            for language in languages:
                os.remove(os.path.join("./media/audio/audio"+ str(post.number) + "_" + language + ".mp3"))
        except:
            print('File error')
        post.delete()
        return redirect('admin_home')
    
    else:
        return render(request, 'app/admin_fix.html', {'post': post})

def admin_login(request):
    if request.method == "POST":
        input_id = request.POST['input_id']
        input_pw = request.POST['input_pw']
        user = auth.authenticate(request, username=input_id, password=input_pw)
        if user is not None:
            auth.login(request, user)
            return redirect('admin_home')
        else:
            return render(request, 'app/admin_login.html', {'error': 'ID 또는 비밀번호가 틀렸습니다.'})
    else:
        return render(request, 'app/admin_login.html')

def admin_logout(request):
    auth.logout(request)
    return redirect('index')
