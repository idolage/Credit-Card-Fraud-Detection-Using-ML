import React, { useState, useEffect } from "react";
import Axios from "axios";
import Card from "react-bootstrap/Card";
import Accordion from 'react-bootstrap/Accordion';

export default function Table() {
  const legitURL = "http://127.0.0.1:5000/legit";
  const fraudURL = "http://127.0.0.1:5000/fraud";

  const [legitRecords, setLegitRecords] = useState([]);
  const [fraudRecords, setFraudRecords] = useState([]);

useEffect(() => {
  const getLegit = () =>{Axios.get(legitURL)
    .then((res) => {
      const legitData = [];
      if (res.data.response !== null) {
        Object.keys(res.data.response).forEach((key) => {
          const record = { ...res.data.response[key], key };
          legitData.push(record);
        });
        setLegitRecords(legitData);
      }
    })
    .catch((err) => {
      console.log(err);
    });}

    const getFraud = () =>{Axios.get(fraudURL)
      .then((res) => {
        const fraudData = [];
        if (res.data.response !== null) {
          Object.keys(res.data.response).forEach((key) => {
            const record = { ...res.data.response[key], key };
            fraudData.push(record);
          });
          setFraudRecords(fraudData);
        }
      })
      .catch((err) => {
        console.log(err);
      });}

    getLegit();
    getFraud();
  }, []);
  
  return (
    <Card style={{ width: "50vw", padding: "2vw" }}>
      <Card.Title>Transactions</Card.Title>
      <Card.Subtitle className="mb-2 text-muted">
        Legit Transactions
      </Card.Subtitle>
      <Card.Body>
      <Accordion>
      {legitRecords.map((legitRecord,index)=>(
      <Accordion.Item eventKey={index}>
        <Accordion.Header>Transaction No: {legitRecord.key}</Accordion.Header>
        <Accordion.Body>
        <li>Name: {legitRecord.name}</li>
            <li>Address: {legitRecord.address}</li>
            <li>Email: {legitRecord.email}</li>
            <li>Amount: {legitRecord.amount}</li>
            <li>Date: {legitRecord.datetime}</li>
            <li>Category: {legitRecord.category}</li>
            <li>IsFraud: {legitRecord.isFraud}</li>
          </Accordion.Body>
          </Accordion.Item>
        ))}
        </Accordion>
      </Card.Body>
      <Card.Subtitle className="mb-2 text-muted">
        Fradualent Transactions
      </Card.Subtitle>
      <Card.Body>
      <Accordion>
      {fraudRecords.map((fraudRecord,index)=>(
      <Accordion.Item eventKey={index}>
        <Accordion.Header>Transaction No: {fraudRecord.key}</Accordion.Header>
        <Accordion.Body>
        <li>Name: {fraudRecord.name}</li>
            <li>Address: {fraudRecord.address}</li>
            <li>Email: {fraudRecord.email}</li>
            <li>Amount: {fraudRecord.amount}</li>
            <li>Date: {fraudRecord.datetime}</li>
            <li>Category: {fraudRecord.category}</li>
          </Accordion.Body>
          </Accordion.Item>
        ))}
        </Accordion>
      </Card.Body>
    </Card>
  );
}
