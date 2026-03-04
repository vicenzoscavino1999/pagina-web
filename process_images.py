import os
from PIL import Image

def process_image(base_path, logo_path, output_path, scale_factor=0.25, margin=40):
    try:
        base = Image.open(base_path).convert("RGBA")
        logo = Image.open(logo_path).convert("RGBA")
        
        new_width = int(base.width * scale_factor)
        aspect_ratio = logo.height / logo.width
        new_height = int(new_width * aspect_ratio)
        
        logo = logo.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        x = base.width - new_width - margin
        y = base.height - new_height - margin
        
        composite = Image.alpha_composite(base, Image.new("RGBA", base.size, (0,0,0,0)))
        composite.paste(logo, (x, y), logo)
        
        composite.convert("RGB").save(output_path, "PNG")
        print(f"Successfully created: {output_path}")
    except Exception as e:
        print(f"Error processing {output_path}: {e}")

logo_path = r"C:\Users\Vicenzo\Documents\antygravity\delivery-web-page\public\media\logo.png"

images = [
    {
        "base": r"C:\Users\Vicenzo\.gemini\antigravity\brain\3b2fe725-1210-4241-9a5b-5821a30f091d\base_recojo_1772648993624.png",
        "out": r"C:\Users\Vicenzo\Documents\antygravity\delivery-web-page\public\media\flow-recojo.png"
    },
    {
        "base": r"C:\Users\Vicenzo\.gemini\antigravity\brain\3b2fe725-1210-4241-9a5b-5821a30f091d\base_despacho_1772649009755.png",
        "out": r"C:\Users\Vicenzo\Documents\antygravity\delivery-web-page\public\media\flow-despacho.png"
    },
    {
        "base": r"C:\Users\Vicenzo\.gemini\antigravity\brain\3b2fe725-1210-4241-9a5b-5821a30f091d\base_entrega_1772649028067.png",
        "out": r"C:\Users\Vicenzo\Documents\antygravity\delivery-web-page\public\media\flow-entrega.png"
    }
]

for img in images:
    process_image(img["base"], logo_path, img["out"])
