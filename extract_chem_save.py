import sys
import os

# Use pypdf
try:
    from pypdf import PdfReader
except ImportError:
    from PyPDF2 import PdfReader

pdf_dir = "c:/Users/david/OneDrive/Documents/CODE/CODE SUMMARY/Chemistry/"
output_file = "c:/Users/david/OneDrive/Documents/CODE/CODE SUMMARY/extracted_chemistry.txt"

files = [
    "Week 1 continuing - Tagged.pdf",
    "Week 3 Chemical Bonding.pdf",
    "Week 4 Lecture Lewis Structures - Tagged.pdf",
    "Week 5 Lecture Polarity - Tagged.pdf",
    "Week 5 additional VSEPR slides - Tagged-1.pdf",
    "Week 6 Lecture Intermolecular Forces - Tagged-1.pdf",
    "Week 7 Lecture - Tagged-1.pdf",
    "Week 8 gasses - Tagged.pdf",
    "CHEM150___Midterm_I___Practice_A.pdf.pdf",
    "Chem TT 1B.pdf.pdf",
    "Answer Key Chem 150 review test A - Tagged.pdf",
    "Answer Key Term Test 1 - Tagged.pdf",
    "Answer_Key_Chem_150_Old_Midterm_Friday.pdf.pdf",
    "TT 1A Answer Key-1.pdf",
    "Answer Key Problem Set 1-1.pdf",
    "Answer Key Problem Set 2-2.pdf",
    "Answer Key Problem Set 3 Intermolecular Interactions.pdf",
    "Answer Key Problem Set 4 Gases.pdf",
]

with open(output_file, "w", encoding="utf-8", errors="replace") as out:
    for filename in files:
        filepath = os.path.join(pdf_dir, filename)
        header = f"\n{'='*80}\nFILE: {filename}\n{'='*80}\n"
        out.write(header)
        print(header, flush=True)

        if not os.path.exists(filepath):
            msg = f"[FILE NOT FOUND: {filepath}]\n"
            out.write(msg)
            print(msg, flush=True)
            continue

        try:
            reader = PdfReader(filepath)
            num_pages = len(reader.pages)
            page_info = f"Pages: {num_pages}\n"
            out.write(page_info)
            print(page_info, flush=True)

            for i, page in enumerate(reader.pages):
                try:
                    text = page.extract_text()
                    if text:
                        page_content = f"\n--- Page {i+1} ---\n{text}\n"
                        out.write(page_content)
                    else:
                        msg = f"\n--- Page {i+1} --- [no text extracted]\n"
                        out.write(msg)
                except Exception as e:
                    msg = f"\n--- Page {i+1} --- [ERROR: {e}]\n"
                    out.write(msg)

            print(f"  Done: {num_pages} pages processed", flush=True)

        except Exception as e:
            msg = f"[ERROR opening file: {e}]\n"
            out.write(msg)
            print(msg, flush=True)

    out.write("\n\n" + "="*80 + "\nEXTRACTION COMPLETE\n" + "="*80 + "\n")

print("\nAll done! Output written to:", output_file, flush=True)
