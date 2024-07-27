from PyPDF2 import PdfWriter, PdfReader
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageTemplate, Frame
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from werkzeug.utils import secure_filename
from PIL import Image
import io
import os
import glob
import logging

from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Access environment variables
os.environ["OPENAI_API_KEY"] = os.getenv('API_KEY')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = OpenAI()

def chatgpt(messages, model="gpt-4o-mini"):
    try:
        completion = client.chat.completions.create(
        model=model,
        temperature = 0,
        messages=messages
        )
        return completion.choices[0].message.content
    except Exception as e:
      return str(e)
  
def ask_chatgpt(user_message):
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": f'''Please write the given statement of facts as a legal narrative.
        The text should start with the person's information. If no some of the information is not provided use a placeholder instead.
        Next, write the legal narrative. Call this section Explanation. Start with saying "I object to the assessment" and finish with "I would be pleased". The text within explanation should not be numbered and should be written from the perspective of the person presenting the facts.
        Last, include all the given facts in the begining and number them. Call this section Statement of Facts.
        ---
        Follow this format for the output:
        [Name]
        [Address]
        [Province, Country]
        [Postal Code]

        Dear Sir or Madam,

        [Explanation]
        I object to the assessment of [explain the situation based on statement of facts].
        I would be pleased [Conclude and summarize the situation]

        [Statement of Facts]
        1. Fact#1
        2. Fact#2
        etc.
        ---
        , 
        The given facts are as follows:
        \n{user_message}'''}
    ]
    response = chatgpt(messages)
    return response




UPLOAD_FOLDER = 'uploads'
RESOURCE_FOLDER = 'resources'
DOWNLOAD_FOLDER = 'downloads'

def create_footer(canvas, doc):
    canvas.saveState()
    width, height = letter
    canvas.setStrokeColorRGB(0, 0, 0)
    canvas.setLineWidth(0.5)
    canvas.line(0.5 * inch, 0.75 * inch, width - 0.5 * inch, 0.75 * inch)
    page_number_text = str(canvas.getPageNumber())
    canvas.drawRightString(width - 0.5 * inch, 0.5 * inch, page_number_text)
    canvas.restoreState()

def create_text_pdf(text, filepath, template_path):
    try:
        # Create a PDF with the text content
        packet = io.BytesIO()
        doc = SimpleDocTemplate(packet, pagesize=(letter[0], letter[1]-(2*inch)))
        styles = getSampleStyleSheet()
        story = []
        
        paragraphs = text.split('\n')
        for paragraph in paragraphs:
            story.append(Paragraph(paragraph, styles["Normal"]))
            story.append(Spacer(1, 0.2 * inch))
        
        # doc.build(story)
        doc.build(story, onFirstPage=create_footer, onLaterPages=create_footer)
        
        # Move to the beginning of the BytesIO buffer
        packet.seek(0)
        new_pdf = PdfReader(packet)

        # Read the template PDF
        existing_pdf = PdfReader(open(template_path, "rb"))
        output = PdfWriter()

        # Merge each page of the new pdf with the template page
        for i in range(len(new_pdf.pages)):
            # First page header only
            # template_page = existing_pdf.pages[0] if i == 0 else new_pdf.pages[i]
            # new_page = new_pdf.pages[i]
            # if i == 0:
            #     template_page.merge_page(new_page)
            #     output.add_page(template_page)
            # else:
            #     output.add_page(new_page)
            
            # All pages with header
            template_page = PdfReader(open(template_path, "rb")).pages[0]
            new_page = new_pdf.pages[i]
            template_page.merge_page(new_page)
            output.add_page(template_page)


        # Write the output to a file
        with open(filepath, "wb") as output_stream:
            output.write(output_stream)
    except Exception as e:
        logger.error(f"Error in create_text_pdf: {e}")

def create_index_pdf(text, filepath, template_path):
    try:
        # Create a PDF with the text content
        packet = io.BytesIO()
        doc = SimpleDocTemplate(packet, pagesize=(letter[0], letter[1]-(2*inch)))

        styles = getSampleStyleSheet()
        story = []
        
        paragraphs = text.split('\n')
        for paragraph in paragraphs:
            story.append(Paragraph(paragraph, styles["Normal"]))
            story.append(Spacer(1, 0.2 * inch))
        
        doc.build(story)
        
        # Move to the beginning of the BytesIO buffer
        packet.seek(0)
        new_pdf = PdfReader(packet)

        # Read the template PDF
        existing_pdf = PdfReader(open(template_path, "rb"))
        output = PdfWriter()

        # Merge each page of the new pdf with the template page
        for i in range(len(new_pdf.pages)):
            # First page header only
            # template_page = existing_pdf.pages[0] if i == 0 else new_pdf.pages[i]
            # new_page = new_pdf.pages[i]
            # if i == 0:
            #     template_page.merge_page(new_page)
            #     output.add_page(template_page)
            # else:
            #     output.add_page(new_page)
            
            # All pages with header
            template_page = PdfReader(open(template_path, "rb")).pages[0]
            new_page = new_pdf.pages[i]
            template_page.merge_page(new_page)
            output.add_page(template_page)

        # Write the output to a file
        with open(filepath, "wb") as output_stream:
            output.write(output_stream)
    except Exception as e:
        logger.error(f"Error in create_text_pdf: {e}")

def make_pdf(api_response, files):
    try:
        # Save uploaded files
        saved_files = save_files(files)

        # Create API response PDF
        template_path = os.path.join(RESOURCE_FOLDER, 'template.pdf')
        response_pdf_path = os.path.join(UPLOAD_FOLDER, 'response.pdf')
        create_text_pdf(api_response, response_pdf_path, template_path)
        

        # Calculate the number of pages in the API response PDF
        response_pdf = PdfReader(response_pdf_path)
        num_response_pages = len(response_pdf.pages)

        # Create index page PDF
        index_text = "Index of Files:\n\n"
        current_page = num_response_pages + 2 
        for i, file in enumerate(saved_files):
            index_text += f"{i + 1}. {os.path.basename(file)} starts at page {current_page}\n"
            reader = PdfReader(file)
            current_page += len(reader.pages)

        index_pdf_path = os.path.join(UPLOAD_FOLDER, 'index.pdf')
        create_index_pdf(index_text, index_pdf_path, template_path)

        output_pdf = PdfWriter()

        # Add response PDF to output
        response_pdf = PdfReader(response_pdf_path)
        for page in response_pdf.pages:
            output_pdf.add_page(page)

        if saved_files:
            # Add index PDF to output
            index_pdf = PdfReader(index_pdf_path)
            for page in index_pdf.pages:
                output_pdf.add_page(page)

            # Add saved files to output
            for filepath in saved_files:
                reader = PdfReader(filepath)
                for page in reader.pages:
                    output_pdf.add_page(page)

            clean_uploads()

        # Save the final combined PDF
        output_path = os.path.join(DOWNLOAD_FOLDER, "merged.pdf")
        with open(output_path, "wb") as output_file:
            output_pdf.write(output_file)

        return output_path
    
    except Exception as e:
        logger.error(f"Error in make_pdf: {e}")
        return None
    
def save_files(files):
    saved_files = []
    for file in files:
            filename = secure_filename(file.filename)
            if filename.endswith('.pdf'):
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                saved_files.append(filepath)
            elif filename.endswith('.png') or filename.endswith('.jpg'):
                image = Image.open(file)
                image = image.resize([int(letter[0]), int(letter[1])])
                pdf_filename = f"{os.path.splitext(filename)[0]}.pdf"
                pdf_filepath = os.path.join(UPLOAD_FOLDER, pdf_filename)
                image.convert('RGB').save(pdf_filepath, 'PDF')
                saved_files.append(pdf_filepath)
            else:
                continue
    return saved_files

def clean_uploads():
    files = glob.glob(UPLOAD_FOLDER+"/*")
    for f in files:
        os.remove(f)
