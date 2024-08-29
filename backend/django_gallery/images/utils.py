''' Functions that used for editing photo objects'''

import os
from io import BytesIO
from statistics import fmean

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import (InMemoryUploadedFile,
                                            TemporaryUploadedFile)
from PIL import ExifTags
from PIL import Image as PilImage
from PIL import ImageDraw, ImageFont


def get_exif_orientation(image):
    """Retrieve the EXIF orientation value from the image."""
    try:
        exif_data = image._getexif()
        if exif_data is not None:
            for tag, value in exif_data.items():
                if ExifTags.TAGS.get(tag) == 'Orientation':
                    return value
    except Exception as e:
        print(f"Error retrieving EXIF data: {e}")
    return 1  # Default to normal if no EXIF data is found


def apply_exif_orientation(pil_image):
    """Apply the EXIF orientation to the PIL image."""
    orientation = get_exif_orientation(pil_image)
    if orientation == 3:
        pil_image = pil_image.rotate(180, expand=True)
    elif orientation == 6:
        pil_image = pil_image.rotate(270, expand=True)
    elif orientation == 8:
        pil_image = pil_image.rotate(90, expand=True)
    return pil_image


def resize_uploaded_image(image, max_width=1920, max_height=1080):
    size = (max_width, max_height)
    # Uploaded file is in memory
    if isinstance(image, InMemoryUploadedFile):
        memory_image = BytesIO(image.read())
        pil_image = PilImage.open(memory_image)

        pil_image = apply_exif_orientation(pil_image)

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
        pil_image = apply_exif_orientation(pil_image)
        if pil_image.width > max_width or pil_image.height > max_height:
            pil_image.thumbnail(size)
            pil_image.save(path)
            image.size = os.stat(path).st_size
    return image


def add_watermark(image):
    # First. Open Image.
    if isinstance(image, InMemoryUploadedFile):
        # read as byte stream
        memory_image = BytesIO(image.read())
        # Identifies file and make converted copy
        pil_image = PilImage.open(memory_image).convert("RGBA")
        pil_image = apply_exif_orientation(pil_image)

    elif isinstance(image, TemporaryUploadedFile):
        path = image.temporary_file_path()  # Return full path of the image
        # Identifies file and make converted copy
        pil_image = PilImage.open(path).convert("RGBA")
        pil_image = apply_exif_orientation(pil_image)

    # Return file format from name of the file
    img_format = os.path.splitext(image.name)[1][1:].upper()
    img_format = "JPEG" if img_format == "JPG" else img_format
    # Second. Build and draw watermark.
    txt = build_watermark_layer(pil_image)
    # Third. Save new Image.
    if isinstance(image, InMemoryUploadedFile):
        # Combine original image and transparent image with watermark.
        combined = PilImage.alpha_composite(pil_image, txt)
        # Convert new crafted image back to RGB format
        combined = combined.convert('RGB')
        new_image = BytesIO()  # Open byte stream object
        # Save new image back to the memory
        combined.save(new_image, format=img_format)
        # getvalue returns bytes containing image.
        # And they are passed to the ContentFile to make a file instance.
        new_image = ContentFile(new_image.getvalue())
        # save image as Django InMemoryUploadedFile.
        return InMemoryUploadedFile(
            new_image, None, image.name, image.content_type, None, None
        )
    elif isinstance(image, TemporaryUploadedFile):
        # Combine original image and transparent image with watermark.
        combined = PilImage.alpha_composite(pil_image, txt)
        # Convert new crafted image back to RGB format
        combined = combined.convert('RGB')
        # Save new image in the place of the original photo without watermark
        combined.save(path)
        image.size = os.stat(path).st_size
    return image


def build_watermark_layer(pil_image):
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
    # Take each tenth pixel of potential watermark area
    step_horizontal = (
        (watermark_area_horizontal[1] - watermark_area_horizontal[0]) // 10)
    if step_horizontal == 0:
        step_horizontal = 1
    step_vertical = (
        (watermark_area_horizontal[1] - watermark_area_horizontal[0]) // 10)
    if step_vertical == 0:
        step_vertical = 1
    watermark_area_sample_pixels = [
        [x, y] for x in range(
            watermark_area_horizontal[0],
            watermark_area_horizontal[1],
            step_horizontal
        ) for y in range(
            watermark_area_vertical[0],
            watermark_area_vertical[1],
            step_vertical
        )
    ]

    watermark_area_sample_pixels_rgb_data = []
    # Get colors of fetched pixels
    for coordinate in watermark_area_sample_pixels:
        r, g, b, a = pil_image.getpixel((coordinate[0], coordinate[1]))
        point = (r, g, b)
        watermark_area_sample_pixels_rgb_data.append(point)
    # Select color of watermark text due to the watermark area brightnes
    if fmean(
        [fmean(x) for x in watermark_area_sample_pixels_rgb_data]
    ) < 90:
        font_color = (255, 255, 255, 150)
    else:
        font_color = (0, 0, 0, 150)
    font_location = os.path.join(
        settings.BASE_DIR, "static/fonts/Kanit/kanit-regular.ttf"
    )

    # Make font object from .ttf font
    font = ImageFont.truetype(
        font_location,
        int(font_size / 30),
    )
    # Make new transparent Image object to place watermark in it.
    txt = PilImage.new("RGBA", pil_image.size, (255, 255, 255, 0))
    # Creates an object that can be used to draw in the given image.
    d = ImageDraw.Draw(txt)
    # Draw text in the image(on new empty image)
    d.text(
        (x, y),
        "photo-restoration.ru",
        fill=font_color,
        font=font,
        anchor="rs"
    )
    return txt
