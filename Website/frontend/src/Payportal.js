import React, { useState, useEffect } from "react";
import Axios from "axios";
import Alert from 'react-bootstrap/Alert';
import Form from "react-bootstrap/Form";
import CCImg from "./clipart.png";

export default function Payportal() {
  const stateURL = "http://127.0.0.1:5000/get_state";
  const categoryURL = "http://127.0.0.1:5000/get_category";
  const ccValidityURL = "http://127.0.0.1:5000/check_cc_validity";
  const cityPopURL = "http://127.0.0.1:5000/get_city_population";
  const saveURL = "http://127.0.0.1:5000/saveTransaction";

  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);

  const [cityPop, setCityPop] = useState();
  const [ccType, setCCType] = useState();
  const [day, setDay] = useState();
  const [timePeriod, setTimePeriod] = useState();
  const [isValid, setIsValid] = useState();
  const [notification, setNotification] = useState(null);

  const [data, setData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    gender: "",
    state: "",
    category: "",
    ccName: "",
    ccNo: "",
    ccCVV: "",
    ccMonth: "",
    ccYear: "",
    amount: "",
  });

  function handle(e) {
    const newdata = { ...data };
    newdata[e.target.id] = e.target.value;
    setData(newdata);
    console.log(newdata);
  }

  async function getPopulation() {
    await Axios.post(cityPopURL, {
      city: data.city,
    }).then((res) => {
      setCityPop(res.data.population);
    });
  }

  async function validateCC() {
    await Axios.post(ccValidityURL, {
      ccName: data.ccName,
      ccNo: data.ccNo,
      ccCVV: data.ccCVV,
      ccMonth: data.ccMonth,
      ccYear: data.ccYear,
    }).then((res) => {
      setIsValid(res.data.isValid);
    });
  }

  function getCardType(ccNum) {
    const visaRegex = /^4[0-9]{12}(?:[0-9]{3})?$/;
    const mastercardRegex = /^5[1-5][0-9]{14}$/;
    const amexRegex = /^3[47][0-9]{13}$/;
    const discoverRegex = /^6(?:011|5[0-9]{2})[0-9]{12}$/;
    const dinersRegex = /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/;
    const jcbRegex = /^(?:2131|1800|35\d{3})\d{11}$/;

    if (visaRegex.test(ccNum)) {
      setCCType("Visa");
    } else if (mastercardRegex.test(ccNum)) {
      setCCType("MasterCard");
    } else if (amexRegex.test(ccNum)) {
      setCCType("American Express");
    } else if (discoverRegex.test(ccNum)) {
      setCCType("Discover");
    } else if (dinersRegex.test(ccNum)) {
      setCCType("Diners Club - Carte Blanche");
    } else if (jcbRegex.test(ccNum)) {
      setCCType("JCB");
    } else {
      setCCType("Other");
    }
  }

  function getTimePeriod() {
    let now = new Date();
    let hour = now.getHours();
    if (6 <= hour && hour < 12) {
      setTimePeriod("morning");
    } else if (12 <= hour && hour < 13) {
      setTimePeriod("noon");
    } else if (13 <= hour && hour < 18) {
      setTimePeriod("afternoon");
    } else if (18 <= hour && hour < 21) {
      setTimePeriod("evening");
    } else if (21 <= hour && hour < 24) {
      setTimePeriod("night");
    } else {
      setTimePeriod("dawn");
    }
  }

  function getDay() {
    let today = new Date();
    let dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });
    setDay(dayOfWeek);
  }

  async function saveTransaction(e){
    e.preventDefault();

    await validateCC();

    if (isValid == true) {
        await getPopulation();
        getCardType(data.ccNo);
        getTimePeriod();
        getDay();

        console.log( data.name,data.email,data.address,
      data.amount,data.gender,cityPop,
      data.category,data.state,ccType,
      day, timePeriod, " ************************"
      )

        await Axios.post(saveURL,{
            name: data.name,
            email: data.email,
            address: data.address,
            amount: data.amount,
            gender: data.gender,
            city_pop: cityPop,
            category: data.category,
            state: data.state,
            cc_type: ccType,
            day: day,
            time_period: timePeriod
        }).then(res=>{
            setNotification(res.data.response);
        })
    } else if(isValid == false) {
        setNotification('Invalid Credit Card!');
    }
  }

  useEffect(() => {
    const getStates = async () => {
      const response = await Axios.get(stateURL);
      setStates(response.data.states);
    };
    const getCategories = async () => {
      const response = await Axios.get(categoryURL);
      setCategories(response.data.categories);
    };
    getStates();
    getCategories();
  }, []);

  return (
    <Form>
      {notification === null? <p></p>:<Alert variant={'info'}>{notification}</Alert>}
     
      <div class="row">
        <div class="col">
          <h3 class="title">billing address</h3>
          <div class="inputBox">
            <span>full name :</span>
            <input
              type="text"
              id="name"
              placeholder="John Doe"
              onChange={(e) => handle(e)}
              value={data.name}
            />
          </div>
          <div class="inputBox">
            <span>email :</span>
            <input
              type="email"
              id="email"
              placeholder="example@example.com"
              onChange={(e) => handle(e)}
              value={data.email}
            />
          </div>
          <div class="inputBox">
            <span>address :</span>
            <input
              type="text"
              id="address"
              placeholder="room - street - locality"
              onChange={(e) => handle(e)}
              value={data.address}
            />
          </div>
          <div class="inputBox">
            <span>city :</span>
            <input 
            type="text" 
            id="city" 
            placeholder="New York"
            onChange={(e) => handle(e)}
            value={data.city}
            />
          </div>
          <br />
          <div>
            <span>gender :</span>
            <select id="gender" onChange={(e)=>handle(e)} value={data.gender}>
            <option>Select Gender</option>
              <option value="F">Female</option>
              <option value="M">Male</option>
            </select>
          </div>
          <br />
          <div>
            <span>state :</span>
            <select id="state" onChange={(e)=>handle(e)} value={data.state}>
            <option>Select State</option>
              {states.map((state) => (
                <option>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <br />
          <div>
            <span>category :</span>
            <select class="category" id="category" onChange={(e)=>handle(e)} value={data.category}>
            <option>Select Category</option>
              {categories.map((category) => (
                <option>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div class="col">
          <h3 class="title">payment</h3>

          <div class="inputBox">
            <span>cards accepted :</span>
            <img src={CCImg} alt="" style={{ transform: "scale(1.5)" }} />
          </div>
          <div class="inputBox">
            <span>name on card :</span>
            <input
              type="text"
              id="ccName"
              placeholder="John Doe"
              onChange={(e) => handle(e)}
              value={data.ccName}
            />
          </div>
          <div class="inputBox">
            <span>credit card number :</span>
            <input
              type="text"
              id="ccNo"
              placeholder="1111-2222-3333-4444"
              onChange={(e) => handle(e)}
              value={data.ccNo}
            />
          </div>
          <div class="inputBox">
            <span>exp month :</span>
            <input 
            type="text" 
            id="ccMonth" 
            placeholder="01"
            onChange={(e) => handle(e)}
            value={data.ccMonth}
             />
          </div>

          <div class="flex">
            <div class="inputBox">
              <span>exp year :</span>
              <input 
              type="text" 
              id="ccYear" 
              placeholder="2022" 
              onChange={(e) => handle(e)}
              value={data.ccYear}
              />
            </div>
            <div class="inputBox">
              <span>CVV :</span>
              <input 
              type="text" 
              id="ccCVV" 
              placeholder="1234"
              onChange={(e) => handle(e)}
              value={data.ccCVV}
               />
            </div>
          </div>

          <div class="inputBox">
            <span>amount :</span>
            <input
              type="number"
              id="amount"
              placeholder="50.00"
              onChange={(e) => handle(e)}
              value={data.amount}
            />
          </div>
        </div>
      </div>
      <button 
      className="submit-btn" 
      type="button" 
      onClick={(e)=>saveTransaction(e)}
      >
        Proceed To Checkout
      </button>
    </Form>
  );
}
