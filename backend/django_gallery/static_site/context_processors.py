from .models import ContactLink


def contacts(request):
    '''Pass customly defined contact links.'''
    custom_links = ContactLink.objects.filter(
        is_active=True
    )
    contact_links = {
        str(link.description): str(link.link) for link in custom_links
    }
    return {'contact_links': contact_links}
