import React, { useState, useEffect } from "react";
import Axios from "axios";
import Alert from 'react-bootstrap/Alert';
import Form from "react-bootstrap/Form";

export default function Check() {
  const stateURL = "http://127.0.0.1:5000/get_state";
  const categoryURL = "http://127.0.0.1:5000/get_category";
  const cityPopURL = "http://127.0.0.1:5000/get_city_population";
  const checkURL = "http://127.0.0.1:5000/checkTransaction";

  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);

  const [notification, setNotification] = useState(null);


  const [data, setData] = useState({
    amount: "",
    gender: "",
    category: "",
    state: "",
    ccType: "",
    date: "",
    time: ""
  });

  function handle(e) {
    const newdata = { ...data };
    newdata[e.target.id] = e.target.value;
    setData(newdata);
    console.log(newdata);
  }

  async function getPopulation(city) {
    const response = await Axios.post(cityPopURL, {
      city: city,
    });
    return response.data.population;
  }

  function findDayOfWeek(dateString) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date(dateString);
    const dayOfWeek = daysOfWeek[date.getDay()];
    return dayOfWeek;
  }

  function getTimePeriod(time) {
    const hour = parseInt(time.substring(0, 2));
    if (6 <= hour && hour < 12) {
      return "morning";
    } else if (12 <= hour && hour < 13) {
      return "noon";
    } else if (13 <= hour && hour < 18) {
      return "afternoon";
    } else if (18 <= hour && hour < 21) {
      return "evening";
    } else if (21 <= hour && hour < 24) {
      return "night";
    } else {
      return "dawn";
    }
  }

  async function checkTransaction(e){
    e.preventDefault();
    const population = await getPopulation(data.city);
    const dayOfWeek = findDayOfWeek(data.date);
    const timePeriod = getTimePeriod(data.time);
    console.log(
      data.amount,data.gender,population,
      data.category,data.state,data.ccType,
      dayOfWeek, timePeriod, " ************************"
      )
    await Axios.post(checkURL,{
      amount: data.amount,
      gender: data.gender,
      city_pop: population,
      category: data.category,
      state: data.state,
      cc_type: data.ccType,
      day: dayOfWeek,
      time_period: timePeriod
  }).then(res=>{
      setNotification(res.data.response);
  })
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
     <div style={{ display: 'flex', justifyContent: 'center' }}><h3 class="title">Check Transaction</h3></div>
      <div class="row">
        <div class="col">
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
          <div class="inputBox">
            <span>Date :</span>
            <input
              type="date"
              id="date"
              placeholder="John Doe"
              onChange={(e) => handle(e)}
              value={data.date}
            />
          </div>
          <div class="inputBox">
            <span>Time :</span>
            <input
              type="time"
              id="time"
              placeholder="1111-2222-3333-4444"
              onChange={(e) => handle(e)}
              value={data.time}
            />
          </div>
        </div>

        <div class="col">
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
          <br/>
          <div>
            <span>CC Type :</span>
            <select id="ccType" onChange={(e)=>handle(e)} value={data.ccType}>
              <option>Select Card Type</option>
              <option value="Visa">Visa</option>
              <option value="MasterCard">MasterCard</option>
              <option value="American Express">American Express</option>
              <option value="Discover">Discover</option>
              <option value="Diners Club - Carte Blanche">Diners Club - Carte Blanche</option>
              <option value="JCB">JCB</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
      <button 
      className="submit-btn" 
      type="button" 
      onClick={(e)=>checkTransaction(e)}
      >
        Check
      </button>
    </Form>
  )
}
