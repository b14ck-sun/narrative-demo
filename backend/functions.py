from PyPDF2 import PdfWriter, PdfReader
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from werkzeug.utils import secure_filename
import io
import os
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

def chatgpt(messages, model="gpt-4o"):
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
        {"role": "user", "content": f"Please write the following statement of facts as a legal narrative.\n{user_message}"}
    ]
    response = chatgpt(messages)
    return response




UPLOAD_FOLDER = 'uploads'

def create_text_pdf(text, filepath):
    try:
        packet = io.BytesIO()
        doc = SimpleDocTemplate(packet, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        paragraphs = text.split('\n')
        for paragraph in paragraphs:
            story.append(Paragraph(paragraph, styles["Normal"]))
            story.append(Spacer(1, 0.2 * inch))

        doc.build(story)
        packet.seek(0)
        with open(filepath, 'wb') as f:
            f.write(packet.read())
    except Exception as e:
        logger.error(f"Error in create_pdf: {e}")

def make_pdf(api_response, files):
    try:
        # Save uploaded files
        saved_files = []
        for file in files:
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            saved_files.append(filepath)

        # Create API response PDF
        response_pdf_path = os.path.join(UPLOAD_FOLDER, 'response.pdf')
        create_text_pdf(api_response, response_pdf_path)

        # Calculate the number of pages in the API response PDF
        response_pdf = PdfReader(response_pdf_path)
        num_response_pages = len(response_pdf.pages)

        # Create index page PDF
        index_text = "Index of Files:\n\n"
        current_page = num_response_pages + 2  # Starting page number after the response PDF
        for i, file in enumerate(saved_files):
            index_text += f"{i + 1}. {os.path.basename(file)} starts at page {current_page}\n"
            reader = PdfReader(file)
            current_page += len(reader.pages)

        index_pdf_path = os.path.join(UPLOAD_FOLDER, 'index.pdf')
        create_text_pdf(index_text, index_pdf_path)

        output_pdf = PdfWriter()

        # Add response PDF to output
        response_pdf = PdfReader(response_pdf_path)
        for page in response_pdf.pages:
            output_pdf.add_page(page)

        # Add index PDF to output
        index_pdf = PdfReader(index_pdf_path)
        for page in index_pdf.pages:
            output_pdf.add_page(page)

        # Add saved files to output
        for filepath in saved_files:
            reader = PdfReader(filepath)
            for page in reader.pages:
                output_pdf.add_page(page)
            os.remove(filepath)

        # Delete the response and index PDFs after merging
        os.remove(response_pdf_path)
        os.remove(index_pdf_path)

        # Save the final combined PDF
        output_path = os.path.join(UPLOAD_FOLDER, "merged.pdf")
        with open(output_path, "wb") as output_file:
            output_pdf.write(output_file)

        return output_path
    
    except Exception as e:
        logger.error(f"Error in make_pdf: {e}")
        return None
