import os
import traceback
from modules.converter.ppt_slide_renderer import render_ppt_slides_to_images


def generate_slide_preview(ppt_path):
    try:
        print(
            f"Generating preview for: {ppt_path}"
        )

        slide_images = render_ppt_slides_to_images(
            ppt_path
        )

        print(
            f"Generated images: {slide_images}"
        )

        image_data = []

        for img_path in slide_images:

            if os.path.exists(img_path):
                image_data.append({
                    "filename": os.path.basename(
                        img_path
                    ),
                    "filepath": img_path
                })

        return {
            "success": True,
            "images": image_data
        }

    except Exception as e:
        print(
            "SLIDE PREVIEW ERROR:"
        )

        traceback.print_exc()

        return {
            "success": False,
            "images": [],
            "error": str(e)
        }