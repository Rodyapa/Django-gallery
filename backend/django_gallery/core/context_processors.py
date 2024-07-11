from django.conf import settings


def site_appearance(request):
    site_appearance = {
        'site_title': settings.SITE_TITLE,
        'vk_link': settings.VK_LINK,
        'inst_link': settings.INSTAGRAM_LINK,
        'tg_link': settings.TELEGRAM_LINK,
        'copyright': settings.COPYRIGHT}
    return {'site_appearance': site_appearance}
