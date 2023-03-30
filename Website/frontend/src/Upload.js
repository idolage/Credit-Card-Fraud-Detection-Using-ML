import React, { useState} from 'react';
import Axios from "axios";
import { Form, InputGroup } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import Alert from 'react-bootstrap/Alert';

export default function Upload() {
  const uploadURL = "http://127.0.0.1:5000/uploadFile";
  const [selectedFile, setSelectedFile] = useState(null);
  const [totalRecords, setTotalRecords] = useState(null);
  const [fraudPct, setFraudPct] = useState(null);
  const [fraudNo, setFraudNo] = useState(null);

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', selectedFile);

    Axios.post(uploadURL, formData,{
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then((res) => {
        console.log(res.data);

        const outputContent = atob(res.data.response.files['output']);
        const outputBlob = new Blob([outputContent], { type: 'text/csv;charset=utf-8' });
        const outputUrl = URL.createObjectURL(outputBlob);
        const outputLink = document.createElement('a');
        outputLink.href = outputUrl;
        outputLink.setAttribute('download', 'output.csv');
        outputLink.click();

        const fraudContent = atob(res.data.response.files['fraud']);
        const fraudBlob = new Blob([fraudContent], { type: 'text/csv;charset=utf-8' });
        const fraudUrl = URL.createObjectURL(fraudBlob);
        const fraudLink = document.createElement('a');
        fraudLink.href = fraudUrl;
        fraudLink.setAttribute('download', 'fraud.csv');
        fraudLink.click();

        const legitContent = atob(res.data.response.files['legit']);
        const legitBlob = new Blob([legitContent], { type: 'text/csv;charset=utf-8' });
        const legitUrl = URL.createObjectURL(legitBlob);
        const legitLink = document.createElement('a');
        legitLink.href = legitUrl;
        legitLink.setAttribute('download', 'legit.csv');
        legitLink.click();

        setTotalRecords(res.data.response.total_records);
        setFraudPct(res.data.response.fraud_pct);
        setFraudNo(res.data.response.num_fraud);

      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <>
    <Form style={{width: '40vw', marginRight:'2vw'}}>
      {totalRecords === null? <p></p>:
      <Alert variant={'info'}>
        Total number of fraud transactions: 
        {fraudNo} out of {totalRecords} records ({fraudPct}%)
      </Alert>}
        <h4 class="title">upload file</h4>
        <InputGroup className="mb-3">
        <Form.Control
          aria-describedby="basic-addon2"
          type='file'
          name='file'
          onChange={handleFileSelect}
        />
      </InputGroup>
      <button 
      className="submit-btn" 
      type="button"
      onClick={(e)=>handleSubmit(e)}
      >Upload</button>
    </Form>   
    </>
  );
}
