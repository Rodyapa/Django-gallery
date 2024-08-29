from django.shortcuts import render


def IndexView(request):
    """Вью для главной страницы """
    template = 'index.html'
    return render(request, template)


def ContactView(request):
    template = "pages/contacts.html"
    return render(request, template)
