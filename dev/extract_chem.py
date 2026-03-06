import sys
import os

# Use pypdf
try:
    from pypdf import PdfReader
except ImportError:
    from PyPDF2 import PdfReader

pdf_dir = "c:/Users/david/OneDrive/Documents/CODE/CODE SUMMARY/Chemistry/"

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

all_text = []

for filename in files:
    filepath = os.path.join(pdf_dir, filename)
    print(f"\n{'='*80}", flush=True)
    print(f"FILE: {filename}", flush=True)
    print(f"{'='*80}", flush=True)

    if not os.path.exists(filepath):
        print(f"  [FILE NOT FOUND: {filepath}]", flush=True)
        all_text.append(f"\n{'='*80}\nFILE: {filename}\n{'='*80}\n[FILE NOT FOUND]\n")
        continue

    try:
        reader = PdfReader(filepath)
        num_pages = len(reader.pages)
        print(f"  Pages: {num_pages}", flush=True)
        file_text = [f"\n{'='*80}\nFILE: {filename}\nPages: {num_pages}\n{'='*80}\n"]

        for i, page in enumerate(reader.pages):
            try:
                text = page.extract_text()
                if text:
                    page_content = f"\n--- Page {i+1} ---\n{text}"
                    print(page_content, flush=True)
                    file_text.append(page_content)
                else:
                    msg = f"\n--- Page {i+1} --- [no text extracted]"
                    print(msg, flush=True)
                    file_text.append(msg)
            except Exception as e:
                msg = f"\n--- Page {i+1} --- [ERROR: {e}]"
                print(msg, flush=True)
                file_text.append(msg)

        all_text.append("".join(file_text))

    except Exception as e:
        msg = f"  [ERROR opening file: {e}]"
        print(msg, flush=True)
        all_text.append(f"\n{'='*80}\nFILE: {filename}\n{'='*80}\n[ERROR: {e}]\n")

print("\n\n" + "="*80, flush=True)
print("EXTRACTION COMPLETE", flush=True)
print("="*80, flush=True)
