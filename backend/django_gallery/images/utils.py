''' Functions that used for editing photo objects'''

import os
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.files.uploadedfile import (InMemoryUploadedFile,
                                            TemporaryUploadedFile
                                            )
from PIL import Image as PilImage


def resize_uploaded_image(image, max_width=1920, max_height=1080):
    size = (max_width, max_height)
    # Uploaded file is in memory
    if isinstance(image, InMemoryUploadedFile):
        memory_image = BytesIO(image.read())
        pil_image = PilImage.open(memory_image)
        img_format = os.path.splitext(image.name)[1][1:].upper()
        img_format = "JPEG" if img_format == "JPG" else img_format

        if pil_image.width > max_width or pil_image.height > max_height:
            pil_image.thumbnail(size)

        new_image = BytesIO()
        pil_image.save(new_image, format=img_format)

        new_image = ContentFile(new_image.getvalue())
        return InMemoryUploadedFile(
            new_image, None, image.name, image.content_type, None, None
        )

    # Uploaded file is in disk
    elif isinstance(image, TemporaryUploadedFile):
        path = image.temporary_file_path()
        pil_image = PilImage.open(path)
        if pil_image.width > max_width or pil_image.height > max_height:
            pil_image.thumbnail(size)
            pil_image.save(path)
            image.size = os.stat(path).st_size
    return image


def add_watermark(image):
    if isinstance(image, InMemoryUploadedFile):
        memory_image = BytesIO(image.read())
        pil_image = PilImage.open(memory_image).convert("RGBA")
        img_format = os.path.splitext(image.name)[1][1:].upper()
        img_format = "JPEG" if img_format == "JPG" else img_format

        w, h = pil_image.size
        x = int(w - (w / 30))
        y = int(h - (w / 30))
        if x > y:
            font_size = y
        elif y > x:
            font_size = x
        else:
            font_size = x
        watermark_area_horizontal = int(x - w / 100), x + w // 100
        watermark_area_vertical = int(y - h / 100), y + h // 100
        watermark_area_sample_pixels = [
            [x, y] for x in range(
                watermark_area_horizontal[0],
                watermark_area_horizontal[1],
                (watermark_area_horizontal[1]-watermark_area_horizontal[0])//10
                ) for y in range(
                    watermark_area_vertical[0],
                    watermark_area_vertical[1],
                    (watermark_area_vertical[1]-watermark_area_vertical[0])//10
                )
            ]
        watermark_area_sample_pixels_rgb_data = []
        for coordinate in watermark_area_sample_pixels:
            r, g, b, a = pil_image.getpixel((coordinate[0], coordinate[1]))
            point = (r, g, b)
            watermark_area_sample_pixels_rgb_data.append(point)
        if fmean(
            [fmean(x) for x in watermark_area_sample_pixels_rgb_data]
        ) < 90:
            font_color = (255, 255, 255, 150)
        else:
            font_color = (0, 0, 0, 150)
        font_location = os.path.join(
            settings.BASE_DIR, "static/fonts/Kanit/kanit_regular.ttf"
        )

        font = ImageFont.truetype(
            font_location,
            int(font_size / 30),
        )

        txt = PilImage.new("RGBA", pil_image.size, (255, 255, 255, 0))
        d = ImageDraw.Draw(txt)
        d.text(
            (x, y),
            "photo-restoration.ru",
            fill=font_color,
            font=font,
            anchor="rs"
        )
        combined = PilImage.alpha_composite(pil_image, txt)
        combined = combined.convert('RGB')
        new_image = BytesIO()
        combined.save(new_image, format=img_format)

        new_image = ContentFile(new_image.getvalue())
        return InMemoryUploadedFile(
            new_image, None, image.name, image.content_type, None, None
        )
    return image

