import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import ExplainView from "./ExplainView";
import FactsView from "./FactsView";
import AppealView from "./AppealView";
import axios from "axios";

function App() {
  const [textBoxes, setTextBoxes] = useState([""]);
  const [currentView, setCurrentView] = useState("explain");
  const [files, setFiles] = useState({});
  const [fileCount, setFileCount] = useState(1);
  const [explanation, setExplanation] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDL, setLoadingDL] = useState(false);
  const endpointGenerateFacts = `${import.meta.env.VITE_API_URL}generate_facts`;
  const endpointGenerate = `${import.meta.env.VITE_API_URL}generate`;
  const endpointDownload = `${import.meta.env.VITE_API_URL}download`;
  const defaultResponse = `James Doe

123 Main Street

Edmunston, NB

E3V 1A1

Dear Sir or Madam,

I object to the assessment of my 2023 income tax return. In July 2023, I moved with my family from Vancouver, BC, to Edmunston, NB, for a new job. During this move, we encountered an unexpected situation where our car overheated, necessitating a side trip to Banff for repairs. As a result, we incurred additional expenses for gas, car repair, lodging, and meals, which I included in my Form T-1, Moving Expenses, on my 2023 income tax return. These expenses were essential and directly related to the move. I have enclosed a copy of my July 23, 2024, notice of reassessment for your reference. 

I would be pleased if you could reconsider the assessment and acknowledge the legitimacy of these necessary expenses.

Statement of Facts:
1. My name is James Doe and I live at 123 Main Street, Edmunston, NB, E3V 1A1.

2. In July 2023, I moved with my family from Vancouver, BC, to Edmunston, NB, for a new job.

3. On my 2023 income tax return, I submitted Form T-1, Moving Expenses, and included a side trip to Banff with the following costs: gas + car repair = $478.75, lodging: $175, meals: $205.50.

4. A side trip to Banff was necessary as a result of my car overheating during the move and needing repair. 

5. As the car was being repaired, my family needed lodging, so we stayed at a local hotel for one night.

6. We also needed meals for the duration of the stop.

7. I object to my 2023 income tax return and enclose a copy of my July 23, 2024, notice of reassessment.

8. Today's date is July 23, 2024.
`;

  const handleFacts = async () => {
    if (explanation == "") {
      setCurrentView("facts");
    } else {
      setLoading(true);
      const data = { text: explanation };
      try {
        const response = await axios.post(endpointGenerateFacts, data);
        const facts = response.data.response;
        setTextBoxes(facts);
        setCurrentView("facts");
      } catch (error) {
        console.error("Error submitting the form:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAppeal = async () => {
    if (textBoxes.length == 1 && textBoxes[0] == "") {
      setApiResponse(defaultResponse);
      setCurrentView("appeal");
    } else {
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
        setCurrentView("appeal");
      } catch (error) {
        console.error("Error submitting the form:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setCurrentView("facts");
  };
  // Explain Page
  const handleExplainTextChange = (event) => {
    const newSetExplanation = event.target.value;
    setExplanation(newSetExplanation);
  };
  // Fact Page
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
  // Appeal Page
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
      {currentView === "explain" && (
        <ExplainView
          handleFacts={handleFacts}
          handleExplainTextChange={handleExplainTextChange}
          loading={loading}
        />
      )}
      {currentView === "facts" && (
        <FactsView
          textBoxes={textBoxes}
          addTextBox={addTextBox}
          removeTextBox={removeTextBox}
          handleInputChange={handleInputChange}
          handleAppeal={handleAppeal}
          handleFileUpload={handleFileUpload}
          files={files}
          loading={loading}
        />
      )}
      {currentView === "appeal" && (
        <AppealView
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
