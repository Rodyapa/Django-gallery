from django.shortcuts import render


def IndexView(request):
    """View for the main page."""
    template = 'index.html'
    return render(request, template)


def ContactView(request):
    """View for the contact page."""
    template = "pages/contacts.html"
    return render(request, template)
