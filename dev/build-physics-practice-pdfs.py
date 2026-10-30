"""Compose exact, reviewed source crops into legal-size practice papers.
No source wording, numbers, diagrams or requested parts are rewritten.
"""
import json,html,subprocess,os,sys
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Image,KeepTogether,Table,TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from pypdf import PdfReader,PdfWriter
root=Path(__file__).resolve().parents[1];out=root/'phys210/practice-tests';data=json.loads((out/'manifest.json').read_text());ps={p['id']:p for p in data['problems']}
for name,file in [('TimesExact','Times New Roman.ttf'),('TimesExact-Bold','Times New Roman Bold.ttf'),('TimesExact-Italic','Times New Roman Italic.ttf')]:pdfmetrics.registerFont(TTFont(name,'/System/Library/Fonts/Supplemental/'+file))
pdfmetrics.registerFontFamily('TimesExact',normal='TimesExact',bold='TimesExact-Bold',italic='TimesExact-Italic',boldItalic='TimesExact-Bold')
body=ParagraphStyle('body',fontName='TimesExact',fontSize=12,leading=15,spaceAfter=5)
small=ParagraphStyle('small',parent=body,fontSize=9,leading=12,textColor=colors.HexColor('#444444'))
question=ParagraphStyle('question',parent=body,spaceAfter=7)
center=ParagraphStyle('center',parent=body,alignment=1)
W,H=612,1008;M=40;available=W-2*M
instructions={'main':'Choose 3 of the following 4 problems. Complete every part of each chosen problem.','bonus':'Attempt both bonus problems. These are separate from the three main problems.','angle':'Attempt both problems. Related angle/dielectric preparation; no claim that these are the upcoming bonus.','supplement':'Attempt all questions. Supporting practice; this topic mix is not the announced main-test format.'}
render_log=[]
def footer(c,doc):
 c.setFont('TimesExact',8);c.drawString(M,36,'Solution key: '+doc.solution_url);c.linkURL('https://'+doc.solution_url,(M,34,W-M,44),relative=0)
 c.setFont('TimesExact',9);c.drawCentredString(W/2,24,str(doc.page));c.setFont('TimesExact-Italic',8);c.drawString(M,24,doc.title);c.drawRightString(W-M,24,'Tesselate practice - exact source questions')
 if doc.page>1:
  c.setFont('TimesExact-Bold',10);c.drawString(M,H-25,'PHYS 210 - '+doc.title+' (continued)');c.line(M,H-31,W-M,H-31)

def image_flow(p,s):
 # Keep the textbook's narrow columns close to 12-point printed text;
 # full-width tutorial/homework handouts retain readable original scale.
 w=s['width'];h=s['height'];desired=min(available-24,w/2.81*(1.25 if p['kind']=='textbook' else 1.0))
 scale=min(desired/w,460/h);return Image(str(root/'phys210'/s['src']),width=w*scale,height=h*scale)
for t in data['tests']:
 if '--forecast-only' in sys.argv and t['kind']!='forecast':continue
 story=[Paragraph('<b>PHYS 210 Electricity and Magnetism</b>',center),Paragraph('<b>Celebration of Knowledge!</b>',center),Paragraph(html.escape(t['title'])+' - CK #2 preparation',center),Spacer(1,8)]
 story+=[Paragraph('Name: __________________________________    Date: _______________',body),Paragraph('Time: __________    Marks: __________    Practice paper - not an official exam',body),Paragraph(t.get('instructions') or instructions[t['kind']],body),Paragraph('Write all rough calculations and final answers on separate paper. Show your working.',body),Paragraph('Original source numbering is retained inside each question. Answer the entire cropped question.',small)]
 line=Table([['']],colWidths=[available],rowHeights=[4]);line.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.7,colors.black)]));story.extend([line,Spacer(1,10)])
 for i,id in enumerate(t['ids'],1):
  p=ps[id];images=[image_flow(p,s) for s in p['shots']]
  heading=Paragraph(f'<b>{i}. [____]</b> &nbsp; {html.escape(p["source"])} - Question {html.escape(p["number"])}',question)
  items=[heading]
  if len(images)==2 and images[0].drawWidth+images[1].drawWidth+10<=available-10:
   tbl=Table([[images[0],images[1]]],colWidths=[images[0].drawWidth+5,images[1].drawWidth+5]);tbl.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),5)]));tbl.hAlign='LEFT';items.append(tbl)
  else:
   for im in images:im.hAlign='LEFT';items.extend([im,Spacer(1,4)])
  items.append(Spacer(1,16));story.append(KeepTogether(items))
 doc=SimpleDocTemplate(str(out/t['pdf']),pagesize=(W,H),rightMargin=M,leftMargin=M,topMargin=45,bottomMargin=45,title=t['title'],author='Tesselate',pageCompression=1)
 doc.solution_url='tesselate.ca/phys210/practice-tests/'+t['key']
 doc.build(story,onFirstPage=footer,onLaterPages=footer)
 reader=PdfReader(out/t['pdf']);render_log.append({'id':t['id'],'pages':len(reader.pages),'questions':len(t['ids'])})
for kind,name in [('forecast','most-likely-tests.pdf'),('main','main-tests.pdf'),('bonus','bonus-tests.pdf'),('angle','angle-preparation.pdf'),('supplement','supplementary-tests.pdf')]:
 if '--forecast-only' in sys.argv and kind!='forecast':continue
 writer=PdfWriter()
 for t in data['tests']:
  if t['kind']==kind:writer.append(out/t['pdf'],outline_item=t['title'])
 writer.add_metadata({'/Title':'PHYS 210 - '+kind+' practice papers','/Author':'Tesselate'})
 with (out/name).open('wb') as f:writer.write(f)
(root/'tmp/practice-tests/pdf-layout.json').write_text(json.dumps(render_log,indent=2))
print('Created',len(render_log),'individual papers and',1 if '--forecast-only' in sys.argv else 5,'combined PDFs;',sum(x['pages'] for x in render_log),'pages.')
