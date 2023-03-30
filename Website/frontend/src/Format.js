import React, { useState } from "react";
import Axios from "axios";
import { Form, InputGroup } from "react-bootstrap";
import { saveAs } from "file-saver";
import Alert from "react-bootstrap/Alert";

export default function Format() {
  const uploadURL = "http://127.0.0.1:5000/formatFile";
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", selectedFile);

    Axios.post(uploadURL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => {
        console.log(res.data);

        const outputContent = atob(res.data.response.files["processed"]);
        const outputBlob = new Blob([outputContent], {
          type: "text/csv;charset=utf-8",
        });
        const outputUrl = URL.createObjectURL(outputBlob);
        const outputLink = document.createElement("a");
        outputLink.href = outputUrl;
        outputLink.setAttribute("download", "processed.csv");
        outputLink.click();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Form>
      <h4 class="title">Format files</h4>
      <p>Perform reverse one-hot encoding to increase readability</p>
      <InputGroup className="mb-3">
        <Form.Control aria-describedby="basic-addon2" type="file" name="file" onChange={handleFileSelect}/>
      </InputGroup>
      <button className="submit-btn" type="button" onClick={(e)=>handleSubmit(e)}>
        Upload
      </button>
    </Form>
  );
}
