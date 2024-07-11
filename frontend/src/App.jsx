import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import InitialView from "./InitialView";
import NextView from "./NextView";
import axios from "axios";

function App() {
  const [textBoxes, setTextBoxes] = useState([""]);
  const [nextView, setNextView] = useState(false);
  const [files, setFiles] = useState({});
  const [fileCount, setFileCount] = useState(1);
  const [apiResponse, setApiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDL, setLoadingDL] = useState(false);
  const endpointGenerate = `${import.meta.env.VITE_API_URL}generate`;
  const endpointDownload = `${import.meta.env.VITE_API_URL}download`;

  const handleNext = async () => {
    setLoading(true);
    const data = textBoxes.map((textBox, index) => ({
      id: index + 1,
      text: textBox,
      files: files[index]
        ? Object.values(files[index]).map((file) => file.name)
        : [],
    }));

    try {
      const response = await axios.post(endpointGenerate, data);
      setApiResponse(response.data.response);
      setNextView(true);
    } catch (error) {
      console.error("Error submitting the form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setNextView(false);
  };

  const addTextBox = () => {
    setTextBoxes([...textBoxes, ""]);
  };

  const removeTextBox = (index) => {
    const newTextBoxes = textBoxes.filter((_, i) => i !== index);
    setTextBoxes(newTextBoxes);
    const newFiles = { ...files };
    delete newFiles[index];
    setFiles(newFiles);
  };

  const handleInputChange = (index, event) => {
    const newTextBoxes = [...textBoxes];
    newTextBoxes[index] = event.target.value;
    setTextBoxes(newTextBoxes);
  };

  const handleFileUpload = (index, file) => {
    const newFiles = { ...files };
    const fileId = `file#${fileCount}`;
    newFiles[index] = { ...newFiles[index], [fileId]: file };
    setFiles(newFiles);
    setFileCount(fileCount + 1);
  };

  const handleTextChange = (event) => {
    const newApiResponse = event.target.value;
    setApiResponse(newApiResponse);
  };

  const handleDownload = async () => {
    setLoadingDL(true);

    const formData = new FormData();
    formData.append("text", apiResponse);

    Object.values(files).forEach((fileGroup) => {
      Object.values(fileGroup).forEach((file) => {
        formData.append("files", file);
      });
    });

    try {
      const response = await axios.post(endpointDownload, formData, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "merged.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading the PDF:", error);
    } finally {
      setLoadingDL(false);
    }
  };

  return (
    <Container>
      {!nextView ? (
        <InitialView
          textBoxes={textBoxes}
          addTextBox={addTextBox}
          removeTextBox={removeTextBox}
          handleInputChange={handleInputChange}
          handleNext={handleNext}
          handleFileUpload={handleFileUpload}
          files={files}
          loading={loading}
        />
      ) : (
        <NextView
          textBoxes={textBoxes}
          handleBack={handleBack}
          apiResponse={apiResponse}
          files={files}
          handleTextChange={handleTextChange}
          loadingDL={loadingDL}
          handleDownload={handleDownload}
        />
      )}
    </Container>
  );
}

export default App;
