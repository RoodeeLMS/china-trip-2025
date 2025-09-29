import os
import sys

try:
    import fitz  # PyMuPDF
except Exception as exc:
    sys.stderr.write("PyMuPDF (pymupdf) not installed: %s\n" % exc)
    sys.exit(2)


def convert_first_page_to_png(pdf_path: str, output_png_path: str, target_width_px: int = 1600) -> None:
    doc = fitz.open(pdf_path)
    if doc.page_count == 0:
        doc.close()
        return
    page = doc.load_page(0)
    page_width_pts = page.rect.width
    # Compute scale factor so rendered width ~ target_width_px
    scale = max(1.0, float(target_width_px) / float(page_width_pts))
    mat = fitz.Matrix(scale, scale)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_png_path), exist_ok=True)
    pix.save(output_png_path)
    doc.close()


def main() -> int:
    # Convert all PDFs in Hotel Docs, excluding the Plan Docs
    root_dir = os.path.abspath(os.path.dirname(__file__))
    hotel_dir = os.path.join(root_dir, "Hotel Docs")

    if not os.path.isdir(hotel_dir):
        sys.stderr.write(f"Hotel directory not found: {hotel_dir}\n")
        return 1

    converted = 0
    for name in sorted(os.listdir(hotel_dir)):
        if not name.lower().endswith(".pdf"):
            continue
        pdf_path = os.path.join(hotel_dir, name)
        png_path = os.path.join(hotel_dir, os.path.splitext(name)[0] + ".png")
        try:
            convert_first_page_to_png(pdf_path, png_path, target_width_px=1600)
            print(f"Converted: {name} -> {os.path.basename(png_path)}")
            converted += 1
        except Exception as exc:
            print(f"Failed: {name} ({exc})", file=sys.stderr)
    print(f"Done. Total converted: {converted}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


